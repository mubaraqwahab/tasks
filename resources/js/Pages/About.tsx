import { useAuth } from "@/utils";
import { Head, Link } from "@inertiajs/react";
import clsx from "clsx";

export default function About() {
  const auth = useAuth();
  return (
    <>
      <Head title="About" />
      <header className="border-b bg-white">
        <div className="container flex justify-between items-center py-2">
          <Link href="/" className="font-medium text-lg">
            Tasks
          </Link>

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
        </div>
      </header>
      <main>
        <div
          className={clsx(
            "container max-w-2xl pt-12 pb-16",
            "prose prose-a:underline-offset-2",
            "lg:prose-lg lg:pt-8 lg:pb-10"
          )}
        >
          <h1>Tasks</h1>
          <p className="lead">
            A simple to-do list app with an optimistic UI, inspired by{" "}
            <a href="https://todoist.com/">Todoist</a>.
          </p>

          {/* <p>
            <img alt="A screenshot of the My tasks page" />
          </p> */}

          <p>
            When you're logged in, you can do the usual to-do list
            stuff&mdash;create, edit, complete, uncomplete and delete
            tasks&mdash;and you'll see the results immediately, without having
            to wait for your changes to be sent to the server (i.e. without
            waiting for any "loading..." sign).
          </p>

          <p>
            The app assumes your changes will sync successfully with the server
            most of the time, so it doesn't wait for them to sync. Instead, it
            saves them locally and updates the UI before attempting (in the
            background) to send them to the server. Hence the "optimistic UI",
            which enables a seamless user experience. In the (hopefully) rare
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
            PHP framework with many built-in features and conventions to handle
            all the backend work I listed above (and more) with little manual
            configuration.
          </p>

          <p>
            I also followed <a href="https://todoist.com/">Todoist</a>, a
            popular task manager app, in several other design and technical
            decisions I made for this Tasks app. Notably, I got the optimistic
            UI idea from there and used <a href="http://react.dev/">React</a>{" "}
            (via Laravel's <a href="https://inertiajs.com/">Inertia</a>) and{" "}
            <a href="https://xstate.js.org/docs/">XState</a> on the front end to
            manage the resulting complexity.{" "}
            <a href="https://github.com/mubaraqwahab/tasks">
              The source code is available on my GitHub
            </a>
            .
          </p>

          <p>
            The app currently lacks many utility features like sorting and
            filtering tasks and setting task deadlines. I plan to them over time
            to practise iterative development.
          </p>

          <p>
            The rest of this page describes some interesting challenges I faced
            while developing this app, as well as lessons I learnt.
          </p>

          <h2>Challenges and lessons learned</h2>
          <p>TODO</p>
          <ul>
            <li>Declarative, reactive UI...</li>
            <li>Web apps as distributed systems; CRDTs and CQRS</li>
            <li>Interface design</li>
            <li>Scoping requirements...</li>
            <li>Accessibility in inertia</li>
            <li>
              How seemingly simple features invite complexity: e.g. optimistic
              UI.... Were it not for the optimistic UI requirement I placed on
              the frontend, I wouldn't have needed Inertia at all; Livewire
              would have sufficed me... Mention that you'd love to see a
              simpler, conventional solution to implementing optimistic UIs in
              laravel
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
