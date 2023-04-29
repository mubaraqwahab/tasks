<script setup lang="ts">
withDefaults(
  defineProps<{
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  }>(),
  { method: "GET" }
);

const htmlMethods = ["GET", "POST"];
</script>

<template>
  <form :method="method === 'GET' ? method : 'POST'">
    <input
      v-if="method !== 'GET'"
      type="hidden"
      name="_token"
      :value="$page.props.csrfToken"
    />
    <input
      v-if="!htmlMethods.includes(method)"
      type="hidden"
      name="_method"
      :value="method"
    />

    <slot />
  </form>
</template>
