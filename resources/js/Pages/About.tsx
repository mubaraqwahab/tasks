import { useAuth } from "@/utils";
import { Head, Link } from "@inertiajs/react";
import clsx from "clsx";

export default function About() {
  const auth = useAuth();
  return (
    <>
      <Head title="About" />
      <main>
        <div
          className={clsx(
            "container max-w-2xl pt-12 pb-16",
            "lg:prose-lg lg:pt-16 lg:pb-16",
            "prose prose-a:underline-offset-2",
            "prose-h1:tracking-tight prose-h1:mb-0"
          )}
        >
          <div className="">
            <h1>Tasks</h1>
            <p className="lead">
              A simple to-do list app with an optimistic UI, built by{" "}
              <a href="https://mubaraqwahab.com/">Mubaraq</a>.
            </p>

            <p className="not-prose">
              {auth ? (
                <Link
                  href={route("tasks.index")}
                  className="HeaderItem border border-gray-400 font-semibold py-1 text-sm bg-gray-100 hover:bg-gray-200"
                >
                  Open Tasks
                </Link>
              ) : (
                <a
                  href={route("login.google")}
                  className="HeaderItem border border-gray-400 font-semibold py-1 text-sm bg-gray-100 hover:bg-gray-200"
                >
                  Continue with Google
                </a>
              )}
            </p>

            <p>
              <img
                alt="A screenshot of the My tasks page of the app."
                className="aspect-video border"
              />
            </p>
          </div>

          <hr />

          <p>
            When you're logged in, you can do the usual to-do list
            stuff&mdash;create, edit, complete, uncomplete and delete
            tasks&mdash;and you'll see the results immediately, without having
            to wait for your changes to be sent to the server (i.e. without
            waiting for any "loading..." signs).
          </p>

          <p>
            The app assumes your changes will sync successfully with the server
            most of the time, so it doesn't wait for them to sync. Instead, it
            saves them locally and updates the UI before attempting (in the
            background) to send them to the server. Hence the{" "}
            <a href="https://www.smashingmagazine.com/2016/11/true-lies-of-optimistic-user-interfaces/">
              "optimistic UI"
            </a>
            , which enables a seamless user experience. In the (hopefully) rare
            event that your changes fail to sync, the app notifies you of that
            and guides you to resolve the issue.
          </p>

          <hr />

          <p>
            I started this to explore building a minimal, production-worthy
            full-stack app. By "production-worthy", I mean (1) an app that
            implements relevant business logic (such as managing tasks) as well
            as necessary peripheral concerns (such as transactional emails), (2)
            an app that is resilient to exceptions, and (3) an app with a
            reliable, scalable architecture.
          </p>

          <p>
            The last time I tried building a similar app, I naively used a very
            low-level framework (<a href="https://expressjs.com/">Express</a>)
            and had to manually set up authentication, session management,
            emails, input validation and security measures among other backend
            concerns, which I knew little about. As a result, the app was very
            fragile and the codebase untidy.
          </p>
          {/*
        <p>
          This time, I decided to learn and use a fully featured
          framework&mdash;one that would help me do all the backend setup and
          also provide good conventions I could follow. I built this app with{" "}
          <a href="http://laravel.com/">Laravel</a>, a full-stack PHP framework
          with just the features I needed.
        </p> */}

          <p>
            Learning from that experience, I built this app with{" "}
            <a href="http://laravel.com/">Laravel</a>. Laravel is a full-stack
            PHP framework with a{" "}
            <a href="https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller">
              model-view-controller (MVC) architecture
            </a>{" "}
            and many built-in features and conventions to handle all the backend
            work I listed above (and more) with little manual configuration.
          </p>

          <p>
            I also followed <a href="https://todoist.com/">Todoist</a>, a
            popular task manager app, in several other design and technical
            decisions I made for this Tasks app. Notably, I got the optimistic
            UI idea from there and used <a href="http://react.dev/">React</a>{" "}
            (via Laravel's <a href="https://inertiajs.com/">Inertia</a>) and{" "}
            <a href="https://xstate.js.org/docs/">XState</a> on the front end to
            manage the resulting complexity.
          </p>

          <p>
            <a href="https://github.com/mubaraqwahab/tasks">
              The source code is available on my GitHub
            </a>
            , and the tech stack is as follows:
          </p>

          <ul>
            <li>
              Laravel for the overall architecture and backend heavy lifting
            </li>
            <li>MySQL for the database</li>
            <li>Postmark for sending transactional emails</li>
            <li>TypeScript for type safety in the client-side code</li>
            <li>Inertia + React for a declarative and reactive UI</li>
            <li>XState for managing UI state</li>
            <li>Tailwind CSS for styling</li>
            <li>Radix UI for accessible UI components</li>
            <li>Heroicons for icons</li>
          </ul>

          <p>
            The app currently lacks many utility features like sorting and
            filtering tasks and deleting user accounts. I plan to add them over
            time to practise iterative development.
          </p>

          <p>
            The rest of this page describes how I built some interesting parts
            of this app as well as some challenges I faced and lessons I learnt.
          </p>

          <p>NOTE: everything below this paragraph is still an early draft!</p>

          <p>TODO: credits here?</p>

          <p>TODO: TOC here?</p>

          {/* TODO: heading IDs */}
          <h2>The optimistic UI</h2>

          <p>
            The most exciting feature to build was the optimistic UI, even
            though, ironically, the idea for it only came halfway into the app.
            My initial plan was to create a traditional server-rendered app,
            where actions like adding a new task would trigger a page reload to
            save the task to the server and show the task on the page. Soon
            after completing this, I found the user experience to be terrible
            and decided to improve it with an optimistic UI.
          </p>

          <p>
            The optimistic UI in this app is based on my observations while
            reverse-engineering Todoist in my browser's DevTools. It works thus:
          </p>

          <p>On the client side:</p>
          <ul>
            <li>
              The app saves changes in an array (which I call a{" "}
              <dfn>changelog</dfn>) in local storage and updates the UI. [Sample
              changelog]
            </li>
            <li>
              The app attempts to sync the changelog to the server if you're
              online.
            </li>
            <li>
              If you're offline, then the app waits until you're back online to
              sync. In the meantime, it continues pushing any new changes you
              make to the changelog and updating the UI.
            </li>
            <li>
              The server's response to a sync request typically looks thus:
              [Sample response]. On receiving this, the app removes those ok
              changes from the changelog.
            </li>
            <li>
              In the event that there's a sync conflict or validation error, the
              server responds thus: [Sample response]. And the app keeps the
              failed changes in the changelog, updates them thus: [Updated
              changelog]. Then the app alerts you: [Screenshot of alert dialog].
              A sync conflict could occur if, say, you're using multiple
              devices, like your phone and laptop, to access the app, and the
              following sequence of events occur: [Sequence of events on phone
              and laptop]
            </li>
            <li>
              Other errors can (could?) occur during a sync: e.g. a network
              error or a server error. The app subtly notifies you of these and
              gives you the option to retry syncing.
            </li>
          </ul>

          <p>On the server side:</p>
          <ul>
            <li>
              The app validates each change in the received changelog, saves the
              change to a <code>task_changes</code> database table and applies
              the change to a <code>tasks</code> table, where the tasks live. It
              does the latter two in a transaction to avoid inconsistencies when
              either fails (e.g. due to a sync conflict.)
            </li>
            <li>
              Then the server responds with a relevant result, as previously
              described.
            </li>
          </ul>

          <p>Some important, finer points:</p>
          <ul>
            <li>
              The ids of the tasks and changes are UUIDs to ensure they never
              clash when generated on different devices. I learnt UUIDs are
              designed such that no device ever generates the same UUID twice,
              and no two devices ever generate the same UUID. (I also learnt
              that UUIDs <em>do</em> clash in some situations, but that's beyond
              the scope of this writing.)
            </li>
            <li>
              The changes are persisted server-side just to prevent duplicates.
              In some situations, the client may send the same changes twice to
              the server. The changes aren't all idempotent, so the server
              persists them to identify and avoid re-applying duplicate changes.
              The response for duplicate changes is [Sample response]. The
              client treats these results as it does ok results.
            </li>
          </ul>

          <h2>Switching to Inertia</h2>

          <p>
            Before the optimistic UI, I used Laravel's Blade templating engine
            to render the frontend of the app on the server, and sprinkles of JS
            for the interactivity on the client. And I continued thus when I
            started implementing the optimistic UI. However, I later switched to
            using React (via Inertia) and XState for two important reasons:
          </p>

          <ul>
            <li>
              Reusing components created on the server (via Blade) on the client
              side
            </li>
            <li>
              Expressing the logic of creating/deleting/modifying DOM nodes in
              response to user actions and server responses.
            </li>
          </ul>

          <p>How seemingly trivial features invite complexity</p>

          <h3>Miscellaneous</h3>

          <ul>
            <li>Interface design</li>
            <li>Accessibility in Inertia</li>
            <li>Scoping requirements...</li>
          </ul>
        </div>
      </main>
    </>
  );
}
