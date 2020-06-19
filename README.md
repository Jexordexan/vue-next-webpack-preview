# Nuex

This state management library is fully type complete and managed within the ecosystem of TypeScript

## Creating a store

```js
import createStore, { mutation, action } from 'nuex';

const store = createStore({
  state: {
    counter: 0,
  },
  init(state) {
    // state is reactive
    const increment = mutation('increment', () => state.count++);

    return {
      state,
      increment,
    };
  },
});

store.increment(); // Commits the mutation "increment"
```

## Component usage

You'll want to use your state, right? So you need a way to get it into your app. Use the included `storeProvider()` function to create helpers for injecting the store into your components.

`store.js`

```js
import { createStore, storeProvider, ... } from 'nuex'

const store = createStore({
  state: {
    counter: 0,
  },
  init(state) {
    const increment = mutation(() => state.count++);

    return {
      state,
      increment,
    };
  },
});

export const { provideStore, useStore } = storeProvider(store)
```

`App.vue`

```html
<template>
  ...
</template>

<script>
  import { provideStore } from '@/store';

  export default {
    setup() {
      // Provide the store from your root component to all child components
      provideStore();
    },
  };
</script>
```

`Component.vue`

```html
<template>
  <span>{{ counter }}</span>
  <button @click="">Increment</button>
</template>

<script>
  import { useStore } from '@/store';

  export default {
    setup() {
      const { state, increment } = useStore();

      return {
        increment,
      };
    },
  };
</script>
```

## Mutations

Mutations are synchronous operations that mutate the `state` of a store. They are used to label important operations on your data.
Mutations can help debug problems and trace down when and why state is changing. Mutations are optional in Nuex, since all cahnges are automatically tracked. but they can be helpful in the debugger.

In Nuex, mutations can be given a name as the first argument or they inherit their name when they are returned from `init()`.

```js
import { createStore, mutation } from 'nuex';

const store = createStore({
  state: {
    counter: 0,
  },
  init(state) {
    const increment = mutation('INCREMENT', () => state.counter++);
    const decrement = mutation(() => state.counter--);
    const clear = mutation(() => {
      state.counter = 0;
    });

    return {
      state,
      increment,
      decrement,
      reset: clear,
    };
  },
});

store.increment(); // commits the "INCREMENT" mutation
store.decrement(); // commits the "decrement" mutation
store.reset(); // commits the "reset" mutation
```

## Actions

Actions are just functions that call mutations, they can be asynchronous too!

You can either make actions with regular functions or import the `action` function from Nuex.

```js
import { createStore, mutation, action } from 'nuex'
import getUser from './dataSource'

const store = createStore({
  state: {
    loading: false
    user: null,
  },
  init(state) {

    const fetchUser = action(async () => {
      state.loading = true
      try {
        state.user = await getUser()
      } finally {
        state.loading = false
      }
    })

    return {
      fetchUser,
    };
  },
});

store.fetchUser(); // calls the "fetchUser" action which changes the loading and user state.
```
