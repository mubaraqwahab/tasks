<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        return Inertia::render("Profile/Edit", [
            "mustVerifyEmail" => $user instanceof MustVerifyEmail,
            "status" => session("status"),
            "hasPassword" => $user->password !== null,
            "googleEmail" => Socialite::driver("google")
                ->userFromToken($user->google_token)
                ->getEmail(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user()->isDirty("email")) {
            $user()->email_verified_at = null;

            // TODO: send an email changed event OR ...

            $shouldReVerifyEmail =
                !$user->google_token ||
                $user->email ===
                    Socialite::driver("google")
                        ->userFromToken($user->google_token)
                        ->getEmail();

            if ($shouldReVerifyEmail) {
                // TODO: send email verification notification
            }
        }

        $request->user()->save();

        return Redirect::route("profile.edit");
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
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
