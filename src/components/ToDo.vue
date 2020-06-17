<template>
  <div>
    <form
      @submit.prevent="
        addTodo(newTodo);
        newTodo = '';
      "
    >
      <a-text-input v-model="newTodo" />
      <a-button>Add</a-button>
    </form>
    <div>Completed: {{ getCompletedCount }}</div>
    <div>First Completed: {{ firstCompleted }}</div>
    <div>Last Completed: {{ lastCompleted }}</div>
    <ul>
      <li v-for="todo in items" :key="todo.id">
        <input
          type="checkbox"
          :checked="todo.completed"
          @input="completeTodo({ id: todo.id, completed: $event.target.checked })"
        />
        {{ todo.text }}
        {{ todo.completed }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue';
import { useStore } from '../store';

export default defineComponent({
  setup() {
    const store = useStore();
    const { state: rootState } = store;
    const { items, addTodo, completeTodo, getCompletedCount, getCompletedIndex } = store.todos;
    const firstCompleted = getCompletedIndex(0);
    const newTodo = ref('');
    console.log('Todos building');
    addTodo('hello, world');
    addTodo('hello, sun');
    addTodo('hello, moon');
    addTodo('hello, mars');

    const lastCompleted = computed(() => (items.value.length ? items.value[items.value.length - 1].completed : false));
    return {
      items,
      addTodo,
      newTodo,
      completeTodo,
      getCompletedCount,
      firstCompleted,
      lastCompleted,
    };
  },
});
</script>

<style></style>
