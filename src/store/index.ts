import createStore, { mutation, createModule, storeProvider } from '../vuex';
import counterModule from './counter';
import todoModule from './todos';
import covidModule from './covid';
import pokemonModule from './pokemon';

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
  setup(state) {
    const todos = createModule('todos', todoModule(state));
    const counter = createModule('counter', counterModule);
    const covid = createModule('covid', covidModule);
    const pokemon = createModule('pokemon', pokemonModule);

    const reset = mutation('resetTodos', () => {
      todos.items.value = [];
      counter.count.value = 0;
    });

    return {
      state,
      todos,
      reset,
      covid,
      pokemon,
      ...counter,
    };
  },
});

export const { provideStore, useStore } = storeProvider(store);

// @ts-ignore
window.$store = store;

export default store;
