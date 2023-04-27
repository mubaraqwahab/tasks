# Note

## Todoist

Todoist shows no indicator when online. But when offline, it shows a warning sign (button) indicating that changes will be saved locally but synced when online again. Clicking the button attempts to sync.

Changes are recorded first in a local storage queue thus:

```jsonc
[
  {
    "type": "item_complete",
    "args": {
      "id": "6400599290",
      "completed_at": "2023-04-02T10:12:20.0155Z",
      "force_history": false
    },
    "uuid": "76f11df7-fe95-ca4d-9f88-f5f47843537a"
  },
  {
    "type": "item_uncomplete",
    "args": {
      "id": "6400599290"
    },
    "uuid": "5d95fdef-6ed5-302a-6cad-5bfc2e17913b"
  },
  {
    "type": "item_add",
    "temp_id": "_1680430200631",
    "args": {
      "id": "_1680430200631",
      "due": null,
      "project_id": "2259397742",
      "section_id": null,
      "parent_id": null,
      "checked": false,
      "user_id": "32750403",
      "in_history": 0,
      "collapsed": false,
      "added_at": "2023-04-02T10:14:14.336Z",
      "assigned_by_uid": null,
      "responsible_uid": null,
      "added_by_uid": "32750403",
      "labels": [],
      "priority": 1,
      "content": "Testing",
      "child_order": 180
    },
    "uuid": "2c739507-a43b-dc1c-c8d8-f39938ae5960"
  },
  {
    "type": "item_update",
    "args": {
      "due": null,
      "labels": [],
      "priority": 1,
      "responsible_uid": null,
      "id": "_1680430200631",
      "checked": false,
      "user_id": "32750403",
      "in_history": 0,
      "collapsed": false,
      "added_at": "2023-04-02T10:14:14.336Z",
      "assigned_by_uid": null,
      "added_by_uid": "32750403",
      "content": "Testinggg",
      "item_order": 17,
      "indent": 1
    },
    "uuid": "b0c0a6bb-dc44-1467-4b1b-5f325b4969cf"
  },
  {
    "type": "item_delete",
    "args": {
      "id": "_1680430200631"
    },
    "uuid": "6b67b251-2fae-38f1-1ee1-dac3aa3ea32b"
  }
]
```

And then the queue is immediately synced with the remote via a POST request to a `/api/v.../sync` endpoint. (This request fails when offline, but it is retried once online again)

The response to this request (when online, of course) contains two important values:

```jsonc
{
  // truncated...
  // The sync statuses of each item in the queue
  "sync_status": {
    "2c739507-a43b-dc1c-c8d8-f39938ae5960": "ok",
    "5d95fdef-6ed5-302a-6cad-5bfc2e17913b": "ok",
    "6b67b251-2fae-38f1-1ee1-dac3aa3ea32b": "ok",
    "76f11df7-fe95-ca4d-9f88-f5f47843537a": "ok",
    "b0c0a6bb-dc44-1467-4b1b-5f325b4969cf": "ok"
  },
  // The mapping of the temp IDs assigned locally to new items
  // to the actual database IDs.
  "temp_id_mapping": {
    "_1680430200631": "6755630423"
  }
}
```

The ID mapping object is used to update the temp IDs wherever they are used (such as in DOM attributes), while the sync status object is used to clear the items in the queue.

If the sync status object is as follows:

```jsonc
{
  "21680dc4-4609-4c20-bd5f-a4910b441972": "ok",
  "a8d96193-b6df-f53c-21be-ee00cb78a0a0": "ok",
  "e54c5e52-26de-8c9c-0c5c-0d07ef569050": {
    "error": "Item content is empty",
    "error_code": 61,
    "error_extra": {},
    "error_tag": "ITEM_CONTENT_EMPTY",
    "http_code": 400
  }
}
```

Then the queue item with UUID `e54...` remains in the queue.

The warning indicator appears again (even if online) stating that some updates couldn't be synced. Clicking the indicator opens the following dialog:

