import Layout from "@/Components/Layout";

export default function Welcome() {
  return (
    <Layout title="Welcome">
      <div className="prose lg:prose-lg">
        <h1>Tasks</h1>
        <p>A simple to-do list app, inspired by Todoist. It allows you:</p>
        <ul>
          <li>Create, edit, un/complete and delete tasks even while offline</li>
          <li>Log in/sign up to manage your tasks on any device.</li>
        </ul>

        <h2>The Why</h2>

        <p>To learn to build.. (the goal)</p>
        <p>
          Sth about courses not teaching the mundane stuff, and sth about the
          last app(s) you built being a real mess due to the minimalist tools I
          used (e.g express)
        </p>

        <h2>Goal</h2>
        <p>
          (explore...) Create a complete, minimal, resilient production-worthy
          app. "Complete" meaning the app should not only implement the
          necessary business logic, but also the (mundane) tangential concerns
          like user account management (e.g. email verification, password
          recovery) and protection against common security vulnerabilities (e.g
          CSRF, SQL injection). "Minimal" meaning the app should have a small
          feature set, so that I may complete it in a short time. "Resilient"
          meaning the app responds gracefully to exceptions and also that the
          app is progressively enhanced
        </p>

        <h2>Corollary</h2>
        <p>
          An important consequence of the goal is that the codebase should be as
          idiomatic as possible. That is, it should use A true full-stack
          framework that would do the heavy lifting of code
          architecture/organization (what's the diff lol?), auth, security, ORM,
          email, etc. Reliable third-party packages etc over custom ones for
          other nontrivial concerns (e.g UI state management, UI components)
        </p>

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
