<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskChange;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class TaskChangeController extends Controller
{
    public function storeMany(Request $request)
    {
        $changes = $request->all();
        $syncStatus = [];

        // TODO: validate that each $change is an array.
        foreach ($changes as $change) {
            $syncStatus[$change["id"]] = $this->syncChange($change, $request);
        }

        return ["syncStatus" => $syncStatus];
    }

    protected function syncChange(array $change, Request $request)
    {
        try {
            $change = $this->validateChange($change);

            if (TaskChange::find($change["id"])) {
                return ["type" => "duplicate"];
            } else {
                DB::transaction(function () use ($change, $request) {
                    TaskChange::create($change);
                    $this->applyChange($change, $request);
                });
                return ["type" => "ok"];
            }
        } catch (ValidationException $e) {
            return [
                "type" => "error",
                // Just the first error
                "error" => Arr::flatten($e->errors())[0],
            ];
        } catch (ModelNotFoundException $e) {
            return [
                "type" => "error",
                "error" => "No task exists with the given task id",
            ];
        }
        // Any other error will trigger a 500
    }

    protected function validateChange(array $change): array
    {
        $validator = Validator::make(
            data: $change,
            rules: [
                "id" => "required|uuid",
                "type" => [
                    "required",
                    "in:create,complete,uncomplete,edit,delete",
                ],
                "task_id" => "required|uuid",
                "task_name" => [
                    "required_if:type,create",
                    "required_if:type,edit",
                ],
                "created_at" => "required|date",
            ],
            attributes: [
                "type" => "change type",
            ],
        )->stopOnFirstFailure();

        return $validator->validate();
    }

    /**
     * Apply a change to the tasks table
     * @throws ModelNotFoundException
     */
    protected function applyChange(array $change, Request $request)
    {
        $taskId = $change["task_id"];

        switch ($change["type"]) {
            case "create":
                $task = new Task();
                $task->id = $taskId;
                $task->name = $change["task_name"];
                $task->created_at = $change["created_at"];
                $task->user_id = $request->user()->id;
                $task->save();
                break;

            case "complete":
                $task = Task::query()->findOrFail($taskId);
                // TODO: validate that completed_at > created_at?
                $task->completed_at = $change["created_at"];
                $task->save();
                break;

            case "uncomplete":
                $task = Task::query()->findOrFail($taskId);
                $task->completed_at = null;
                $task->save();
                break;

            case "edit":
                $task = Task::query()->findOrFail($taskId);
                $task->name = $change["task_name"];
                $task->save();
                break;

            case "delete":
                $task = Task::query()->findOrFail($taskId);
                $task->delete();
                break;

            // TODO: clear changes on delete to save space?
        }
    }
}
