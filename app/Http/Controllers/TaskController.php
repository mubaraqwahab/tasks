<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tasks = Task::with("user")
            ->whereNull("completed_at")
            ->latest()
            ->get();

        return Inertia::render("Tasks", [
            "tasks" => $tasks,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(
            ["taskName" => "required|string|max:255"],
            [
                "taskName.required" =>
                    "You need to fill the 'Add a new task' input to add a task.",
                "taskName.max" =>
                    "Your task name is too long; please keep it within :max characters.",
            ],
        );

        $request
            ->user()
            ->tasks()
            ->create([
                "name" => $validated["taskName"],
            ]);

        // TODO: if you ever need to display an "activity log" of sorts on the UI,
        // then save task changes in this controller too. (You'd also need to modify
        // the task_changes table schema)

        return redirect(route("tasks.index"));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorize("update", $task);

        $validated = $request->validate(
            ["completed" => "required|boolean"],
            [
                "completed" =>
                    "Strange, we couldn't update your task. Please try again.",
                // "completed.boolean" =>
                //     "Strange, we couldn't update your task. Refresh your browser window, then try again.",
            ],
        );

        $task->update([
            "completed_at" => $validated["completed"] ? Date::now() : null,
        ]);

        return redirect(route("tasks.index"));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize("delete", $task);
        $task->delete();
        return redirect(route("tasks.index"));
    }
}
