// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
    "done.invoke.tasks.syncing:invocation[0]": {
      type: "done.invoke.tasks.syncing:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.after(1000)#tasks.synced": {
      type: "xstate.after(1000)#tasks.synced";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    syncOfflineQueue: "done.invoke.tasks.syncing:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    TODO: "RETRY_SYNC" | "done.invoke.tasks.syncing:invocation[0]";
    applyChange: "CHANGE";
    applyOfflineChanges: "";
    pushToOfflineQueue: "CHANGE";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isOnline: "" | "RETRY_SYNC";
    offlineQueueIsNotEmpty: "" | "ONLINE";
  };
  eventsCausingServices: {
    syncOfflineQueue: "" | "ONLINE" | "RETRY_SYNC";
  };
  matchesStates:
    | "beforeNormalSyncing"
    | "error"
    | "initializing"
    | "ready"
    | "synced"
    | "syncing";
  tags: never;
}
