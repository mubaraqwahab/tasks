<x-layout>
  <x-slot:head>
    <title inertia>{{ config('app.name') }}</title>
    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite([
      "resources/css/app.css",
      "resources/js/app.tsx",
      "resources/js/Pages/{$page['component']}.tsx"
    ])
    @inertiaHead
  </x-slot:head>
  <x-slot:body>
    @inertia
  </x-slot:body>
</x-layout>
