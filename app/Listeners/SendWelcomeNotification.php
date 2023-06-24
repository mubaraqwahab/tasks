<?php

namespace App\Listeners;

use App\Notifications\WelcomeNotification;
use Illuminate\Auth\Events\Registered;

class SendWelcomeNotification
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        /**
         * @var \App\Models\User
         */
        $user = $event->user;

        $user->notify(new WelcomeNotification());
    }
}
