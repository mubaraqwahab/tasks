import MyForm from "@/Components/MyForm";
import Layout from "@/Components/Layout";
import TaskLi from "@/Components/TaskLi";
import For from "@/Components/For";
import { useTasksMachine } from "@/tasks-machine";
import {
  ToggleTaskLiEvent,
  DeleteTaskLiEvent,
  EditTaskLiEvent,
  PageProps,
  PaginatedCollection,
} from "@/types";
import { Task } from "@/types/models";
import orderBy from "lodash.orderby";
import { NONEMPTY_WHEN_TRIMMED_PATTERN, p } from "@/utils";
import { PlusIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import * as Form from "@radix-ui/react-form";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export type TaskPageProps = PageProps<{
  upcomingTasks: PaginatedCollection<Task>;
  completedTasks: PaginatedCollection<Task>;
}>;

export default function TasksPage({
  auth,
  upcomingTasks: paginatedUpcomingTasks,
  completedTasks: paginatedCompletedTasks,
}: TaskPageProps) {
  const [isCompletedTasksOpen, setIsCompletedTasksOpen] = useState(false);

  const [state, send] = useTasksMachine(
    paginatedUpcomingTasks,
    paginatedCompletedTasks
  );

  // Is orderby really needed? The data comes already sorted from the server.
  // And you can insert new tasks intelligently to maintain the sort order.
  const upcomingTasks = orderBy(
    state.context.tasks.filter((task) => task.completed_at === null),
    ["created_at"],
    ["desc"]
  );

  const completedTasks = orderBy(
    state.context.tasks.filter((task) => task.completed_at !== null),
    ["completed_at"],
    ["desc"]
  );

  const handleCreateTask = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    send({
      type: "change",
      changeType: "create",
      taskName: (formData.get("taskName") as string).trim(),
    });
    form.reset();
  });

  const handleToggleTask = (e: ToggleTaskLiEvent) => {
    send({
      type: "change",
      changeType: e.completed ? "complete" : "uncomplete",
      taskId: e.taskId,
    });
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

  let syncError = null;
  if (state.matches("tasks.someFailedToSync")) {
    syncError = state.context.changelog.filter((change) => !!change.lastError);
  } else if (state.matches("tasks.normal.passiveError.unknownError")) {
    syncError = state.context.syncError;
  }

  return (
    <Layout auth={auth} title="My tasks">
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
          </span>{" "}
          &middot;
          <span>
            {state.toStrings().findLast((s) => s.startsWith("pagination"))!}
          </span>
        </p>
        {syncError && (
          <details>
            <summary>Error:</summary>
            <pre className="max-h-40 overflow-y-scroll mt-1 border p-2">
              <code>{JSON.stringify(syncError, null, 2)}</code>
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

      <Form.Root asChild>
        <MyForm
          method="POST"
          action={route("tasks.store")}
          className="mb-6 relative"
          onSubmit={handleCreateTask}
        >
          <Form.Field name="taskName">
            {/* TODO: how to display these? And what about server errors? */}
            {/* <Form.Message match="patternMismatch" className="text-sm">
              Task name can't be just whitespace
            </Form.Message>
            <Form.Message match="valueMissing" className="text-sm">
              Please enter a task name
            </Form.Message> */}
            <Form.Control
              required
              maxLength={255}
              pattern={NONEMPTY_WHEN_TRIMMED_PATTERN}
              className={clsx(
                "border border-gray-400 block w-full rounded-lg pl-3 pr-11 py-2 shadow",
                "[&:placeholder-shown+label]:inline-block [&:not(:placeholder-shown)+label]:hidden"
              )}
              placeholder=" "
            />
            {/* placeholder=" " is required above for :placeholder-shown to work */}
            <Form.Label className="absolute inset-x-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
              Add a new task
            </Form.Label>
          </Form.Field>
          <Form.Submit
            aria-label="Add task"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 border bg-white rounded-md hover:bg-gray-100"
          >
            <PlusIcon className="w-5 h-5" />
          </Form.Submit>
        </MyForm>
      </Form.Root>

      <For
        each={upcomingTasks}
        render={(task) => (
          <TaskLi
            task={task}
            key={task.id}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
        fallback={<p>No tasks?</p>}
        className="mb-8"
      />

      {!state.matches("pagination.allLoaded") && (
        <button
          type="button"
          onClick={() => send({ type: "loadMore", which: "upcoming" })}
        >
          {state.matches("pagination.loadingMore") ? "Loading..." : "Show more"}
        </button>
      )}

      <details
        onToggle={(e) => {
          const details = e.target as HTMLDetailsElement;
          setIsCompletedTasksOpen(details.open);
        }}
      >
        <summary className="mb-2 py-1 inline-flex items-center gap-2 font-medium">
          <ChevronDownIcon
            className={clsx(
              "h-5 w-5 transition-transform duration-200",
              isCompletedTasksOpen && "rotate-180"
            )}
          />
          Completed tasks
        </summary>
        <For
          each={completedTasks}
          render={(task) => (
            <TaskLi
              task={task}
              key={task.id}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          )}
          fallback={<p>No tasks?</p>}
          className="mb-8"
        />
      </details>
    </Layout>
  );
}
