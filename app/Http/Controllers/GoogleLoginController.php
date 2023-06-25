<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleLoginController extends Controller
{
    public function redirect()
    {
        return Socialite::driver("google")->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver("google")->user();

        $user = User::query()->firstWhere("email", $googleUser->getEmail());

        if (!$user) {
            $user = User::query()->create([
                "name" => $googleUser->getName(),
                "email" => $googleUser->getEmail(),
            ]);
            $user->markEmailAsVerified();
            event(new Registered($user));
            event(new Verified($user));
        }

        Auth::login($user, true);

        return redirect()->intended(RouteServiceProvider::HOME);
    }
}
