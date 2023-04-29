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
        $completedTasksQuery = Task::with("user")
            ->whereNotNull("completed_at")
            ->latest("completed_at");

        $tasks = Task::with("user")
            ->whereNull("completed_at")
            ->latest()
            ->union($completedTasksQuery)
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
            ["name" => "required|string|max:255"],
            [
                "name.required" =>
                    "You need to fill the 'Add a new task' input to add a task.",
                "name.max" =>
                    "Your task name is too long; please keep it within :max characters.",
            ],
        );

        $request
            ->user()
            ->tasks()
            ->create($validated);

        return redirect(route("tasks.index"));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorize("update", $task);

        $fields = $request->validate(
            ["completed" => "required|boolean"],
            [
                "completed" =>
                    "Strange, we couldn't update your task. Please try again.",
                // "completed.boolean" =>
                //     "Strange, we couldn't update your task. Refresh your browser window, then try again.",
            ],
        );

        $task->update([
            "completed_at" => $fields["completed"] ? Date::now() : null,
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
