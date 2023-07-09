When you're logged in, you can do the usual to-do list stuff—create, edit, complete, uncomplete and delete tasks—and you'll see the results immediately, without having to wait for your changes to be sent to the server (i.e. without waiting for any "loading..." signs).

The app assumes your changes will sync successfully with the server most of the time, so it doesn't wait for them to sync. Instead, it saves them locally and updates the UI before attempting (in the background) to send them to the server. Hence the ["optimistic UI"](https://www.smashingmagazine.com/2016/11/true-lies-of-optimistic-user-interfaces/), which enables a seamless user experience. In the (hopefully) rare event that your changes fail to sync, the app notifies you of that and guides you to resolve the issue.

---

I started this to explore building a minimal production-worthy full-stack app. By "production-worthy", I mean (1) an app that implements relevant business logic (such as managing tasks) as well as necessary peripheral concerns (such as transactional emails), (2) an app that is resilient to exceptions, and (3) an app with a reliable, scalable architecture.

The last time I tried building a similar app, I naively used a very low-level framework ([Express](https://expressjs.com/)) and had to manually set up authentication, session management, emails, input validation and security measures among other backend concerns, which I knew little about. As a result, the app was very fragile and the codebase untidy.

Learning from that experience, I built this app with [Laravel](http://laravel.com/). Laravel is a full-stack PHP framework with a [model-view-controller (MVC) architecture](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) and many built-in features and conventions to handle all the backend work I listed above (and more) with little manual configuration.

I also followed [Todoist](https://todoist.com/), a popular task manager app, in several other design and technical decisions I made for this Tasks app. Notably, I got the optimistic UI idea from there and used [React](http://react.dev/) (via Laravel's [Inertia](https://inertiajs.com/)) and [XState](https://xstate.js.org/docs/) on the front end to manage the resulting complexity.

[The source code is available on my GitHub](https://github.com/mubaraqwahab/tasks), and the tech stack is as follows:

- Laravel for the overall architecture and backend heavy lifting
- MySQL for the database
- [Postmark](http://postmarkapp.com/) for sending transactional emails
- [Fly](https://fly.io) for hosting
- [GitHub Actions](https://github.com/features/actions) for continuous deployment
- [TypeScript](https://www.typescriptlang.org/) for type safety in the client-side code
- Inertia + React for a declarative and reactive UI
- XState for managing UI state
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Heroicons](https://heroicons.com/) for icons

The app currently lacks many utility features like sorting and filtering tasks and deleting user accounts. I plan to add them over time to practise iterative development.

The rest of this page describes how I built some interesting parts of this app as well as some challenges I faced and lessons I learnt.

NOTE: everything below this paragraph is still an early draft!

TODO: credits here?

TODO: TOC here?

<!-- TODO: heading IDs -->

## The optimistic UI

The most exciting feature to build was the optimistic UI, even though, ironically, the idea for it only came halfway into the app. My initial plan was to create a traditional server-rendered app, where actions like adding a new task would trigger a page reload to save the task to the server and show the task on the page. Soon after completing this, I found the user experience to be terrible and decided to improve it with an optimistic UI.

The optimistic UI in this app is based on my observations while reverse-engineering Todoist in my browser's DevTools. It works thus:

When you make a change to your tasks, the app records the change in a "changelog" array and updates the UI. For example, when you add a new task "Do your laundry", the app records the following change in the changelog:

```jsonc
{
  // An auto-generated ID for the change
  "id": "34e85d49-e406-411e-bc38-aee45fe1449d",
  // The time you made the change
  "created_at": "2023-07-08T14:11:17.210Z",
  // The type of change you made
  "type": "create",
  // An auto-generated ID for the new task
  "task_id": "2b461556-515f-4244-9884-21c39691b6dc",
  // The name of the new task
  "task_name": "Do your laundry"
}
```

And when you complete an existing task "Make dinner", the app records the following change:

```jsonc
{
  "id": "67edf7bc-89a5-4db6-82b0-e57a66fdc897",
  "created_at": "2023-07-08T14:12:41.568Z",
  "type": "complete",
  // The ID of the task you completed
  "task_id": "df37872e-5e73-47c9-8d88-a287062e7af4"
}
```

If you're online, the app then proceeds to sync the changelog to the server. While this is happening, the app continues to record any new changes you make in the changelog (and updating the UI accordingly), but it waits for the current sync to succeed before syncing the newer changes.

If you're offline, the app doesn't try to sync the changelog, since that will fail. Instead, it continues recording any new changes you make, while waiting for you to go back online. And when you return online, it proceeds to sync.

[TODO: perhaps this paragraph should come later?] Whether or not you're offline, the app maintains a backup of the changelog in your browser's local storage, so that when you close the app, you don't lose any of your changes that are yet to sync.

The server's response to a sync request includes a `syncStatus` object describing the "sync status" of each change in the request. For example, the following response indicates that the changes with IDs `2b461556-515f-4244-9884-21c39691b6dc` and `df37872e-5e73-47c9-8d88-a287062e7af4` synced successfully.

```jsonc
{
  "syncStatus": {
    "2b461556-515f-4244-9884-21c39691b6dc": {
      "type": "ok"
    },
    "df37872e-5e73-47c9-8d88-a287062e7af4": {
      "type": "ok"
    }
  }
}
```

While the following response indicates that the change with ID `a691c5b3-f686-432d-8a7a-066f80ec4c80` failed to sync for the reason specified in the `error` property.

```jsonc
{
  "syncStatus": {
    "a691c5b3-f686-432d-8a7a-066f80ec4c80": {
      "type": "error",
      "error": "No task exists with the given task id"
    },
    "865dde4e-8d87-4a7c-963e-449159ef361c": {
      "type": "ok"
    }
  }
}
```

On receiving a response, the app removes the successful changes (if any) from the changelog to avoid resending them on the next sync.

[anchor](#0)

---

On the client side:

- The app saves changes in a changelog array in local storage and updates the UI. [Sample changelog]
- The app attempts to sync the changelog to the server if you're online.
- If you're offline, then the app waits until you're back online to sync. In the meantime, it continues pushing any new changes you make to the changelog and updating the UI.
- The server's response to a sync request typically looks thus: [Sample response]. On receiving this, the app removes those ok changes from the changelog.
- In the event that there's a sync conflict or validation error, the server responds thus: [Sample response]. And the app keeps the failed changes in the changelog, updates them thus: [Updated changelog]. Then the app alerts you: [Screenshot of alert dialog]. A sync conflict could occur if, say, you're using multiple devices, like your phone and laptop, to access the app, and the following sequence of events occur: [Sequence of events on phone and laptop]
- Other errors can (could?) occur during a sync: e.g. a network error or a server error. The app subtly notifies you of these and gives you the option to retry syncing.

On the server side:

- The app validates each change in the received changelog, saves the change to a `task_changes` database table and applies the change to a `tasks` table, where the tasks live. It does the latter two in a transaction to avoid inconsistencies when either fails (e.g. due to a sync conflict.)
- Then the server responds with a relevant result, as previously described.

Some important, finer points:

- The ids of the tasks and changes are UUIDs to ensure they never clash when generated on different devices. I learnt UUIDs are designed such that no device ever generates the same UUID twice, and no two devices ever generate the same UUID. (I also learnt that UUIDs _do_ clash in some situations, but that's beyond the scope of this writing.)
- The changes are persisted server-side just to prevent duplicates. In some situations, the client may send the same changes twice to the server. The changes aren't all idempotent, so the server persists them to identify and avoid re-applying duplicate changes. The response for duplicate changes is [Sample response]. The client treats these results as it does ok results.

## Switching to Inertia

Before the optimistic UI, I used Laravel's Blade templating engine to render the frontend of the app on the server, and sprinkles of JS for the interactivity on the client. And I continued thus when I started implementing the optimistic UI. However, I later switched to using React (via Inertia) and XState for two important reasons:

- Reusing components created on the server (via Blade) on the client side
- Expressing the logic of creating/deleting/modifying DOM nodes in response to user actions and server responses.

Sth about how seemingly trivial features invite complexity...

## Miscellaneous

- Interface design
- Accessibility in Inertia
- Scoping requirements...
