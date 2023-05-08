<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        // TODO: validate that $changes is an array. Laravel kind of guarantees this,
        // but what if this controller method received something other than an array?
        $changes = $request->all();
        $syncStatus = [];

        // TODO: consider using snake case for the change keys

        foreach ($changes as $change) {
            try {
                $change = $this->validateChange($change);

                // TODO:
                // if change ID already exists in DB:
                //      set sync status to duplicate or something
                // else,
                //      begin transaction:
                //          apply change to tasks
                //          save change to DB
                //      set sync status to okay
                $this->applyChange($change, $request);

                $syncStatus[$change["id"]] = "ok";
            } catch (ValidationException $e) {
                $syncStatus[$change["id"]] = ["errors" => $e->errors()];
            } catch (ModelNotFoundException $e) {
                $syncStatus[$change["id"]] = [
                    "errors" => [
                        "taskId" => ["No task exists with the given task id"],
                    ],
                ];
            }
            // Any other error should trigger a 500
        }

        return ["syncStatus" => $syncStatus];
    }

    protected function validateChange(array $change): array
    {
        $validator = Validator::make(
            data: $change,
            rules: [
                "id" => "required",
                "timestamp" => "date|required",
                "taskId" => "required",
                "type" => ["required", "in:create,complete,uncomplete,delete"],
                "taskName" => "required_if:type,create",
            ],
            attributes: [
                "type" => "change type",
            ],
        );

        return $validator->validate();
    }

    protected function applyChange(array $change, Request $request)
    {
        $taskId = $change["taskId"];

        switch ($change["type"]) {
            case "create":
                $task = new Task();
                $task->id = $taskId;
                $task->name = $change["taskName"];
                $task->created_at = $change["timestamp"];
                $task->user_id = $request->user()->id;
                $task->save();
                break;

            case "complete":
                $task = Task::findOrFail($taskId);
                $task->completed_at = $change["timestamp"];
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
    }
}
