<script setup lang="ts">
import Form from "./Form.vue";
import { Task } from "@/types/models";
import { toRefs } from "vue";
import { reactive, computed } from "vue";

defineEmits<{
  (e: "complete" | "uncomplete" | "delete", id: string): void;
  // (e: "delete"): void;
}>();

const props = defineProps<{ task: Task }>();
const task = reactive(props.task);
const { id, name, completed_at } = toRefs(task);

const nameElementId = computed(() => `task-${id}-name`);
</script>

<template>
  <li :id="`task-${id}`" class="flex items-center py-3 border-b">
    <Form
      :action="route('tasks.update', id, false)"
      method="PATCH"
      @submit.prevent="$emit(completed_at ? 'uncomplete' : 'complete', id)"
    >
      <button
        type="submit"
        class="p-1 border rounded-full has-tooltip"
        name="completed"
        :value="completed_at ? 0 : 1"
        :aria-label="completed_at ? 'Mark as uncompleted' : 'Mark as completed'"
        :aria-describedby="nameElementId"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            fill-rule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </Form>

    <p :id="nameElementId" class="flex-grow pl-3 pr-3">
      {{ name }}
    </p>

    <Form
      :action="route('tasks.destroy', id, false)"
      method="DELETE"
      class=""
      @submit.prevent="$emit('delete', id)"
    >
      <button
        type="submit"
        :aria-describedby="nameElementId"
        aria-label="Delete"
        class="p-1 border rounded-md has-tooltip"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            fill-rule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </Form>
  </li>
</template>
