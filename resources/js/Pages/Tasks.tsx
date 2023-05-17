import Form from "@/Components/Form";
import Layout from "@/Components/Layout";
import TaskLi from "@/Components/TaskLi";
import { tasksMachine } from "@/tasks-machine";
import {
  CompleteTaskLiEvent,
  DeleteTaskLiEvent,
  EditTaskLiEvent,
  PageProps,
} from "@/types";
import { TaskChange } from "@/types/models";
import { Task } from "@/types/models";
import orderBy from "lodash.orderby";
import { useMachine } from "@xstate/react";
import { p } from "@/utils";
import { For } from "@/Components/For";
import { useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";

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

function useTasksMachine(
  tasks: Task[],
  transformTasks: (tasks: Task[]) => Task[]
) {
  const [state, send, ...rest] = useMachine(tasksMachine, {
    context: {
      tasks,
      changelog: getOfflineChangelog(),
      transformTasks,
    },
  });

  localStorage.setItem(
    "taskChangelog",
    JSON.stringify(state.context.changelog)
  );

  console.log("Offline changelog", getOfflineChangelog());

  useEffect(() => {
    const handleOnline = () => send({ type: "online" });
    const handleOffline = () => send({ type: "offline" });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return [state, send, ...rest] as ReturnType<
    typeof useMachine<typeof tasksMachine>
  >;
}

export default function TasksPage({ auth, tasks }: TaskPageProps) {
  const [state, send] = useTasksMachine(tasks, (tasks) => {
    // TODO: replace orderby with custom impl?
    return orderBy(
      tasks.filter((task) => task.completed_at === null),
      ["created_at"],
      ["desc"]
    );
  });

  const upcomingTasks = state.context.tasks;

  const handleCreateTask = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    send({
      type: "change",
      changeType: "create",
      taskName: formData.get("taskName") as string,
    });
    form.reset();
  });

  const handleCompleteTask = (e: CompleteTaskLiEvent) => {
    send({ type: "change", changeType: "complete", taskId: e.taskId });
  };

  const handleEditTask = (e: EditTaskLiEvent) => {
    send({
      type: "change",
      changeType: "edit",
      taskId: e.taskId,
      taskName: e.taskName,
    });
  };

  const handleDeleteTask = (e: DeleteTaskLiEvent) => {
    send({ type: "change", changeType: "delete", taskId: e.taskId });
  };

  let error = null;
  if (state.matches("tasks.someFailedToSync")) {
    error = state.context.changelog.filter((change) => !!change.lastError);
  } else if (state.matches("tasks.normal.temporaryError.unknownError")) {
    error = state.context.error;
  }

  return (
    <Layout auth={auth} title="Upcoming tasks">
      <h1 className="font-semibold text-2xl mb-6">Upcoming tasks</h1>

      {/* Status bar */}
      <div className="mb-5">
        <p className="flex gap-x-1.5 mb-1.5">
          Status:
          <span>
            {state.toStrings().findLast((s) => s.startsWith("network"))!}
          </span>{" "}
          &middot;
          <span>
            {state.toStrings().findLast((s) => s.startsWith("tasks"))!}
          </span>
        </p>
        {(error as any) && (
          <details>
            <summary>Error:</summary>
            <pre className="max-h-40 overflow-y-scroll mt-1 border p-2">
              <code>{JSON.stringify(error, null, 2)}</code>
            </pre>
            {state.matches("tasks.someFailedToSync") && (
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
          <PlusIcon className="w-5 h-5" />
        </button>
      </Form>

      <For
        each={upcomingTasks}
        render={(task) => (
          <TaskLi
            task={task}
            key={task.id}
            onComplete={handleCompleteTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
        fallback={<p>No tasks?</p>}
        className="mb-8"
      />
    </Layout>
  );
}
