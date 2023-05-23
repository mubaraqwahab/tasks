import type { User } from "@/types/models";

interface TaskLiEvent {
  type: string;
  taskId: string;
}

export interface ToggleTaskLiEvent extends TaskLiEvent {
  type: "toggle";
  completed: boolean;
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

export interface Paginator<T> {
  data: T[];
  next_page_url: string | null;
  // There other props, but I don't need them
}
