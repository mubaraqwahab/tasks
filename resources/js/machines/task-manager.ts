import { createMachine, assign, ActorRefFrom, spawn } from "xstate";
import { Task, TaskChange } from "@/types/models";
import axios, { AxiosError } from "axios";
import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { Paginator } from "../types";
import { paginatorMachine } from "./task-paginator";
import { useOnline } from "@/utils";

type SyncErrorStatus = {
  type: "error";
  error: string;
};

type SyncResponseData = {
  syncStatus: Record<string, { type: "ok" | "duplicate" } | SyncErrorStatus>;
};

type PaginatorRef = ActorRefFrom<typeof paginatorMachine>;

// TODOs:
// * try syncing when a change occurs in the passiveError state
// * consider delaying the next sync by a few milliseconds in the above situation
// * temporarily disable auto-retries

// Visualize at https://stately.ai/registry/editor/6db2346c-934c-4158-a0f2-c0d70a3076e7?machineId=bb219001-6bcc-46ef-b325-f48b5f95c317&mode=Design
export function createTasksMachine(
  upcomingPaginator: Paginator<Task>,
  completedPaginator: Paginator<Task>
) {
  return createMachine(
    {
      id: "taskManager",
      entry: "spawnPaginatorMachines",
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
        normal: {
          initial: "idle",
          states: {
            allSynced: {
              after: {
                "500": {
                  target: "#taskManager.normal.idle",
                  actions: [],
                  internal: false,
                },
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
                    target: "passiveError",
                    cond: "isNetworkError",
                  },
                  {
                    target: "#taskManager.normal.passiveError.server",
                    cond: "isServerError",
                  },
                  {
                    target: "#taskManager.normal.passiveError.unknown",
                  },
                ],
              },
            },
            afterSyncing: {
              entry: "updateChangelogWithSyncResult",
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
            passiveError: {
              initial: "network",
              states: {
                network: {},
                server: {},
                unknown: {
                  entry: "setUnknownError",
                  exit: "clearUnknownError",
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
            beforeSyncing: {
              always: {
                target: "syncing",
                cond: "isOnline",
              },
            },
            idle: {
              always: {
                target: "beforeSyncing",
                cond: "changelogIsNotEmpty",
              },
              on: {
                online: {
                  target: "idle",
                  internal: false,
                },
              },
            },
          },
          on: {
            change: {
              actions: ["pushToChangelog", "applyLastChange"],
            },
            loadedMore: {
              actions: "pushLoadedTasks",
              description:
                "This event will be sent by the spawned paginator actors",
            },
          },
        },
      },
      schema: {
        context: {} as {
          tasks: Task[];
          changelog: TaskChange[];
          unknownError: AxiosError | null;
          upcomingPaginatorRef: PaginatorRef | null;
          completedPaginatorRef: PaginatorRef | null;
        },
        events: {} as
          | { type: "change"; changeType: "create"; taskName: string }
          | {
              type: "change";
              changeType: "edit";
              taskId: string;
              taskName: string;
            }
          | {
              type: "change";
              changeType: Exclude<TaskChange["type"], "create" | "edit">;
              taskId: string;
            }
          | { type: "discardFailed" }
          | { type: "retrySync" }
          | { type: "online" }
          | { type: "offline" }
          | { type: "loadedMore"; tasks: Task[] },
        services: {} as {
          syncChangelog: {
            data: SyncResponseData;
          };
        },
      },
      context: {
        tasks: upcomingPaginator.data.concat(completedPaginator.data),
        changelog: getOfflineChangelog(),
        unknownError: null,
        upcomingPaginatorRef: null,
        completedPaginatorRef: null,
      },
      tsTypes: {} as import("./task-manager.typegen").Typegen0,
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
                : event.changeType === "edit"
                ? {
                    type: event.changeType,
                    task_id: event.taskId,
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
              .filter((change) => syncStatus[change.id]?.type === "error")
              .map((change) => ({
                ...change,
                error: (syncStatus[change.id] as SyncErrorStatus).error,
              }));
          },
        }),
        discardFailedChanges: assign({
          changelog(context) {
            return context.changelog.filter((change) => !change.error);
          },
        }),
        reload: () => {
          window.location.reload();
        },
        setUnknownError: assign({
          unknownError(_, event) {
            return event.data as AxiosError;
          },
        }),
        clearUnknownError: assign({ unknownError: null }),
        spawnPaginatorMachines: assign({
          upcomingPaginatorRef() {
            return spawn(
              paginatorMachine.withContext({
                pagePropKey: "upcomingPaginator",
                nextPageURL: upcomingPaginator.next_page_url,
              })
            );
          },
          completedPaginatorRef() {
            return spawn(
              paginatorMachine.withContext({
                pagePropKey: "completedPaginator",
                nextPageURL: completedPaginator.next_page_url,
              })
            );
          },
        }),
        pushLoadedTasks: assign({
          tasks(context, event) {
            return context.tasks.concat(event.tasks);
          },
        }),
      },
      guards: {
        changelogIsNotEmpty: (context) => !!context.changelog.length,
        changelogContainsFailedChanges: (context) =>
          context.changelog.some((change) => !!change.error),
        isNetworkError: (_, event) =>
          (event.data as AxiosError).code === "ERR_NETWORK",
        isServerError: (_, event) => (
          console.log(event),
          (event.data as AxiosError).code === "ERR_BAD_RESPONSE"
        ),
        isOnline: () => navigator.onLine,
      },
      services: {
        async syncChangelog(context) {
          const response = await axios.post<SyncResponseData>(
            route("taskchanges.sync"),
            context.changelog
          );
          return response.data;
        },
      },
    }
  );
}

