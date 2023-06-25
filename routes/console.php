<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command("inspire", function () {
    $this->comment(Inspiring::quote());
})->purpose("Display an inspiring quote");

Artisan::command("user:list", function () {
    $this->table(["Name", "Email"], User::all(["name", "email"])->toArray());
})->purpose("List all users.");

Artisan::command("user:delete {email}", function (string $email) {
    $user = User::query()->firstWhere("email", $email);
    if (!$user) {
        $this->warn("No user exists with the email $email.");
    } elseif (
        $this->confirm(
            "Are you sure you want to delete the following user:\n {$user->name} {$user->email}?",
        )
    ) {
        $user->delete();
        $this->info("User $email has been deleted.");
    }
})->purpose("Delete a user by email.");
