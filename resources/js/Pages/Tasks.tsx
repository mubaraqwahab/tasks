import Form from "@/Components/Form";
import Layout from "@/Components/Layout";
import TaskLi from "@/Components/TaskLi";
import { tasksMachine } from "@/tasks-machine";
import {
  CompleteTaskEvent,
  DeleteTaskEvent,
  PageProps,
  TaskChange,
} from "@/types";
import { Task } from "@/types";
import orderBy from "lodash.orderby";
import { useMachine } from "@xstate/react";
import { useOnline, p } from "@/utils";
import { For } from "@/Components/For";
import { nanoid } from "nanoid";
import { useEffect } from "react";

type TaskPageProps = PageProps<{
  tasks: Task[];
}>;

function getOfflineChangelog(): TaskChange[] {
  const queueAsJSON = localStorage.getItem("taskChangeQueue") || "[]";
  return JSON.parse(queueAsJSON) as TaskChange[];
}

function useTasksMachine(tasks: Task[]) {
  const [state, send, ...rest] = useMachine(tasksMachine, {
    context: { tasks, changelog: getOfflineChangelog() },
  });

  localStorage.setItem(
    "taskChangelog",
    JSON.stringify(state.context.changelog)
  );

  useEffect(() => {
    const handleOnline = () => send({ type: "online" });
    window.addEventListener("online", handleOnline);
    return () => handleOnline;
  });

  return [state, send, ...rest];
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
      data: {
        id: nanoid(),
        type: "create",
        taskId: nanoid(),
        taskName: formData.get("name") as string,
        timestamp: new Date().toISOString(),
      },
    });
    form.reset();
  });

  const handleCompleteTask = (e: CompleteTaskEvent) => {
    send({
      type: "change",
      data: {
        id: nanoid(),
        type: "complete",
        taskId: e.taskId,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const handleDeleteTask = (e: DeleteTaskEvent) => {
    send({
      type: "change",
      data: {
        id: nanoid(),
        type: "delete",
        taskId: e.taskId,
        timestamp: new Date().toISOString(),
      },
    });
  };

  let errors;
  if (state.matches("someFailedToSync")) {
    errors = state.context.changelog.filter((change) => "lastErrors" in change);
  } else if (state.matches("normal.temporaryError.networkError")) {
  } else if (state.matches("normal.temporaryError.serverError")) {
  } else if (state.matches("corruptedChangelogError")) {
  }

  return (
    <Layout auth={auth} title="Upcoming tasks">
      <h1 className="font-semibold text-2xl mb-6">Upcoming tasks</h1>

      {/* Status bar */}
      <div className="mb-5">
        <p className="flex gap-x-1.5 mb-1.5">
          Status:
          <span>{isOnline ? "online" : "offline"}</span> &middot;
          <span>{state.toStrings().join(", ")}</span>
        </p>
        {errors && (
          <details>
            <summary>Errors:</summary>
            <pre className="max-h-40 overflow-y-scroll mt-1 border p-2">
              <code>{JSON.stringify(errors, null, 2)}</code>
            </pre>
            <button
              className="border p-1 bg-gray-100"
              onClick={() => send({ type: "discardFailed" })}
            >
              Discard failed changes
            </button>
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
          name="name"
          required
          maxLength={255}
          className="block w-full rounded-lg px-3 py-2 [&:placeholder-shown+label]:inline-block [&:not(:placeholder-shown)+label]:hidden"
          placeholder=" "
        />
        {/* placeholder=" " is required above for :placeholder-shown to work */}
        <label
          htmlFor="taskName"
          className="absolute inset-x-3 top-1/2 -translate-y-1/2"
        >
          Add a new task
        </label>
        <button
          type="submit"
          aria-label="Add task"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 border rounded-md has-tooltip"
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
