<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

if (!function_exists("getGoogleEmailFromToken")) {
    function getGoogleEmail(User $user): string|null
    {
        // TODO: what does this return when $user->google_token is null?
        return Socialite::driver("google")
            ->userFromToken($user->google_token)
            ->getEmail();
    }
}
