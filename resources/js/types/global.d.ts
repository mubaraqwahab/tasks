import { PageProps as InertiaPageProps } from "@inertiajs/core";
import { AxiosInstance } from "axios";
import ziggyRoute, { Config as ZiggyConfig } from "ziggy-js";
import type { User } from "./models";

declare global {
  interface Window {
    axios: AxiosInstance;
  }

  var route: typeof ziggyRoute;
  var Ziggy: ZiggyConfig;
}

declare module "vue" {
  interface ComponentCustomProperties {
    route: typeof ziggyRoute;
  }
}

type AppPageProps<T extends Record<string, unknown> = Record<string, unknown>> =
  T & {
    auth: {
      user: User;
      csrfToken: string;
    };
  };

declare module "@inertiajs/core" {
  interface PageProps extends InertiaPageProps, AppPageProps {}
}
