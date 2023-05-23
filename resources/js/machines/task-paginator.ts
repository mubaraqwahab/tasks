import { TaskPageProps } from "@/Pages/Tasks";
import { Paginator } from "@/types";
import { Task } from "@/types/models";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { assign, createMachine } from "xstate";
import { sendParent } from "xstate/lib/actions";

export const paginatorMachine = createMachine(
  {
    id: "taskPaginator",
    initial: "indeterminate",
    states: {
      indeterminate: {
        always: [
          {
            target: "notAllLoaded",
            cond: "moreToLoad",
          },
          {
            target: "allLoaded",
          },
        ],
      },
      notAllLoaded: {
        initial: "normal",
        states: {
          normal: {},
          failedToLoad: {},
        },
        on: {
          loadMore: {
            target: "loadingMore",
          },
        },
      },
      allLoaded: {
        type: "final",
      },
      loadingMore: {
        invoke: {
          src: "loadMoreTasks",
          onDone: [
            {
              target: "indeterminate",
              actions: ["sendLoadedTasks", "setNextPageURL"],
            },
          ],
          onError: [
            {
              target: "#taskPaginator.notAllLoaded.failedToLoad",
            },
          ],
        },
      },
    },
    schema: {
      context: {} as {
        nextPageURL: string | null;
        pagePropKey: "upcomingPaginator" | "completedPaginator";
      },
      events: {} as { type: "loadMore" },
      services: {} as {
        loadMoreTasks: { data: Paginator<Task> };
      },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import("./task-paginator.typegen").Typegen0,
  },
  {
    actions: {
      setNextPageURL: assign({
        nextPageURL(_, event) {
          return event.data.next_page_url;
        },
      }),
      sendLoadedTasks: sendParent((_, event) => {
        return { type: "loadedMore", tasks: event.data.data };
      }),
    },
    guards: {
      moreToLoad: (context) => !!context.nextPageURL,
    },
    services: {
      async loadMoreTasks(context) {
        const page = getInertiaPage();

        // Simulate Inertia's router.get (without actually navigating)
        const response = await axios.get<{ props: Partial<TaskPageProps> }>(
          context.nextPageURL!,
          {
            headers: {
              "X-Inertia": true,
              "X-Inertia-Version": page.version,
              "X-Inertia-Partial-Data": context.pagePropKey,
              "X-Inertia-Partial-Component": "Tasks",
            },
          }
        );

        console.log({ page, response });
        const pageProps = response.data.props;
        return pageProps[context.pagePropKey]!;
      },
    },
  }
);

function getInertiaPage(): ReturnType<typeof usePage> {
  return JSON.parse(document.getElementById("app")!.dataset.page!);
}

if (import.meta.env.DEV) {
  // @ts-ignore
  window.getInertiaPage = getInertiaPage;
}
