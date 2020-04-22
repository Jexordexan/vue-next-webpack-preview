<template>
  <div @mousemove="changeRandom">
    <div class="graph">
      <div class="bar" :style="{ width: (graph[graph.length - 1].count / size) * 100 + '%' }"></div>
      <span>{{ ((graph[graph.length - 1].count / size) * 100).toFixed(2) + '%' }}</span>
    </div>
    <div class="pixel" v-for="item in list" :key="item.name" :class="{ active: item.active }"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

interface Item {
  name: string;
  active: boolean;
}

interface Datum {
  name: string;
  timestamp: number;
  count: number;
}

export default defineComponent({
  props: {
    size: Number,
  },
  setup(props) {
    const list = ref<Item[]>([]);
    const graph = ref<Datum[]>([{ name: 'START', timestamp: Date.now(), count: 0 }]);

    for (let i = 0; i < props.size!; i++) {
      list.value.push({
        name: 'Item ' + i,
        active: false,
      });
    }

    const changeRandom = () => {
      let r = Math.random();
      r = r * props.size!;
      r = Math.floor(r);

      let entry = list.value[r];
      if (!entry) return;

      entry.active = !entry.active;

      const lastDatum = graph.value[graph.value.length - 1] || { count: 0 };
      let count = lastDatum.count;
      count += entry.active ? 1 : -1;

      graph.value.push({
        name: entry.name,
        timestamp: Date.now(),
        count,
      });
    };

    return {
      list,
      graph,
      changeRandom,
    };
  },
});
</script>

<style>
.graph {
  width: 100%;
  height: 30px;
  display: flex;
}

.bar {
  display: inline-block;
  background: #000;
  height: 30px;
}

.pixel {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: rgb(233, 233, 233);
}

.pixel.active {
  background: green;
}
</style>
