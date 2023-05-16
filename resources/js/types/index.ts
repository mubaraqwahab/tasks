import type { User } from "@/types/models";

interface TaskLiEvent {
  type: string;
  taskId: string;
}

export interface CompleteTaskLiEvent extends TaskLiEvent {
  type: "complete";
}

export interface EditTaskLiEvent extends TaskLiEvent {
  type: "edit";
  taskName: string;
}

export interface DeleteTaskLiEvent extends TaskLiEvent {
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
