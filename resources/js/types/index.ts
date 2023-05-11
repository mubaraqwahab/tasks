import type { User } from "@/types/models";

interface TaskLiEvent {
  type: string;
  taskId: string;
}

export interface CompleteTaskEvent extends TaskLiEvent {
  type: "complete";
}

export interface DeleteTaskEvent extends TaskLiEvent {
  type: "delete";
}

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = T & {
  auth: {
    user: User;
    csrfToken: string;
  };
};
