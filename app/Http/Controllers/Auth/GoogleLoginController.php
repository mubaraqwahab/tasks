<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    public function redirect()
    {
        return Socialite::driver("google")->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver("google")->user();

        $user = User::query()->firstWhere(
            "email",
            "=",
            $googleUser->getEmail(),
        );

        $queryParams = "";

        if ($user) {
            $user->update([
                "google_token" => $googleUser->token,
                "google_refresh_token" => $googleUser->refreshToken,
            ]);

            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
                event(new Verified($user));
                // See app\Http\Controllers\Auth\VerifyEmailController.php
                $queryParams = "?verified=1";
            }
        } else {
            $user = User::query()->create([
                "name" => $googleUser->getName(),
                "email" => $googleUser->getEmail(),
                "google_token" => $googleUser->token,
                "google_refresh_token" => $googleUser->refreshToken,
            ]);
            $user->markEmailAsVerified();
            event(new Registered($user));
            event(new Verified($user));
            $queryParams = "?verified=1";
        }

        Auth::login($user, true);

        return redirect()->intended(RouteServiceProvider::HOME . $queryParams);
    }
}