![Todoist's "Sync issues" dialog](Screenshot%202023-04-02%20121326.png)

I feel the errors listed in the dialog are a bit too vague and technical. But then again, I don't expect a regular user to encounter them; I encountered them only because I intentionally modified a queue item in local storage. Plus it seems the errors are meant to be sent to Todoist's support team, as clicking "Show full log" displays the problematic items in JSON format, as follows (Note that Todoist also updates the items in local storage as shown below):

```jsonc
[
  {
    "type": "item_add",
    "temp_id": "_1680430200634",
    "args": {
      "id": "_1680430200634",
      "due": null,
      "project_id": "2259397742",
      "section_id": null,
      "parent_id": null,
      "checked": false,
      "user_id": "32750403",
      "in_history": 0,
      "collapsed": false,
      "added_at": "2023-04-02T10:55:27.589Z",
      "assigned_by_uid": null,
      "responsible_uid": null,
      "added_by_uid": "32750403",
      "labels": [],
      "priority": 1,
      "content": "",
      "child_order": 182
    },
    "uuid": "e54c5e52-26de-8c9c-0c5c-0d07ef569050",
    "last_error": {
      "error": "Item content is empty",
      "error_code": 61,
      "error_extra": {},
      "error_tag": "ITEM_CONTENT_EMPTY",
      "http_code": 400
    },
    "retry_count": 15
  },
  {
    "type": "item_delete",
    "args": {
      "id": "_1680430200634"
    },
    "uuid": "75a4bb32-47d6-9f81-72b9-6c4004c756bc",
    "last_error": {
      "error": "Invalid temporary id",
      "error_code": 16,
      "error_extra": {},
      "error_tag": "INVALID_TEMPID",
      "http_code": 400
    },
    "retry_count": 10
  }
]
```

If you make multiple changes quickly, Todoist batches them into a single sync request. However, it still sends sync requests with empty commands lists for every change (which I find strange).

**Tangent:** There are undo commands too, like `'item_complete_undo'`

## Pain points

### Reusing server components on the client

I have the following component in blade which renders the DOM for a task:

```php
<x-task-li :$task></x-task-li>
```

On the client, I also need to render tasks, but I can't reuse the same abstraction, since it only exists on the server. So I have to create yet another abstraction on the client (and keep it in sync with the server-side one, if that ever changes).

My current workaround for this problem is to render a template task on the server and clone the template on the client:

```php
<template id="taskLiTemplate">
  <x-task-li
    :task="[
      'id' => '$id',
      'name' => '$name',
      'completed' => false,
      'created_at' => '$createdAt',
      // TODO: change
      'completed_at' => null,
    ]"
  ></x-task-li>
</template>
```

```ts
const templateStr = document.getElementById("taskLiTemplate")!.innerHTML;
const taskLiHTMLStr = templateStr
  // %24 for encoded URI component
  .replace(/(\$|%24)id/g, id)
  .replace(/\$name/g, name)
  .replace(/\$createdAt/g, createdAt);

const taskLi = this.htmlStrToNode(taskLiHTMLStr) as HTMLLIElement;

// ...
```

Cloning these template nodes is very imperative, unlike using the server components.

Web components seem like a solution to my problem. I could render the component server side, then create new components on the client with `document.createElement('task-li')`. But SSR appears to be experimental and nontrivial in web component land. Also, `document.createElement` would still be imperative.

### Reactive updates

When offline, my app assigns a temporary id to newly created tasks. This id is used in several places in the task DOM and also in the local storage queue. When the app comes online, it syncs the queue with the server, and the server responds with a mapping of temporary ids to real ids, so the client can update the temporary ids wherever they are used.

Updating the ids is tedious however, as it requires maintaining a list of DOM node attributes and local storage queue items using the temporary ids. And that list could go stale very quickly, if the server renders a different DOM structure.

I'd like to have a reactive system that tracks 'state' variables (like id) and their consumers, so that the consumers are automatically updated whenever the variables change. This system would complement the server-client components described in the previous section by making them dynamic.

### Type safety on the server and across the network

I use TypeScript on the client for type safety. However, on the server, type safety is almost nonexistent due to PHP's weak type system. Furthermore, there's no way to statically enforce API contracts between server and client. The current workaround is to define types on the client for server responses, and validate request data on the server &mdash; and this appears to be the standard thing to do in server-rendered apps.

(I think other PHP-optimized editors/IDEs like PhpStorm would improve the dev experience better than VS Code, which is JS/TS-optimized)

### Optimistic UI

Were it not for the fact that the UI is optimistic and offline-capable, conventional Laravel solutions like Livewire would have sufficed me.

### Offline complexity

The problems of a distributed system... (This is related to the above)
