import { createMachine, assign, ActorRefFrom, spawn } from "xstate";
import { Task, TaskChange } from "@/types/models";
import axios, { AxiosError } from "axios";
import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import { Paginator } from "../types";
import { paginatorMachine } from "./task-paginator";

type SyncErrorStatus = {
  type: "error";
  error: string;
};

type SyncResponseData = {
  syncStatus: Record<string, { type: "ok" | "duplicate" } | SyncErrorStatus>;
};

type PaginatorRef = ActorRefFrom<typeof paginatorMachine>;

// Visualize at https://stately.ai/registry/editor/6db2346c-934c-4158-a0f2-c0d70a3076e7?machineId=bb219001-6bcc-46ef-b325-f48b5f95c317&mode=Design
export function createTasksMachine(
  upcomingPaginator: Paginator<Task>,
  completedPaginator: Paginator<Task>
) {
  return createMachine(
    {
      id: "taskManager",
      states: {
        tasks: {
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
              initial: "allSynced",
              states: {
                allSynced: {
                  always: {
                    target: "syncing",
                    cond: "changelogIsNotEmpty",
                  },
                  on: {
                    online: {},
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
                        target: "#taskManager.tasks.normal.passiveError.server",
                        cond: "isServerError",
                      },
                      {
                        target:
                          "#taskManager.tasks.normal.passiveError.unknown",
                      },
                    ],
                  },
                },
                afterSyncing: {
                  entry: [
                    "updateChangelogWithSyncResult",
                    "resetAutoRetryCount",
                  ],
                  always: [
                    {
                      target: "#taskManager.tasks.someFailedToSync",
                      cond: "changelogContainsFailedChanges",
                    },
                    {
                      target: "allSynced",
                    },
                  ],
                },
                passiveError: {
                  after: {
                    "10000": {
                      target: "#taskManager.tasks.normal.syncing",
                      cond: "maxAutoRetryCountNotReached",
                      actions: ["incrementAutoRetryCount"],
                      internal: false,
                    },
                  },
                  initial: "network",
                  states: {
                    network: {},
                    server: {},
                    unknown: {
                      entry: "setError",
                      exit: "clearError",
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
                  actions: ["pushToChangelog", "applyLastChange"],
                },
                loadedMore: {
                  actions: "pushLoadedTasks",
                  description:
                    "This event will be sent from the spawned paginator machines",
                },
              },
            },
          },
        },
        network: {
          initial: "online",
          states: {
            online: {
              on: {
                offline: {
                  target: "offline",
                },
              },
            },
            offline: {
              on: {
                online: {
                  target: "online",
                },
              },
            },
          },
        },
      },
      type: "parallel",
      schema: {
        context: {} as {
          tasks: Task[];
          changelog: TaskChange[];
          autoRetryCount: number;
          syncError: AxiosError | null;
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
        autoRetryCount: 0,
        syncError: null,
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
              .filter((change) => syncStatus[change.id].type === "error")
              .map((change) => ({
                ...change,
                lastError: (syncStatus[change.id] as SyncErrorStatus).error,
              }));
          },
        }),
        discardFailedChanges: assign({
          changelog(context) {
            return context.changelog.filter((change) => !change.lastError);
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
          syncError(_, event) {
            return event.data as AxiosError;
          },
        }),
        clearError: assign({ syncError: null }),
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
  if (typeof window === "undefined") return [];

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
  const [state, send, ...rest] = useMachine(() =>
    createTasksMachine(upcomingPaginator, completedPaginator)
  );

  if (typeof window !== "undefined") {
    localStorage.setItem(
      "taskChangelog",
      JSON.stringify(state.context.changelog)
    );
  }

  console.log("Offline changelog", getOfflineChangelog());

  useEffect(() => {
    const handleOnline = () => send({ type: "online" });
    const handleOffline = () => send({ type: "offline" });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return [state, send, ...rest] as ReturnType<
    typeof useMachine<ReturnType<typeof createTasksMachine>>
  >;
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.getOfflineChangelog = getOfflineChangelog;
}
