<template>
  <ul>
    <li v-for="state in sorted" :key="state.state">
      {{ state.state }} {{ state.totalTestResults }}
    </li>
  </ul>

  <pre>{{ covid.state.daily }}</pre>
</template>

<script>
import { useStore } from "../store";
import { computed } from "vue";
export default {
  setup() {
    const { covid } = useStore();
    const sorted = computed(() =>
      covid.state.states.sort((a, b) => a.totalTestResults - b.totalTestResults)
    );
    return {
      covid,
      sorted
    };
  }
};
</script>

<style>
</style>