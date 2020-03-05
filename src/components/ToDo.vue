<template>
  <div>
    <form @submit.prevent="addTodo(newTodo); newTodo = ''">
      <input type="text" v-model="newTodo">
      <button>Add</button>
    </form>
    <div> Completed: {{ getCompletedCount }}</div>
    <div> First Completed: {{ firstCompleted }}</div>
    <div> Last Completed: {{ lastCompleted }}</div>
    <ul>
      <li v-for="(todo, i) in state.toDos" :key="i">
        <input type="checkbox" :checked="todo.completed" @input="completeTodo(i, $event.target.checked)" />{{ todo.text }} {{ todo.completed }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useStore } from "../store";

export default defineComponent({
  setup() {
    const { state, addTodo, completeTodo, getCompletedCount, getCompletedIndex } = useStore()
    const firstCompleted = getCompletedIndex(0)
    const newTodo = ref('')
    addTodo('hello, world')

    const lastCompleted = computed(() => state.toDos[state.toDos.length - 1].completed)
    watch(() => console.log('idCounter', state.idCounter))

    return {
      state,
      addTodo,
      newTodo,
      completeTodo,
      getCompletedCount,
      firstCompleted,
      lastCompleted
    }
  }
})
</script>

<style>

</style>