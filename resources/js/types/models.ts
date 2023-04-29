// Would be nice to be able to auto-generate these types
// from the Laravel migrations and models

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
};

export interface Task {
  id: string;
  name: string;
  // user_id: User["id"];
  created_at: string | null;
  edited_at: string | null;
  completed_at: string | null;
}
