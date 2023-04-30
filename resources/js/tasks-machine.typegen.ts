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
    "xstate.after(1000)#tasks.allSynced": {
      type: "xstate.after(1000)#tasks.allSynced";
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
    TODO: "RETRY_SYNC";
    applyChange: "CHANGE";
    applyOfflineChanges: "";
    pushToOfflineQueue: "CHANGE";
    updateOfflineQueueWithSyncResult: "done.invoke.tasks.syncing:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isOnline: "" | "RETRY_SYNC";
    offlineQueueIsEmpty: "";
    offlineQueueIsNotEmpty: "ONLINE";
  };
  eventsCausingServices: {
    syncOfflineQueue: "" | "ONLINE" | "RETRY_SYNC";
  };
  matchesStates:
    | "afterSyncing"
    | "allSynced"
    | "beforeSyncing"
    | "error"
    | "initializing"
    | "ready"
    | "ready.normal"
    | "ready.someFailedToSync"
    | "syncing"
    | { ready?: "normal" | "someFailedToSync" };
  tags: never;
}
