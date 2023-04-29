<script setup lang="ts">
import Layout from "@/Components/Layout.vue";
import Form from "@/Components/Form.vue";
import TaskLi from "@/Components/TaskLi.vue";
import type { Task } from "@/types/models";

defineProps<{ upcomingTasks: Task[]; completedTasks: Task[] }>();
</script>

<template>
  <Layout title="My tasks">
    <!-- Consider putting the status (syncing/synced/offline) next to the h1 -->
    <h1 class="font-semibold text-2xl mb-6">My tasks</h1>

    <div class="mb-3">Errors? {{ JSON.stringify($page.props.errors) }}</div>

    <Form
      method="POST"
      :action="route('tasks.store', {}, false)"
      class="mb-6 relative"
    >
      <input
        type="text"
        id="taskName"
        name="name"
        required
        maxlength="255"
        class="block w-full rounded-lg px-3 py-2 [&:placeholder-shown+label]:inline-block [&:not(:placeholder-shown)+label]:hidden"
        placeholder=" "
      />
      <!-- placeholder=" " above is required for :placeholder-shown to work -->
      <label for="taskName" class="absolute inset-x-3 top-1/2 -translate-y-1/2">
        Add a new task
      </label>
      <button
        type="submit"
        aria-label="Add task"
        class="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 border rounded-md has-tooltip"
      >
        <!-- TODO: extract icons into components? -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </Form>

    <details open class="mb-8">
      <summary class="w-fit font-semibold mb-3">Upcoming</summary>
      <!-- TODO: add :empty class or something -->
      <ul v-for="task in upcomingTasks">
        <TaskLi :task="task" :key="task.id" />
      </ul>
      <p v-if="upcomingTasks.length === 0">No tasks?</p>
    </details>

    <details>
      <summary class="w-fit font-semibold mb-3">Completed</summary>
      <ul v-for="task in completedTasks">
        <TaskLi :task="task" :key="task.id" />
      </ul>
      <p v-if="completedTasks.length === 0">No tasks?</p>
    </details>
  </Layout>
</template>
