interface Model {
  id: number | string;
  created_at: string; // | null;
  // I'm not using this on the client side for now.
  // updated_at: string | null
}

export interface User extends Model {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

export interface Task extends Model {
  id: string;
  name: string;
  // user_id: User["id"];
  edited_at: string | null;
  completed_at: string | null;
}

export type TaskChange = CreateTaskChange | EditTaskChange | OtherTaskChange;

interface CreateTaskChange extends BaseTaskChange {
  type: "create";
  task_name: string;
}

interface EditTaskChange extends BaseTaskChange {
  type: "edit";
  task_id: string;
  task_name: string;
}

interface OtherTaskChange extends BaseTaskChange {
  type: "complete" | "uncomplete" | "delete";
}

interface BaseTaskChange extends Model {
  id: string;
  type: string;
  task_id: Task["id"];
  error?: string;
}
