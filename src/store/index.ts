import { storeProvider } from '../useStore';
import createStore, { mutation } from '../vuex';
import { computed } from 'vue';
import counterModule from './counter';
import todoModule from './todos';
import covidModule from './covid';

export interface ToDo {
  id: number;
  text: string;
  completed: boolean;
}

export interface RootState {
  idCounter: number;
}

const state: RootState = {
  idCounter: 0,
};

const store = createStore({
  state,
  setup({ state, module }) {
    const todos = module(todoModule(state));
    const counter = module(counterModule);
    const covid = module(covidModule);

    const reset = mutation('resetTodos', () => {
      todos.items.value = [];
      counter.counter.value = 0;
    });

    return {
      state,
      todos,
      reset,
      covid,
      ...counter,
    };
  },
});

export const { provideStore, useStore } = storeProvider(store);

export default store;
