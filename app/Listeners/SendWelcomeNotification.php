<?php

namespace App\Listeners;

use App\Notifications\WelcomeNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
use Throwable;

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

        // TODO: remove the try-catch when you setup queues for email!
        try {
            $user->notify(new WelcomeNotification());
        } catch (Throwable $e) {
            Log::error($e->getMessage());
        }
    }
}
