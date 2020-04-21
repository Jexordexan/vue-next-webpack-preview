import { defineModule, mutation, action } from '../vuex';
import { toRefs } from 'vue';

const wait = (ms: number) => new Promise((res) => setTimeout(() => res(), ms));

export default defineModule({
  name: 'counter',
  state: {
    counter: 0,
  },
  setup({ state }) {
    const increment = mutation('increment', () => state.counter++);
    const decrement = mutation('decrement', () => state.counter--);
    const incrementAsync = action('incrementAsync', async () => {
      await wait(500);
      increment();
    });

    const decrementAsync = action('decrementAsync', async () => {
      await wait(500);
      decrement();
    });

    return {
      ...toRefs(state),
      increment,
      incrementAsync,
      decrementAsync,
    };
  },
});
