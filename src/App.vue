<template>
  <div>
    <img src="./logo.png" />
    <h1>Hello Vue 3!</h1>
    <button @click="decrementAsync">Decrement</button>
    Counter: {{ counter }}
    <button @click="incrementAsync">Increment</button>
    <ToDo />
    {{ todos.items.length }}
    <pre>{{ state }}</pre>
    <button @click="reset">Reset</button>

    <hr />

    <Covid />
  </div>
  <!-- <List :size="1200"></List> -->
</template>

<script>
import List from './components/List.vue';
import ToDo from './components/ToDo.vue';
import Covid from "./components/Covid.vue";
import { provideStore, useStore } from "./store/index";
import { watch } from "vue";

export default {
  components: {
    List,
    ToDo,
    Covid
  },
  setup() {
    provideStore();
    const {
      state,
      todos,
      counter,
      incrementAsync,
      decrementAsync,
      reset,
      covid
    } = useStore();
    covid.fetchStateData();

    watch(() => state, console.log);
    console.log('App building');

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

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
