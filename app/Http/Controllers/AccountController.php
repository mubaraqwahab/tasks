<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Display the user's account settings page.
     */
    public function edit(): Response
    {
        return Inertia::render("Account", [
            "status" => session("status"),
        ]);
    }

    /**
     * Update the user's account information.
     */
    public function update(Request $request): RedirectResponse
    {
        /**
         * @var \App\Models\User
         */
        $user = $request->user();

        $validated = $request->validate(["name" => "required|string|max:255"]);

        $user->update($validated);

        return Redirect::route("account.edit");
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // TODO: how to confirm delete account??
        $request->validate([
            "password" => ["required", "current_password"],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to("/");
    }
}
