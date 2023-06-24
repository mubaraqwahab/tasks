/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios, { AxiosError } from "axios";

window.axios = axios;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Credit: https://dev.to/grantholle/better-csrf-refreshing-in-laravel-and-axios-177c
axios.interceptors.response.use(undefined, async (error: AxiosError) => {
  if (error.response?.status === 419) {
    await axios.get(route("sanctum.csrf-cookie"));
    return axios(error.response.config);
  } else if (error.response?.status === 409) {
    // See https://inertiajs.com/the-protocol#asset-versioning
    // TODO: this is a temporary (bad) fix.
    // The appropriate thing to do is to navigate to the URL
    // specified by Inertia in the response headers, just like
    // Inertia does.
    // Also consider not implementing this at all; what if you
    // could use Inertia's router for the infinite scroll?
    window.location.reload();
  }
  throw error;
});

let ziggyRoute = window.route;

/**
 * A convenience wrapper over Ziggy's `route()` with the absolute arg
 * set to `false` by default. This means `route()` calls will now, by
 * default, return URLs like `'/abc'` instead of `'https://example.com/abc'`
 */
window.route = function route(name, params, absolute = false, config) {
  // @ts-ignore
  return ziggyRoute(name, params, absolute, config);
};
