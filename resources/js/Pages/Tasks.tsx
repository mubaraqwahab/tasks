import MyForm from "@/Components/MyForm";
import Layout from "@/Components/Layout";
import TaskLi, { TaskLiProps } from "@/Components/TaskLi";
import For from "@/Components/For";
import { useTasksMachine } from "@/machines/task-manager";
import {
  ToggleTaskLiEvent,
  DeleteTaskLiEvent,
  EditTaskLiEvent,
  PageProps,
  Paginator,
} from "@/types";
import { Task } from "@/types/models";
import { NONEMPTY_WHEN_TRIMMED_PATTERN, p, truncate, useOnline } from "@/utils";
import { PlusIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import * as Form from "@radix-ui/react-form";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ActorRefFrom } from "xstate";
import { useActor } from "@xstate/react";
import { paginatorMachine } from "@/machines/task-paginator";
import { AxiosError } from "axios";

export type TaskPageProps = PageProps<{
  upcomingPaginator: Paginator<Task>;
  completedPaginator: Paginator<Task>;
}>;

export default function Tasks({
  upcomingPaginator,
  completedPaginator,
}: TaskPageProps) {
  const isOnline = useOnline();
  const [state, send] = useTasksMachine(upcomingPaginator, completedPaginator);
  const [isCompletedTasksOpen, setIsCompletedTasksOpen] = useState(false);
  const discardChangesBtnRef = useRef<HTMLButtonElement>(null);

  const failedChanges = state.context.changelog.filter(
    (change) => !!change.lastError
  );

  const tasks = state.context.tasks;

  const upcomingTasks = tasks
    .filter((task) => task.completed_at === null)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const completedTasks = tasks
    .filter((task) => task.completed_at !== null)
    .sort((a, b) => b.completed_at!.localeCompare(a.completed_at!));

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

  useEffect(() => {
    // @ts-ignore
    window.state = state;
    return () => {
      // @ts-ignore
      delete window.state;
    };
  }, [state]);

  console.log({ error: state.context.syncError });

  return (
    <Layout title="My tasks">
      <div className="flex gap-x-3 items-center">
        <h1 className="font-semibold text-2xl mb-6">My tasks</h1>

        {/* Status bar */}
        <div className="mb-5" role="status" aria-live="polite">
          {!isOnline ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="text-sm" tabIndex={-1}>
                  Offline
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="text-sm">
                  We'll save your changes locally for now and sync them when
                  you're back online.
                  <Tooltip.Arrow />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : state.matches("normal.passiveError.network") ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  className="text-sm"
                  onClick={() => send({ type: "retrySync" })}
                >
                  Failed to sync. Retry
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="text-sm">
                  We couldn't sync your changes due to a network error. Click to
                  retry.
                  <Tooltip.Arrow />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : state.matches("normal.passiveError.server") ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  className="text-sm"
                  onClick={() => send({ type: "retrySync" })}
                >
                  Failed to sync. Retry
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="text-sm">
                  We couldn't sync your changes due to a (hopefully temporary)
                  server error. Click to retry.
                  <Tooltip.Arrow />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : state.matches("normal.passiveError.unknown") ? (
            <Popover.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Popover.Trigger asChild>
                    <button type="button" className="text-sm">
                      Failed to sync. View error
                    </button>
                  </Popover.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="text-sm">
                    We couldn't sync your changes due to an unknown error. Click
                    for more info.
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <Popover.Portal>
                <Popover.Content className="bg-white border w-[400px] p-2 text-sm">
                  <pre className="max-h-40 overflow-y-auto mt-1 border p-2 text-xs">
                    <code>
                      {JSON.stringify(state.context.syncError!, null, 2)}
                    </code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => send({ type: "retrySync" })}
                  >
                    Retry
                  </button>
                  {/* <Popover.Close />
                  <Popover.Arrow /> */}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ) : null}
        </div>
      </div>

      <AlertDialog.Root open={state.matches("someFailedToSync")}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-gray-900/50" />
          <AlertDialog.Content
            className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border rounded-md p-6 shadow-xl w-[min(100vw-2rem,28rem)]"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              discardChangesBtnRef.current?.focus();
            }}
          >
            <AlertDialog.Title className="font-semibold text-lg mb-3">
              Sync conflict
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-3">
              We couldn't sync some of your changes with our server due to some
              conflicts. You'll need to discard these changes to continue
              working:
            </AlertDialog.Description>
            {/* TODO: make this a <ol> */}
            <For
              each={failedChanges.map((change) => {
                const taskName =
                  tasks.find((task) => task.id === change.task_id)?.name ?? "";
                return (
                  <>
                    {change.type} task <b>{truncate(taskName, 30)}</b>:{" "}
                    {change.lastError}
                  </>
                );
              })}
              render={(item, index) => <li key={index}>{item}</li>}
              fallback={null}
              className="px-3 mb-4 text-sm"
            />

            <details className="text-sm mb-4">
              <summary className="w-fit-content">Show full changelog</summary>
              <pre className="max-h-40 overflow-y-auto mt-1 border p-2 text-xs">
                <code>{JSON.stringify(failedChanges, null, 2)}</code>
              </pre>
            </details>

            <AlertDialog.Action
              ref={discardChangesBtnRef}
              className="block border rounded-md px-3 py-1 ml-auto font-medium bg-white hover:bg-gray-100"
              onClick={() => {
                send({ type: "discardFailed" });
              }}
            >
              Discard changes
            </AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

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

      <div className="mb-8">
        <PaginatedTaskList
          tasks={upcomingTasks}
          paginatorRef={state.context.upcomingPaginatorRef!}
          onToggle={handleToggleTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          fallback={<p>You have no upcoming tasks.</p>}
        />
      </div>

      <details
        className="mb-8"
        open={isCompletedTasksOpen}
        onToggle={(e) => {
          const details = e.target as HTMLDetailsElement;
          setIsCompletedTasksOpen(details.open);
        }}
      >
        <summary className="mb-2 py-1 inline-flex items-center gap-2 font-medium">
          <ChevronDownIcon
            className={clsx("h-5 w-5", isCompletedTasksOpen && "rotate-180")}
          />
          Completed tasks
        </summary>

        <PaginatedTaskList
          tasks={completedTasks}
          paginatorRef={state.context.completedPaginatorRef!}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          fallback={<p>You have no completed tasks.</p>}
        />
      </details>
    </Layout>
  );
}

