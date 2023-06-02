<?php

use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\GoogleLoginController;
use Illuminate\Support\Facades\Route;

Route::middleware("guest")->group(function () {
    Route::redirect("login", "login/google")->name("login");

    Route::get("login/google", [
        GoogleLoginController::class,
        "redirect",
    ])->name("login.google");

    Route::get("login/google/callback", [
        GoogleLoginController::class,
        "callback",
    ])->name("login.google.callback");
});

Route::middleware("auth")->group(function () {
    Route::post("logout", [
        AuthenticatedSessionController::class,
        "destroy",
    ])->name("logout");
});
