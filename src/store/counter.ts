import { defineModule, mutation } from '../vuex';
import { toRefs } from 'vue';
import { RootState } from '.';

const wait = (ms: number) => new Promise(res => setTimeout(() => res(), ms));

export default defineModule({
  name: 'counter',
  state: {
    counter: 0,
  },
  setup({ state, module }) {
    const increment = mutation('increment', () => state.counter++);
    const decrement = mutation('decrement', () => state.counter--);
    const incrementAsync = async () => {
      await wait(500);
      increment();
    };

    const decrementAsync = async () => {
      await wait(500);
      decrement();
    };

    return {
      ...toRefs(state),
      increment,
      incrementAsync,
      decrementAsync,
    };
  },
});
