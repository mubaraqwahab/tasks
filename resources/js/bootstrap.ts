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
    console.log("Refreshing expired session");
    await axios.get(route("sanctum.csrf-cookie"));
    console.log("Session refreshed");
    return axios(error.response.config);
  }
  throw error;
});

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';

// import Pusher from 'pusher-js';
// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
//     wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
//     wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//     wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });

let ziggyRoute = window.route;

/**
 * A convenience wrapper over Ziggy's route() with the absolute arg
 * set to false by default. This means route() calls will now, by
 * default, return URLs like '/abc' instead of 'https://example.com/abc'
 */
window.route = function route(name, params, absolute = false, config) {
  // @ts-ignore
  return ziggyRoute(name, params, absolute, config);
};
