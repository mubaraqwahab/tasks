<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ["mail"];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $appName = config("app.name");
        $aboutRoute = route("about");
        $myTasksRoute = route("tasks.index");
        return (new MailMessage())
            ->subject("Welcome to $appName")
            ->greeting("Hello {$notifiable->name}")
            ->line("Welcome to $appName.")
            ->line(
                "Tasks is a simple to-do list app that I'm using to explore
                what it takes to build a full-stack production app.",
            )
            ->line(
                "You can visit [the about page]($aboutRoute) to learn how I
                built this app as well as what I learnt while building it.",
            )
            ->line(
                "Or you can start managing your tasks right away in
                [the My tasks page]($myTasksRoute).",
            )
            ->salutation("Enjoy!\n\nMubaraq");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
                //
            ];
    }
}
