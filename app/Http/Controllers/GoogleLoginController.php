<?php

namespace App\Http\Controllers;

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

        $user = User::query()
            ->where("email", $googleUser->getEmail())
            ->first();

        $queryString = "";

        if (!$user) {
            $user = User::query()->create([
                "name" => $googleUser->getName(),
                "email" => $googleUser->getEmail(),
            ]);
            $user->markEmailAsVerified();
            event(new Registered($user));
            event(new Verified($user));
            $queryString = "?verified=1";
        }

        Auth::login($user, true);

        return redirect()->intended(RouteServiceProvider::HOME . $queryString);
    }
}
