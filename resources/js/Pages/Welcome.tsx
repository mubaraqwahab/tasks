import Layout from "@/Components/Layout";
import clsx from "clsx";

export default function Welcome() {
  return (
    <Layout title="Welcome">
      <div
        className={clsx(
          "prose prose-h1:mb-0 prose-lead:mb-[1.25em] prose-a:underline-offset-2 py-6",
          "lg:prose-lg"
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
          When logged in, you can do the usual to-do list stuff&mdash;create,
          complete, uncomplete and delete tasks&mdash;and you'll see the results
          immediately, without having to wait for your changes to be sent to the
          server (i.e. without waiting for any "loading..." sign).
        </p>

        <p>
          The app assumes your changes will sync successfully with the server
          most of the time, so it doesn't wait for them to sync. Instead, it
          saves them locally and updates the UI before attempting (in the
          background) to send them to the server. Hence the "optimistic UI",
          which enables a seamless user experience. In the (hopefully) rare
          event that your changes fail to sync, the app notifies you of that and
          guides you to resolve the issue.
        </p>

        <hr />

        <p>
          I started this to explore building a minimal, production-worthy
          full-stack app. By "production-worthy", I mean (1) an app that
          implements relevant business logic (such as managing tasks) as well as
          necessary peripheral concerns (such as transactional emails), (2) an
          app that is resilient to exceptions, and (3) an app with a reliable,
          scalable architecture.
        </p>

        <p>
          The last time I tried building a similar app, I naively used a very
          low-level framework (<a href="https://expressjs.com/">Express</a>) and
          had to manually set up authentication, session management, emails,
          input validation and security measures among other backend concerns,
          which I knew little of. Thus, the app was very fragile and the
          codebase untidy.
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
          <a href="http://laravel.com/">Laravel</a>, a higher-level framework
          with several built-in features to set up a good backend. (Something
          about Laravel providing architecture and conventions)
        </p>

        <p>
          On the front end, I used React (via Laravel's Inertia) and XState to
          manage the complexity accompanying the optimistic UI I sought to
          implement.
        </p>

        {/* <p>
          I followed Todoist in several design and technical decisions (such as
          the optimistic UI). Along the way, ...something about adding (and
          learning to implement by following Todoist) optimistic UI to improve
          the UX. ...this was the fun and most time-consuming part. ...explain
          how the optimistic UI works.
        </p> */}

        <p>The source code for the app is available on my GitHub...</p>

        <h2>Stack</h2>
        <ul>
          <li>Laravel and its many packages</li>
          <li>Inertiajs with React</li>
          <li>Radix UI</li>
          <li>Tailwind CSS</li>
          <li>XState</li>
        </ul>

        <p>
          The backend stack - Laravel - was constant (I don't even remember why
          I preferred it over other similar MVC's like Symfony and Django)
        </p>

        <p>The frontend however changed over time:</p>
        <ul>
          <li>Blade with Stimulus and custom make-shift JS components</li>
          <li>Inertia with React and XState</li>
        </ul>

        <p>
          I'll discuss the reason for the switch later. It's worth noting that I
          chose to use React with Inertia, instead of Vue, which appears to be
          the de facto companion in the Laravel community. The main reason for
          this was I could move faster in React: I already knew some React, but
          I'd have had to learn Vue from scratch.
        </p>

        <h2>Problems and lessons learned?</h2>
        <ul>
          <li>Declarative, reactive UI...</li>
          <li>Web apps as distributed systems; CRDTs and CQRS</li>
          <li>Interface design</li>
          <li>Scoping requirements...</li>
          <li>Accessibility in inertia</li>
          <li>
            How seemingly simple features invite complexity: e.g. optimistic
            UI.... Were it not for the optimistic UI requirement I placed on the
            frontend, I wouldn't have needed Inertia at all; Livewire would have
            sufficed me... Mention that you'd love to see a simpler conventional
            solution to implementing optimistic UIs in laravel
          </li>
        </ul>

        <h2>Missing features/Plan</h2>
        <ul>
          <li>Undo un/complete</li>
          <li>...</li>
        </ul>
      </div>
    </Layout>
  );
}
