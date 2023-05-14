import Form from "@/Components/Form";
import Layout from "@/Components/Layout";
import TaskLi from "@/Components/TaskLi";
import { tasksMachine } from "@/tasks-machine";
import { CompleteTaskLiEvent, DeleteTaskLiEvent, PageProps } from "@/types";
import { TaskChange } from "@/types/models";
import { Task } from "@/types/models";
import orderBy from "lodash.orderby";
import { useMachine } from "@xstate/react";
import { useOnline, p } from "@/utils";
import { For } from "@/Components/For";
import { useEffect } from "react";
import { EventFrom } from "xstate";

type TaskPageProps = PageProps<{
  tasks: Task[];
}>;

function getOfflineChangelog(): TaskChange[] {
  const changelogAsJSON = localStorage.getItem("taskChangelog") || "[]";
  // Note: if the persisted changelog isn't an array of task changes,
  // or not an array at all, then someone must have tampered with it.
  // Don't defend against such a situation on the client side.
  return JSON.parse(changelogAsJSON) as TaskChange[];
}

function useTasksMachine(tasks: Task[]) {
  const [state, send, ...rest] = useMachine(tasksMachine, {
    context: { tasks, changelog: getOfflineChangelog() },
  });

  localStorage.setItem(
    "taskChangelog",
    JSON.stringify(state.context.changelog)
  );

  console.log(getOfflineChangelog());
  console.log(state.toStrings().join(", "));

  useEffect(() => {
    const handleOnline = () => send({ type: "online" });
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  });

  return [state, send, ...rest] as ReturnType<
    typeof useMachine<typeof tasksMachine>
  >;
}

export default function TasksPage({ auth, tasks }: TaskPageProps) {
  const [state, send] = useTasksMachine(tasks);
  const isOnline = useOnline();

  // TODO: replace orderby with custom impl.
  const upcomingTasks = orderBy(
    state.context.tasks.filter((task) => task.completed_at === null),
    ["created_at"],
    ["desc"]
  );

  const handleCreateTask = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    send({
      type: "change",
      changeType: "create",
      taskName: formData.get("name") as string,
    });
    form.reset();
  });

  const handleCompleteTask = (e: CompleteTaskLiEvent) => {
    send({ type: "change", changeType: "complete", taskId: e.taskId });
  };

  const handleDeleteTask = (e: DeleteTaskLiEvent) => {
    send({ type: "change", changeType: "delete", taskId: e.taskId });
  };

  let error = null;
  if (state.matches("someFailedToSync")) {
    error = state.context.changelog.filter((change) => !!change.lastError);
  } else if (state.matches("normal.temporaryError.unknownError")) {
    error = state.context.error;
  }

  return (
    <Layout auth={auth} title="Upcoming tasks">
      <h1 className="font-semibold text-2xl mb-6">Upcoming tasks</h1>

      {/* Status bar */}
      <div className="mb-5">
        <p className="flex gap-x-1.5 mb-1.5">
          Status:
          <span>{isOnline ? "online" : "offline"}</span> &middot;
          <span>{state.toStrings().at(-1)}</span>
        </p>
        {(error as any) && (
          <details>
            <summary>Error:</summary>
            <pre className="max-h-40 overflow-y-scroll mt-1 border p-2">
              <code>{JSON.stringify(error, null, 2)}</code>
            </pre>
            {state.matches("someFailedToSync") && (
              <button
                className="border p-1 bg-gray-100"
                onClick={() => send({ type: "discardFailed" })}
              >
                Discard failed changes
              </button>
            )}
          </details>
        )}
      </div>

      {/* <div className="mb-3">Errors? { JSON.stringify($page.props.errors) }</div> */}

      <Form
        method="POST"
        action={route("tasks.store")}
        className="mb-6 relative"
        onSubmit={handleCreateTask}
      >
        <input
          type="text"
          id="taskName"
          name="taskName"
          required
          maxLength={255}
          className="block w-full rounded-lg pl-3 pr-11 py-2 [&:placeholder-shown+label]:inline-block [&:not(:placeholder-shown)+label]:hidden"
          placeholder=" "
        />
        {/* placeholder=" " is required above for :placeholder-shown to work */}
        <label
          htmlFor="taskName"
          className="absolute inset-x-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          Add a new task
        </label>
        <button
          type="submit"
          aria-label="Add task"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 border bg-white rounded-md has-tooltip"
        >
          {/* <!-- TODO: extract icons into components? --> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Form>

      <For
        each={upcomingTasks}
        render={(task) => (
          <TaskLi
            task={task}
            key={task.id}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        )}
        fallback={<p>No tasks?</p>}
        className="mb-8"
      />
    </Layout>
  );
}
