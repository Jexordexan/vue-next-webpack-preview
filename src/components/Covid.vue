<template>
  <div>
    <select v-model="metric">
      <option v-for="op in options" :key="op">{{ op }}</option>
    </select>
    <svg class="graph">
      <g v-for="(state, i) in sorted" :key="state.state">
        <rect :y="i * 20" height="19" x="0" :width="size(state)" fill="#29F"></rect>
        <text :y="i * 20 + 16" :x="size(state)">{{ state.state }} {{ state[metric] }}</text>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { useStore } from '../store';
import { computed, ref, reactive } from 'vue';
import { DataState, State } from '../store/covid';
export default {
  setup() {
    const { covid } = useStore();
    const options = reactive([
      'positive',
      'positiveScore',
      'negativeScore',
      'negativeRegularScore',
      'commercialScore',
      'score',
      'negative',
      'pending',
      'hospitalizedCurrently',
      'hospitalizedCumulative',
      'inIcuCurrently',
      'inIcuCumulative',
      'onVentilatorCurrently',
      'onVentilatorCumulative',
      'recovered',
      'death',
      'hospitalized',
      'total',
      'totalTestResults',
      'posNeg',
    ]);
    const metric = ref<keyof DataState>('totalTestResults');
    const valOf = (state: DataState) => state[metric.value];
    const sorted = computed(() =>
      covid.state.states.sort((a, b) => (valOf(a) > valOf(b) ? 1 : valOf(a) < valOf(b) ? -1 : 0))
    );
    const max = computed(() => Math.max(...sorted.value.map(valOf)));
    return {
      options,
      metric,
      covid,
      sorted,
      max,
      size: (state: DataState) => {
        return (valOf(state) / max.value) * 1000;
      },
    };
  },
};
</script>

<style scoped>
.graph {
  height: 1200px;
}
</style>
