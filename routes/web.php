<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\TaskController;
use App\Notifications\WelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get("/", function (Request $request) {
    if ($request->user()) {
        return redirect(route("tasks.index"));
    } else {
        return redirect(route("about"));
    }
});

Route::view("/about", "about");

Route::middleware(["auth", "verified"])->group(function () {
    Route::resource("tasks", TaskController::class)->only([
        "index",
        "store",
        "update",
        "destroy",
    ]);
});

Route::middleware("auth")->group(function () {
    Route::get("/account", [AccountController::class, "edit"])->name(
        "account.edit",
    );
    Route::patch("/account", [AccountController::class, "update"])->name(
        "account.update",
    );
    Route::delete("/account", [AccountController::class, "destroy"])->name(
        "account.destroy",
    );
});

require __DIR__ . "/auth.php";

if (app("env") === "local") {
    Route::get("/notifications/welcome", function (Request $request) {
        return (new WelcomeNotification())->toMail($request->user());
    });
}
