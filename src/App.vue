<template>
  <div class="flex h-screen">
    <div class="w-1/2 h-full overflow-scroll">
      <a-button @click="decrementAsync">
        Decrement
      </a-button>
      Counter: {{ count }}
      <a-button @click="incrementAsync">Increment</a-button>
      <ToDo />
      {{ todos.items.length }}
      <a-button @click="reset">Reset</a-button>

      <hr />

      <!-- <Covid /> -->
      <Pokemon />
    </div>
    <div class="w-1/2 h-full overflow-scroll">
      <pre class="text-sm">
        {{ state }}
      </pre>
    </div>
  </div>
  <!-- <List :size="5000"></List> -->
</template>

<script>
import List from './components/List.vue';
import ToDo from './components/ToDo.vue';
import Covid from './components/Covid.vue';
import Pokemon from './components/Pokemon.vue';
import { provideStore, useStore } from './store/index';
import { watch, watchEffect } from 'vue';

export default {
  components: {
    List,
    ToDo,
    Covid,
    Pokemon,
  },
  setup() {
    provideStore();
    const { state, todos, count, incrementAsync, decrementAsync, reset, covid } = useStore();
    // covid.fetchStateData();

    return {
      reset,
      todos,
      state,
      count,
      covid,
      incrementAsync,
      decrementAsync,
    };
  },
};
</script>
