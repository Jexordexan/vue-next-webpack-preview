<template>
  <div>
    <p-button @click="decrementAsync">
      Decrement
    </p-button>
    Counter: {{ counter }}
    <p-button @click="incrementAsync">Increment</p-button>
    <!-- <ToDo /> -->
    {{ todos.items.length }}
    <p-button @click="reset">Reset</p-button>

    <hr />

    <!-- <Covid /> -->
    <Pokemon />
  </div>
  <!-- <List :size="5000"></List> -->
</template>

<script>
import List from './components/List.vue';
import ToDo from './components/ToDo.vue';
import Covid from './components/Covid.vue';
import Pokemon from './components/Pokemon.vue';
import { provideStore, useStore } from './store/index';
import { watch } from 'vue';

export default {
  components: {
    List,
    ToDo,
    Covid,
    Pokemon,
  },
  setup() {
    provideStore();
    const { state, todos, counter, incrementAsync, decrementAsync, reset, covid } = useStore();
    covid.fetchStateData();

    watch(() => state, console.log);
    console.log('App building');
    console.log('Initial state', state);

    return {
      reset,
      todos,
      state,
      counter,
      covid,
      incrementAsync,
      decrementAsync,
    };
  },
};
</script>