type PaginatedTaskListProps = React.HTMLAttributes<HTMLUListElement> & {
  tasks: Task[];
  paginatorRef: ActorRefFrom<typeof paginatorMachine>;
  onToggle?: TaskLiProps["onToggle"];
  onEdit?: TaskLiProps["onEdit"];
  onDelete?: TaskLiProps["onDelete"];
  fallback: ReactNode;
};

function PaginatedTaskList({
  tasks,
  paginatorRef,
  onToggle,
  onEdit,
  onDelete,
  fallback,
  className,
  ...rest
}: PaginatedTaskListProps) {
  const [state, send] = useActor(paginatorRef);

  return (
    <>
      <For
        each={tasks}
        render={(task) => (
          <TaskLi
            task={task}
            key={task.id}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
        fallback={fallback}
        className={clsx("mb-5", className)}
        role="status"
        aria-live="polite"
        aria-relevant="all"
        {...rest}
      />

      {state.matches("allLoaded") ? null : (
        <button
          type="button"
          className="border px-3 py-1 rounded-md text-sm"
          onClick={() => {
            send({ type: "loadMore" });
          }}
        >
          {state.matches("loadingMore")
            ? "Loading..."
            : state.matches("notAllLoaded.failedToLoad")
            ? "Failed to load. Retry"
            : "Show more"}
        </button>
      )}
    </>
  );
}
