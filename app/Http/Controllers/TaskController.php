<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $userTasks = fn() => $request->user()->tasks();

        $upcomingPaginator = fn() => $userTasks()
            ->whereNull("completed_at")
            ->latest()
            ->cursorPaginate(
                // Show 50 initially, then 20 subsequently
                perPage: $request->query("upcomingCursor") ? 20 : 50,
                cursorName: "upcomingCursor",
            );

        $completedPaginator = fn() => $userTasks()
            ->whereNotNull("completed_at")
            ->latest("completed_at")
            ->cursorPaginate(perPage: 10, cursorName: "completedCursor");

        return Inertia::render("Tasks", [
            "upcomingPaginator" => $upcomingPaginator,
            "completedPaginator" => $completedPaginator,
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

        return redirect(route("tasks.upcomingIndex"));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorize("update", $task);

        $validated = $request->validate(
            [
                "completed" => "prohibits:taskName|boolean",
                "taskName" => "prohibits:completed|string|max:255",
            ],
            [
                "completed" =>
                    "Strange, we couldn't update your task. Please try again.",
                "taskName" =>
                    "Strange, we couldn't update your task. Please try again.",
            ],
        );

        if (Arr::has($validated, "completed")) {
            $task->update([
                "completed_at" => $validated["completed"] ? Date::now() : null,
            ]);

            if (!$validated["completed"]) {
                return redirect(route("tasks.completedIndex"));
            }
        } else {
            $task->update([
                "name" => $validated["taskName"],
            ]);
        }

        return redirect(route("tasks.upcomingIndex"));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize("delete", $task);
        $task->delete();
        // TODO: decide whether to go to upcoming or completed
        return redirect(route("tasks.index"));
    }
}
