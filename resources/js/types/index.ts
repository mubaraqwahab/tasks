// Would be nice to be able to auto-generate these types
// from the Laravel migrations and models

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

interface Model {
  id: number | string;
  created_at: string | null;
  // updated_at: string | null
}

// TODO: change the API of this
// Consider how you'd store it in the database and
// how you'd make it play nicely with TS and XState
export type TaskChange = TaskChangeWrapper & {
  type: "create";
  taskName: string;
  timestamp: string;
};

type TaskChangeWrapper = {
  id: string;
  taskId: string;
};

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = T & {
  auth: {
    user: User;
    csrfToken: string;
  };
};
