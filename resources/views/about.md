When you're logged in, you can do the usual to-do list stuff—create, edit, complete, uncomplete and delete tasks—and you'll see the results immediately, without having to wait for your changes to be sent to the server (i.e. without waiting for any "loading..." signs).

The app assumes your changes will sync successfully with the server most of the time, so it doesn't wait for them to sync. Instead, it saves them locally and updates the UI before attempting (in the background) to send them to the server. Hence the ["optimistic UI"](https://www.smashingmagazine.com/2016/11/true-lies-of-optimistic-user-interfaces/), which enables a seamless user experience. In the (hopefully) rare event that your changes fail to sync, the app notifies you of that and guides you to resolve the issue.

---

I started this to explore building a minimal, production-worthy full-stack app. By "production-worthy", I mean (1) an app that implements relevant business logic (such as managing tasks) as well as necessary peripheral concerns (such as transactional emails), (2) an app that is resilient to exceptions, and (3) an app with a reliable, scalable architecture.

The last time I tried building a similar app, I naively used a very low-level framework ([Express](https://expressjs.com/)) and had to manually set up authentication, session management, emails, input validation and security measures among other backend concerns, which I knew little about. As a result, the app was very fragile and the codebase untidy.

Learning from that experience, I built this app with [Laravel](http://laravel.com/). Laravel is a full-stack PHP framework with a [model-view-controller (MVC) architecture](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) and many built-in features and conventions to handle all the backend work I listed above (and more) with little manual configuration.

I also followed [Todoist](https://todoist.com/), a popular task manager app, in several other design and technical decisions I made for this Tasks app. Notably, I got the optimistic UI idea from there and used [React](http://react.dev/) (via Laravel's [Inertia](https://inertiajs.com/)) and [XState](https://xstate.js.org/docs/) on the front end to manage the resulting complexity.

[The source code is available on my GitHub](https://github.com/mubaraqwahab/tasks), and the tech stack is as follows:

- Laravel for the overall architecture and backend heavy lifting
- MySQL for the database
- Postmark for sending transactional emails
- TypeScript for type safety in the client-side code
- Inertia + React for a declarative and reactive UI
- XState for managing UI state
- Tailwind CSS for styling
- Radix UI for accessible UI components
- Heroicons for icons

The app currently lacks many utility features like sorting and filtering tasks and deleting user accounts. I plan to add them over time to practise iterative development.

The rest of this page describes how I built some interesting parts of this app as well as some challenges I faced and lessons I learnt.

NOTE: everything below this paragraph is still an early draft!

TODO: credits here?

TODO: TOC here?

<!-- TODO: heading IDs -->

## The optimistic UI

The most exciting feature to build was the optimistic UI, even though, ironically, the idea for it only came halfway into the app. My initial plan was to create a traditional server-rendered app, where actions like adding a new task would trigger a page reload to save the task to the server and show the task on the page. Soon after completing this, I found the user experience to be terrible and decided to improve it with an optimistic UI.

The optimistic UI in this app is based on my observations while reverse-engineering Todoist in my browser's DevTools. It works thus:

On the client side:

- The app saves changes in an array (which I call a changelog) in local storage and updates the UI. [Sample changelog]
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

How seemingly trivial features invite complexity

## Miscellaneous

- Interface design
- Accessibility in Inertia
- Scoping requirements...