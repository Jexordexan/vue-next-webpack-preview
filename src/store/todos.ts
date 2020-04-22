import { defineModule, mutation } from '../vuex';
import { RootState } from '.';
import { computed, toRefs } from 'vue';

export interface ToDo {
  id: number;
  text: string;
  completed: boolean;
}

export default (rootState: RootState) =>
  defineModule({
    name: 'todos',
    state: {
      items: [] as ToDo[],
    },
    setup({ state }) {
      const addTodo = mutation('addTodo', (text: string) => {
        state.items.push({
          id: rootState.idCounter++,
          text,
          completed: false,
        });
      });

      const completeTodo = mutation('completeTodo', ({ id, completed = true }: { id: number; completed: boolean }) => {
        const todo = state.items.find((t) => t.id === id);
        if (todo) todo.completed = completed;
      });

      const getCompletedCount = computed(() => state.items.reduce((c, t) => (t.completed ? c + 1 : c), 0));
      const getCompletedIndex = (index: number) =>
        computed(() => {
          if (index >= state.items.length) return false;
          return state.items[index].completed;
        });

      return {
        ...toRefs(state),
        addTodo,
        completeTodo,
        getCompletedCount,
        getCompletedIndex,
      };
    },
  });
