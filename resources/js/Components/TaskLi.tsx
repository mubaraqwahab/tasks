import {
  CompleteTaskLiEvent,
  EditTaskLiEvent,
  DeleteTaskLiEvent,
} from "@/types";
import { Task } from "@/types/models";
import MyForm from "@/Components/MyForm";
import { NONEMPTY_WHEN_TRIMMED_PATTERN, p } from "@/utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { forwardRef, useState } from "react";
import clsx from "clsx";

type TaskLiProps = {
  task: Task;
  onComplete?: (e: CompleteTaskLiEvent) => void;
  onEdit?: (e: EditTaskLiEvent) => void;
  onDelete?: (e: DeleteTaskLiEvent) => void;
};

export default function TaskLi({
  task,
  onComplete,
  onEdit,
  onDelete,
}: TaskLiProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const taskNameElementId = `task-${task.id}-name`;

  const handleComplete = p(() => {
    onComplete?.({ type: "complete", taskId: task.id });
  });

  const handleEdit = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onEdit?.({
      type: "edit",
      taskId: task.id,
      taskName: (formData.get("taskName") as string).trim(),
    });
    // setIsEditDialogOpen(false);
    // setIsDropdownMenuOpen(false);
  });

  const handleDelete = p(() => {
    onDelete?.({ type: "delete", taskId: task.id });
    // setIsDeleteDialogOpen(false);
    // setIsDropdownMenuOpen(false);
  });

  return (
    <li id={`task-${task.id}`} className="flex items-center py-3 border-b">
      <MyForm
        action={route("tasks.update", task.id)}
        method="PATCH"
        onSubmit={handleComplete}
      >
        <button
          type="submit"
          className="p-1 border rounded-full bg-white hover:bg-gray-100"
          name="completed"
          value={task.completed_at ? 0 : 1}
          aria-label={
            task.completed_at ? "Mark as uncompleted" : "Mark as completed"
          }
          aria-describedby={taskNameElementId}
        >
          <CheckIcon className="w-3.5 h-3.5" />
        </button>
      </MyForm>

      <p id={taskNameElementId} className="flex-grow pl-3 pr-3">
        {task.name}
      </p>

      <div>
        <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <Dialog.Trigger
            type="button"
            aria-label="Edit"
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <PencilIcon aria-hidden="true" className="w-3.5 h-3.5" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-gray-900/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border rounded-md p-6 shadow-xl w-[min(100vw-2rem,28rem)]">
              <Dialog.Title className="font-semibold text-lg mb-3">
                Edit task
              </Dialog.Title>
              <Form.Root asChild>
                <MyForm
                  method="PATCH"
                  onSubmit={(e) => {
                    handleEdit(e);
                    setIsEditDialogOpen(false);
                  }}
                >
                  <Form.Field name="taskName">
                    <div className="flex items-baseline justify-between">
                      <Form.Label className="inline-block mb-1">
                        Name
                      </Form.Label>
                      <Form.Message match="patternMismatch" className="text-sm">
                        Task name can't be just whitespace
                      </Form.Message>
                      <Form.Message match="valueMissing" className="text-sm">
                        Please enter a task name
                      </Form.Message>
                    </div>
                    <Form.Control
                      type="text"
                      className="block w-full border rounded py-1 px-2 mb-4"
                      required
                      maxLength={255}
                      pattern={NONEMPTY_WHEN_TRIMMED_PATTERN}
                      defaultValue={task.name}
                    />
                  </Form.Field>
                  <div>
                    <Form.Submit
                      className={clsx(
                        "block border rounded-md px-3 py-1 ml-auto font-medium",
                        "text-white bg-green-600 hover:bg-green-700"
                      )}
                    >
                      Save
                    </Form.Submit>
                  </div>
                </MyForm>
              </Form.Root>
              <Dialog.Close
                className="p-1 rounded bg-white hover:bg-gray-100 absolute top-5 right-5"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div>
        <Dialog.Root
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <Dialog.Trigger
            type="button"
            aria-label="Delete"
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <TrashIcon aria-hidden="true" className="w-3.5 h-3.5" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-gray-900/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border rounded-md p-6 shadow-xl w-[min(100vw-2rem,28rem)]">
              <Dialog.Title className="font-semibold text-lg mb-3">
                Are you sure you want to delete this task?
              </Dialog.Title>
              <Dialog.Description>
                You're about to delete the task: <b>{task.name}</b>. This action
                is <strong>irreversible</strong>
              </Dialog.Description>
              <MyForm
                action={route("tasks.destroy", task.id)}
                method="DELETE"
                className="flex items-center justify-end gap-2 mt-4"
                onSubmit={(e) => {
                  handleDelete(e);
                  setIsDeleteDialogOpen(false);
                }}
              >
                <div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="block border rounded-md px-3 py-1 ml-auto font-medium bg-white hover:bg-gray-100"
                    >
                      No, keep it
                    </button>
                  </Dialog.Close>
                </div>
                <div>
                  <button
                    type="submit"
                    className="block border rounded-md px-3 py-1 ml-auto font-medium text-white bg-red-500 hover:bg-red-600"
                  >
                    Yes, delete it
                  </button>
                </div>
              </MyForm>

              <Dialog.Close
                className="p-1 rounded bg-white hover:bg-gray-100 absolute top-5 right-5"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </li>
  );
}
