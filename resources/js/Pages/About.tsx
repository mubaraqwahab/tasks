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
                alt="A screenshot of the My tasks page"
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
            manage the resulting complexity.{" "}
            <a href="https://github.com/mubaraqwahab/tasks">
              The source code is available on my GitHub
            </a>
            .
          </p>

          <p>
            The app currently lacks many utility features like sorting and
            filtering tasks and deleting user accounts. I plan to add them over
            time to practise iterative development.
          </p>

          <p>
            The rest of this page describes how I built some interesting parts
            of this app as well as some challenges I faced and lessons I learnt.
          </p>

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
            after completing this, I found the user experience to be terrible,
            so I decided to improve it with a Todoist-style optimistic UI.
          </p>

          <p>
            TODO: reverse engineering Todoist's optimistic UI... How my
            implementation is a modified form of Todoist's... (Maybe add this to
            the previous paragraph?)
          </p>

          <p>TODO: Overview of my implementation (end to end)</p>

          <p>Related stuff</p>
          <ul>
            <li>UUIDs for task (and change?) IDs</li>
            <li>
              Switcing from Blade to Inertia to reuse server components on front
              end and for reactive UI
            </li>
            <li>How seemingly trivial features invite complexity</li>
          </ul>

          <hr />
          <ul>
            <li>The optimistic UI</li>
            <li>Declarative, reactive UI...</li>
            <li>Interface design</li>
            <li>Scoping requirements...</li>
            <li>Accessibility in Inertia</li>
          </ul>
        </div>
      </main>
    </>
  );
}
