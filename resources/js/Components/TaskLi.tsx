import {
  CompleteTaskLiEvent,
  EditTaskLiEvent,
  DeleteTaskLiEvent,
} from "@/types";
import { Task } from "@/types/models";
import Form from "@/Components/Form";
import { p } from "@/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/20/solid";
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
  const { id, name, completed_at } = task;
  const nameElementId = `task-${id}-name`;

  const editNameInputId = useId();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleComplete = p(() => {
    onComplete?.({ type: "complete", taskId: id });
  });

  const handleEdit = p((e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onEdit?.({
      type: "edit",
      taskId: id,
      taskName: formData.get("taskName") as string,
    });
    setIsEditDialogOpen(false);
  });

  const handleDelete = p(() => {
    onDelete?.({ type: "delete", taskId: id });
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
          className="p-1 border rounded-full"
          name="completed"
          value={completed_at ? 0 : 1}
          aria-label={
            completed_at ? "Mark as uncompleted" : "Mark as completed"
          }
          aria-describedby={nameElementId}
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      </Form>

      <p id={nameElementId} className="flex-grow pl-3 pr-3">
        {name}
      </p>

      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Trigger asChild>
          <button
            type="submit"
            aria-describedby={nameElementId}
            aria-label="Edit"
            className="inline-block p-1 border rounded-md mr-1"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white border rounded-md p-6 shadow-xl">
            <Dialog.Title className="font-medium mb-3">Edit task</Dialog.Title>
            <Form method="PATCH" id="editTaskForm" onSubmit={handleEdit}>
              <label className="block" htmlFor={editNameInputId}>
                Name
              </label>
              <input
                className="border p-1 mb-3"
                id={editNameInputId}
                name="taskName"
                defaultValue={name}
              />
              <div>
                <button className="border rounded-md p-1" form="editTaskForm">
                  Save changes
                </button>
              </div>
            </Form>
            {/* <Dialog.Close asChild>
            </Dialog.Close> */}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Form
        action={route("tasks.destroy", id)}
        method="DELETE"
        className=""
        onSubmit={handleDelete}
      >
        <button
          type="submit"
          aria-describedby={nameElementId}
          aria-label="Delete"
          className="p-1 border rounded-md"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </Form>
    </li>
  );
}
