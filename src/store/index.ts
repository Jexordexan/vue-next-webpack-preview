import createStore, { mutation, createModule, storeProvider } from '../vuex';
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
  setup({ state }) {
    const todos = createModule('todos', todoModule(state));
    const counter = createModule('counter', counterModule);
    const covid = createModule('covid', covidModule);

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
