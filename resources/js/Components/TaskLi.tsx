import {
  CompleteTaskLiEvent,
  EditTaskLiEvent,
  DeleteTaskLiEvent,
} from "@/types";
import { Task } from "@/types/models";
import Form from "@/Components/Form";
import { NONEMPTY_WHEN_TRIMMED_PATTERN, p } from "@/utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useId, useState } from "react";

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
  const editNameInputId = useId();

  const { id, name, completed_at } = task;
  const nameElementId = `task-${id}-name`;

  const handleComplete = p(() => {
    onComplete?.({ type: "complete", taskId: id });
  });

  const handleEdit = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onEdit?.({
      type: "edit",
      taskId: id,
      taskName: (formData.get("taskName") as string).trim(),
    });
    setIsEditDialogOpen(false);
  });

  const handleDelete = p(() => {
    onDelete?.({ type: "delete", taskId: id });
    setIsDeleteDialogOpen(false);
  });

  return (
    <li id={`task-${id}`} className="flex items-center py-3 border-b">
      <Form
        action={route("tasks.update", id)}
        method="PATCH"
        onSubmit={handleComplete}
      >
        <button
          type="submit"
          className="p-1 border rounded-full bg-white hover:bg-gray-100"
          name="completed"
          value={completed_at ? 0 : 1}
          aria-label={
            completed_at ? "Mark as uncompleted" : "Mark as completed"
          }
          aria-describedby={nameElementId}
        >
          <CheckIcon className="w-3.5 h-3.5" />
        </button>
      </Form>

      <p id={nameElementId} className="flex-grow pl-3 pr-3">
        {name}
      </p>

      <div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="Actions"
              className="p-1 border rounded-md bg-white hover:bg-gray-100"
              aria-describedby={nameElementId}
            >
              <EllipsisHorizontalIcon className="w-3.5 h-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content sideOffset={8} className="w-44 border rounded-md shadow-lg p-2 bg-white">
              <DropdownMenu.Label>Actions</DropdownMenu.Label>
              <DropdownMenu.Item asChild>
                <Dialog.Root
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <Dialog.Trigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 w-full text-left rounded-md hover:bg-gray-100"
                    >
                      <PencilIcon aria-hidden="true" className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-gray-900/50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border rounded-md p-6 shadow-xl w-[min(100vw-2rem,28rem)]">
                      <Dialog.Title className="font-semibold text-lg mb-3">
                        Edit task
                      </Dialog.Title>
                      <Form method="PATCH" onSubmit={handleEdit}>
                        <label
                          className="inline-block mb-1"
                          htmlFor={editNameInputId}
                        >
                          Name
                        </label>
                        <input
                          className="block w-full border rounded py-1 px-2 mb-4"
                          id={editNameInputId}
                          name="taskName"
                          required
                          maxLength={255}
                          pattern={NONEMPTY_WHEN_TRIMMED_PATTERN}
                          defaultValue={task.name}
                        />
                        <div>
                          <button
                            type="submit"
                            className="block border rounded-md px-3 py-1 ml-auto font-medium bg-white hover:bg-gray-100"
                          >
                            Save changes
                          </button>
                        </div>
                      </Form>
                      <Dialog.Close asChild>
                        <button
                          className="p-1 rounded bg-white hover:bg-gray-100 absolute top-5 right-5"
                          aria-label="Close"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Dialog.Root
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <Dialog.Trigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 w-full text-left rounded-md hover:bg-gray-100"
                    >
                      <TrashIcon aria-hidden="true" className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-gray-900/50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border rounded-md p-6 shadow-xl w-[min(100vw-2rem,28rem)]">
                      <Dialog.Title className="font-semibold text-lg mb-3">
                        Are you sure you want to delete this task?
                      </Dialog.Title>
                      <Dialog.Description>
                        You're about to delete the task: <b>{task.name}</b>.
                        This action is <strong>irreversible</strong>
                      </Dialog.Description>
                      <Form
                        action={route("tasks.destroy", task.id)}
                        method="DELETE"
                        className=""
                        onSubmit={handleDelete}
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
                            className="block border rounded-md px-3 py-1 ml-auto font-medium bg-red-400 hover:bg-red-500"
                          >
                            Yes, delete it
                          </button>
                        </div>
                      </Form>
                      <Dialog.Close asChild>
                        <button
                          className="p-1 rounded bg-white hover:bg-gray-100 absolute top-5 right-5"
                          aria-label="Close"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </li>
  );
}
