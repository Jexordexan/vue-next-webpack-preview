<template>
  <button class="bg-blue-500 text-white hover:bg-blue-400 click:bg-blue-700 rounded-full py-2 px-3">
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {},
});
</script>
