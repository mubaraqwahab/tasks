import "./bootstrap";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { StrictMode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

const appName =
  window.document.getElementsByTagName("title")[0]?.innerText || "Tasks";

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob("./Pages/**/*.tsx")
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <StrictMode>
        <Tooltip.Provider>
          <App {...props} />
        </Tooltip.Provider>
      </StrictMode>
    );
  },
  progress: {
    color: "#4B5563",
  },
});