function applyChange(tasks: Task[], change: TaskChange): Task[] {
  if (change.type === "create") {
    // Don't recreate an existing task. Strange though that
    // it's possible to do so.
    if (tasks.some((task) => task.id === change.task_id)) {
      console.log("Skipping 'create' change", change);
      return tasks;
    }
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
  } else if (change.type === "uncomplete") {
    return tasks.map((task) =>
      task.id === change.task_id ? { ...task, completed_at: null } : task
    );
  } else if (change.type === "edit") {
    return tasks.map((task) =>
      task.id === change.task_id ? { ...task, name: change.task_name } : task
    );
  } else if (change.type === "delete") {
    return tasks.filter((task) => task.id !== change.task_id);
  } else {
    // This should never happen in prod right?
    throw new Error(`Unrecognized change type: ${change.type}`);
  }
}

function getOfflineChangelog(): TaskChange[] {
  const changelogAsJSON = localStorage.getItem("taskChangelog") || "[]";
  // Note: if the persisted changelog isn't an array of task changes,
  // or not an array at all, then someone must have tampered with it.
  // Don't defend against such a situation on the client side.
  return JSON.parse(changelogAsJSON) as TaskChange[];
}

export function useTasksMachine(
  upcomingPaginator: Paginator<Task>,
  completedPaginator: Paginator<Task>
) {
  const [state, send, actor] = useMachine(() =>
    createTasksMachine(upcomingPaginator, completedPaginator)
  );

  useEffect(() => {
    localStorage.setItem(
      "taskChangelog",
      JSON.stringify(state.context.changelog)
    );

    if (import.meta.env.DEV) {
      console.log("Offline changelog", getOfflineChangelog());
    }
  }, [state.context.changelog]);

  const isOnline = useOnline();

  useEffect(() => {
    // NOTE: this sends an (unnecessary) online event on the first render.
    // If that's ever a problem, you can avoid sending on the first render.
    send({ type: isOnline ? "online" : "offline" });
  }, [isOnline]);

  // For debugging
  useEffect(() => {
    // @ts-ignore
    window.$tasksActor;
    return () => {
      // @ts-ignore
      delete window.$tasksActor;
    };
  }, [actor]);

  return [state, send, actor] as ReturnType<
    typeof useMachine<ReturnType<typeof createTasksMachine>>
  >;
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.$getOfflineChangelog = getOfflineChangelog;
}
