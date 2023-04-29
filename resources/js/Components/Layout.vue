<script setup lang="ts">
import Form from "@/Components/Form.vue";
import { Head } from "@inertiajs/vue3";

defineProps<{ title: string }>();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<template>
  <Head :title="title">
    <slot name="head" />
  </Head>
  <header class="border-b">
    <div class="container flex justify-between items-center py-3">
      <a href="/">Tasks</a>
      <details>
        <summary>{{ $page.props.auth.user.name }}</summary>
        <ul>
          <li>
            <a href="/account">Account</a>
          </li>
          <li>
            <Form method="POST" :action="route('logout', {}, false)">
              <button type="submit">Log out</button>
            </Form>
          </li>
        </ul>
      </details>
    </div>
  </header>
  <main>
    <div class="container py-6" v-bind="$attrs">
      <slot />
    </div>
  </main>
</template>
