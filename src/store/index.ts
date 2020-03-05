import { storeProvider } from "../useStore";
import createStore, { mutation } from "../vuex";
import { computed } from "vue";
import counterModule from "./counter";

export interface ToDo {
  id: number,
  text: string,
  completed: boolean
}

export interface RootState {
  idCounter: number,
  toDos: ToDo[]
}

const state: RootState = {
  idCounter: 0,
  toDos: [],
}

const store = createStore({
  state,
  setup({ state, module }) {
    const addTodo = mutation('addTodo', (text: string) => {
      state.toDos.push({
        id: state.idCounter++,
        text,
        completed: false,
      })
    })

    const completeTodo = mutation('completeTodo', (id: number, completed: boolean = true) => {
      const todo = state.toDos.find(t => t.id === id)
      if (todo) todo.completed = completed
    })

    const getCompletedCount = computed(() => state.toDos.reduce((c, t) => t.completed ? c + 1 : c, 0))
    const getCompletedIndex = (index: number) => computed(() => state.toDos[index].completed)
    const counter = module(counterModule(state))

    return {
      state,
      addTodo,
      completeTodo,
      getCompletedCount,
      getCompletedIndex,
      ...counter
    }
  }
})


export const { provideStore, useStore } = storeProvider(store)

export default store
