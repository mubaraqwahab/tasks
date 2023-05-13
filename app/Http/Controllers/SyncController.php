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

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        $changes = $request->all();
        $syncStatus = [];

        // TODO: validate that each $change is an array.
        foreach ($changes as $change) {
            try {
                $change = $this->validateChange($change);

                if (TaskChange::find($change["id"])) {
                    $syncStatus[$change["id"]] = ["type" => "duplicate"];
                } else {
                    $this->applyChange($change, $request);
                    $syncStatus[$change["id"]] = ["type" => "ok"];
                }
            } catch (ValidationException $e) {
                $syncStatus[$change["id"]] = [
                    "type" => "error",
                    // Just the first error
                    "error" => Arr::flatten($e->errors())[0],
                ];
            } catch (ModelNotFoundException $e) {
                $syncStatus[$change["id"]] = [
                    "type" => "error",
                    "error" => "No task exists with the given task id",
                ];
            }
            // Any other error will trigger a 500
        }

        return ["syncStatus" => $syncStatus];
    }

    protected function validateChange(array $change): array
    {
        $validator = Validator::make(
            data: $change,
            rules: [
                "id" => "required|uuid",
                "type" => ["required", "in:create,complete,uncomplete,delete"],
                "task_id" => "required|uuid",
                "task_name" => "required_if:type,create",
                "created_at" => "required|date",
            ],
            attributes: [
                "type" => "change type",
            ],
        )->stopOnFirstFailure();

        return $validator->validate();
    }

    /**
     * @throws ModelNotFoundException
     */
    protected function applyChange(array $change, Request $request)
    {
        DB::transaction(function () use ($change, $request) {
            TaskChange::create($change);

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
                    $task = Task::findOrFail($taskId);
                    $task->completed_at = $change["created_at"];
                    $task->save();
                    break;

                case "uncomplete":
                    $task = Task::findOrFail($taskId);
                    $task->completed_at = null;
                    $task->save();
                    break;

                case "delete":
                    $task = Task::findOrFail($taskId);
                    $task->delete();
                    break;
            }
        });
    }
}
