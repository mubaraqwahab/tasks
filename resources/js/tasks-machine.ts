import { createMachine, assign } from "xstate";
import { log } from "xstate/lib/actions";
import { Task, TaskChange } from "@/types";

export const tasksMachine = createMachine(
  {
    id: "tasks",
    initial: "initializing",
    states: {
      initializing: {
        always: [
          {
            target: "beforeNormalSyncing",
            cond: "offlineQueueIsNotEmpty",
            actions: "applyOfflineChanges",
          },
          {
            target: "ready",
          },
        ],
      },
      beforeNormalSyncing: {
        always: [
          {
            target: "syncing",
            cond: "isOnline",
          },
          {
            target: "ready",
          },
        ],
      },
      syncing: {
        invoke: {
          src: "syncOfflineQueue",
          onDone: [
            {
              target: "synced",
              actions: "TODO",
            },
          ],
          onError: [
            {
              target: "error",
            },
          ],
        },
      },
      ready: {
        on: {
          CHANGE: {
            target: "beforeNormalSyncing",
            actions: ["applyChange", "pushToOfflineQueue"],
          },
          ONLINE: {
            target: "syncing",
            cond: "offlineQueueIsNotEmpty",
          },
        },
      },
      error: {
        on: {
          RETRY_SYNC: [
            {
              target: "syncing",
              cond: "isOnline",
            },
            {
              actions: "TODO",
            },
          ],
          DISCARD_UNSYNCABLE_CHANGES: {
            target: "ready",
          },
        },
      },
      synced: {
        after: {
          "1000": {
            target: "#tasks.ready",
            actions: [],
            internal: false,
          },
        },
      },
    },
    on: {
      CHANGE: {
        actions: ["applyChange", "pushToOfflineQueue"],
      },
    },
    tsTypes: {} as import("./tasks-machine.typegen").Typegen0,
    schema: {
      context: {} as { tasks: Task[] },
      events: {} as
        | { type: "CHANGE"; data: TaskChange }
        | { type: "RETRY_SYNC" }
        | { type: "DISCARD_UNSYNCABLE_CHANGES" }
        | { type: "ONLINE" },
      services: {} as {
        syncOfflineChanges: {
          data: {
            status: Record<string, "ok" | "error">;
          };
        };
      },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      applyChange: assign({
        tasks: (context, event) => {
          const change = event.data;
          return applyChange(context.tasks, change);
        },
      }),
      applyOfflineChanges: assign({
        tasks: (context) => {
          const queue = getOfflineQueue();
          const updatedTasks = queue.reduce(applyChange, context.tasks);
          return updatedTasks;
        },
      }),
      pushToOfflineQueue: (context, event) => {
        setOfflineQueue((queue) => [...queue, event.data]);
      },
      TODO: log("TODO"),
    },
    guards: {
      isOnline: () => navigator.onLine,
      offlineQueueIsNotEmpty: () => {
        const queue = getOfflineQueue();
        return queue.length !== 0;
      },
    },
    services: {
      syncOfflineQueue: (context, event) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const random = Math.round(Math.random() * 10);
            if (random % 2) {
              resolve(
                Object.fromEntries(
                  context.tasks.map((t, i) => [t.id, i % 0 ? "ok" : "error"])
                )
              );
            } else {
              reject(new TypeError("Network wahala"));
            }
          }, 2000);
        });
      },
    },
  }
);

function getOfflineQueue(): TaskChange[] {
  const queueAsJSON = localStorage.getItem("taskChangeQueue") || "[]";
  return JSON.parse(queueAsJSON) as TaskChange[];
}

function setOfflineQueue(updaterFn: (queue: TaskChange[]) => TaskChange[]) {
  const queue = getOfflineQueue();
  const updatedQueue = updaterFn(queue);
  const updatedQueueAsJSON = JSON.stringify(updatedQueue);
  localStorage.setItem("taskChangeQueue", updatedQueueAsJSON);
}

function applyChange(tasks: Task[], change: TaskChange): Task[] {
  if (change.type === "create") {
    return [
      ...tasks,
      {
        id: change.taskId,
        name: change.taskName,
        created_at: change.timestamp,
        completed_at: null,
        edited_at: null,
      },
    ];
  } else {
    throw new Error();
  }
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.getq = getOfflineQueue;
  // @ts-ignore
  window.setq = setOfflineQueue;
}
