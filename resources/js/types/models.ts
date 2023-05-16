// Would be nice to be able to auto-generate these types
// from the Laravel migrations and models

interface Model {
  id: number | string;
  created_at: string | null;
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
  // user: User;
  edited_at: string | null;
  completed_at: string | null;
}

export type TaskChange =
  | CreateTaskChange
  | EditTaskChange
  | NonCreateTaskChange;

interface CreateTaskChange extends BaseTaskChange {
  type: "create";
  task_name: string;
}

interface EditTaskChange extends BaseTaskChange {
  type: "edit";
  task_id: string;
  task_name: string;
}

interface NonCreateTaskChange extends BaseTaskChange {
  type: "complete" | "delete";
}

interface BaseTaskChange extends Model {
  id: string;
  type: string;
  task_id: Task["id"];
  lastError?: string;
}
