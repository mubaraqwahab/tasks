import { createMachine, assign } from "xstate";
import { Task, TaskChange } from "@/types/models";
import axios, { AxiosError } from "axios";

type SyncErrorStatus = {
  type: "error";
  error: string;
};

type SyncResponseData = {
  syncStatus: Record<string, { type: "ok" | "duplicate" } | SyncErrorStatus>;
};

// Visualize at https://stately.ai/registry/editor/6db2346c-934c-4158-a0f2-c0d70a3076e7?machineId=bb219001-6bcc-46ef-b325-f48b5f95c317&mode=Design
export const tasksMachine = createMachine(
  {
    id: "taskManager",
    initial: "initializing",
    states: {
      someFailedToSync: {
        description: "Modal state",
        on: {
          discardFailed: {
            target: "reloading",
            actions: "discardFailedChanges",
          },
        },
      },
      normal: {
        initial: "idle",
        states: {
          idle: {
            always: {
              target: "syncing",
              cond: "changelogIsNotEmpty",
            },
          },
          syncing: {
            invoke: {
              src: "syncChangelog",
              onDone: [
                {
                  target: "afterSyncing",
                },
              ],
              onError: [
                {
                  target: "temporaryError",
                  cond: "isNetworkError",
                },
                {
                  target: "#taskManager.normal.temporaryError.serverError",
                  cond: "isServerError",
                },
                {
                  target: "#taskManager.normal.temporaryError.unknownError",
                },
              ],
            },
          },
          afterSyncing: {
            entry: ["updateChangelogWithSyncResult", "resetAutoRetryCount"],
            always: [
              {
                target: "#taskManager.someFailedToSync",
                cond: "changelogContainsFailedChanges",
              },
              {
                target: "allSynced",
              },
            ],
          },
          allSynced: {
            after: {
              "3000": {
                target: "#taskManager.normal.idle",
                actions: [],
                internal: false,
              },
            },
          },
          temporaryError: {
            after: {
              "10000": {
                target: "#taskManager.normal.syncing",
                cond: "maxAutoRetryCountNotReached",
                actions: ["incrementAutoRetryCount"],
                internal: false,
              },
            },
            initial: "networkError",
            states: {
              networkError: {},
              serverError: {},
              unknownError: {
                entry: "setError",
                exit: "resetError",
              },
            },
            on: {
              retrySync: {
                target: "syncing",
              },
              online: {
                target: "syncing",
              },
            },
          },
        },
        on: {
          change: {
            target: "normal",
            actions: ["pushToChangelog", "applyLastChange"],
            internal: false,
          },
        },
      },
      initializing: {
        description:
          "The machine applies any existing offline changes to the task list in this state. The changes will be passed to the machine through context, so the machine never directly interacts with  localStorage",
        entry: "applyOfflineChanges",
        always: {
          target: "normal",
        },
      },
      reloading: {
        entry: "reload",
        type: "final",
      },
    },
    schema: {
      context: {} as {
        tasks: Task[];
        changelog: TaskChange[];
        autoRetryCount: number;
        error: unknown;
      },
      events: {} as
        | { type: "change"; changeType: "create"; taskName: string }
        | {
            type: "change";
            changeType: Exclude<TaskChange["type"], "create">;
            taskId: string;
          }
        | { type: "discardFailed" }
        | { type: "retrySync" }
        | { type: "online" },
      services: {} as {
        syncChangelog: {
          data: SyncResponseData;
        };
      },
    },
    context: {
      tasks: [],
      changelog: [],
      autoRetryCount: 0,
      error: null,
    },
    tsTypes: {} as import("./tasks-machine.typegen").Typegen0,
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      applyOfflineChanges: assign({
        tasks(context) {
          return context.changelog.reduce(applyChange, context.tasks);
        },
      }),
      applyLastChange: assign({
        tasks(context) {
          return applyChange(context.tasks, context.changelog.at(-1)!);
        },
      }),
      pushToChangelog: assign({
        changelog(context, event) {
          const change = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            ...(event.changeType === "create"
              ? {
                  type: event.changeType,
                  task_id: crypto.randomUUID(),
                  task_name: event.taskName,
                }
              : {
                  type: event.changeType,
                  task_id: event.taskId,
                }),
          };
          return context.changelog.concat(change);
        },
      }),
      updateChangelogWithSyncResult: assign({
        changelog(context, event) {
          const { syncStatus } = event.data;
          return context.changelog
            .filter((change) => syncStatus[change.id].type === "error")
            .map((change) => ({
              ...change,
              lastError: (syncStatus[change.id] as SyncErrorStatus).error,
            }));
        },
      }),
      discardFailedChanges: assign({
        changelog(context) {
          return context.changelog.filter((change) => !!change.lastError);
        },
      }),
      reload: () => {
        window.location.reload();
      },
      resetAutoRetryCount: assign({ autoRetryCount: 0 }),
      incrementAutoRetryCount: assign({
        autoRetryCount(context) {
          return context.autoRetryCount + 1;
        },
      }),
      setError: assign({
        error(_, event) {
          return event.data;
        },
      }),
      resetError: assign({ error: null }),
    },
    guards: {
      changelogIsNotEmpty: (context) => !!context.changelog.length,
      changelogContainsFailedChanges: (context) =>
        context.changelog.some((change) => !!change.lastError),
      isNetworkError: (_, event) =>
        (event.data as AxiosError).code === "ERR_NETWORK",
      isServerError: (_, event) => (
        console.log(event),
        (event.data as AxiosError).code === "ERR_BAD_RESPONSE"
      ),
      maxAutoRetryCountNotReached: (context) => context.autoRetryCount < 2,
    },
    services: {
      async syncChangelog(context) {
        const response = await axios.post<SyncResponseData>(
          "/api/sync",
          context.changelog
        );
        return response.data;
      },
    },
  }
);

function applyChange(tasks: Task[], change: TaskChange): Task[] {
  if (change.type === "create") {
    return [
      ...tasks,
      {
        id: change.task_id,
        name: change.task_name,
        created_at: change.created_at,
        completed_at: null,
        edited_at: null,
      },
    ];
  } else if (change.type === "complete") {
    return tasks.map((task) =>
      task.id === change.task_id
        ? { ...task, completed_at: change.created_at }
        : task
    );
  } else if (change.type === "delete") {
    return tasks.filter((task) => task.id !== change.task_id);
  } else {
    // TODO: is this the best you can do?
    throw new Error();
  }
}
