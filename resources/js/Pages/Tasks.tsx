import Form from "@/Components/Form";
import Layout from "@/Components/Layout";
import TaskLi from "@/Components/TaskLi";
import { tasksMachine } from "@/tasks-machine";
import { PageProps, TaskChange } from "@/types";
import { Task } from "@/types";
import orderBy from "lodash.orderby";
import { useMachine } from "@xstate/react";
import { assign } from "xstate";
import { log } from "xstate/lib/actions";
import { FormEvent, useEffect, useState } from "react";
import { useOnline } from "@/utils";

type TaskPageProps = PageProps<{
  tasks: Task[];
}>;

/** Prevent default */
function p<E extends FormEvent>(listener: (e: E) => void) {
  return function (e: E) {
    e.preventDefault();
    listener(e);
  };
}

export default function TasksPage({ auth, tasks }: TaskPageProps) {
  const [state, send] = useMachine(tasksMachine, { context: { tasks } });
  const isOnline = useOnline();

  console.log({ isOnline, state: state.toStrings().join(" ") });

  // TODO: replace orderby with custom impl.
  const upcomingTasks = orderBy(
    state.context.tasks.filter((task) => task.completed_at === null),
    ["created_at"],
    ["desc"]
  );

  // const completedTasks = orderBy(
  //   state.context.tasks.filter((task) => task.completed_at !== null),
  //   ["completed_at"],
  //   ["desc"]
  // );

  const handleCreateTask = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    send({
      type: "CHANGE",
      data: {
        id: "abc",
        type: "create",
        taskId: "cde",
        taskName: formData.get("name") as string,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return (
    <Layout auth={auth} title="My tasks">
      {/* <!-- Consider putting the status (syncing/synced/offline) next to the h1 --> */}
      <h1 className="font-semibold text-2xl mb-6">My tasks</h1>

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

      <details open className="mb-8">
        <summary className="w-fit font-semibold mb-3">Upcoming</summary>
        {/* <!-- TODO: add :empty class or something --> */}
        <ul>
          {upcomingTasks.map((task) => (
            <TaskLi task={task} key={task.id} />
          ))}
        </ul>
        {upcomingTasks.length === 0 && <p>No tasks?</p>}
      </details>

      {/* <details>
        <summary className="w-fit font-semibold mb-3">Completed</summary>
        <ul>
          {completedTasks.map((task) => (
            <TaskLi task={task} key={task.id} />
          ))}
        </ul>
        {completedTasks.length === 0 && <p>No tasks?</p>}
      </details> */}
    </Layout>
  );
}
