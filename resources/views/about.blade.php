<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>About Tasks</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css'])
  </head>
  <body class="font-sans antialiased">
    <main>
      <div
        class="
          container max-w-2xl pt-12 pb-16
          prose prose-a:underline-offset-2 prose-h1:tracking-tight prose-h1:mb-0 prose-pre:border
          lg:prose-lg lg:pt-16 lg:pb-16
        "
      >
        <div class="">
          <h1>Tasks</h1>
          <p class="lead">A simple to-do list app with an optimistic UI and offline mode, built by <a href="https://mubaraqwahab.com/">Mubaraq</a>.</p>
          <p class="not-prose mb-[3em] lg:mb-[3em]">
            @auth
              <a
                href='{{ route("tasks.index") }}'
                class="HeaderItem border border-gray-400 font-semibold py-1 text-sm bg-gray-100 hover:bg-gray-200"
              >
                Open Tasks
              </a>
            @endauth
            @guest
              <a
                href='{{ route("login.google") }}'
                class="HeaderItem border border-gray-400 font-semibold py-1 text-sm bg-gray-100 hover:bg-gray-200"
              >
                Continue with Google
              </a>
            @endguest
          </p>

          <p><img alt="A screenshot of the My tasks page of the app." class="aspect-video border" /></p>
        </div>
        <hr />

        @php
          $parsedown = new ParsedownExtra();
          $disk = Storage::build([
            'driver' => 'local',
            'root' => resource_path('views'),
          ]);
          $md = $disk->get('about.md');
        @endphp
        {!! $parsedown->text($md) !!}
      </div>
    </main>
    <script src="https://unpkg.com/shiki"></script>
    <script>
      (async function () {
        const highlighter = await shiki.getHighlighter({
          theme: "github-dark",
          langs: ["js", "jsonc"],
        });
        const langClassPrefix = "language-";
        document
        .querySelectorAll(`pre > code[class*=${langClassPrefix}]`)
        .forEach((codeBlock) => {
          const langClass = Array.from(codeBlock.classList).find((c) => c.startsWith(langClassPrefix));
          const lang = langClass.slice(langClassPrefix.length);
          const highlighted = highlighter.codeToHtml(codeBlock.textContent, { lang });
          codeBlock.parentElement.outerHTML = highlighted;
        });
      })()
    </script>
  </body>
</html>
