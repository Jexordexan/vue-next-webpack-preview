<template>
  <div @mousemove="changeRandom">
    <div class="graph">
      <div class="bar" v-for="datum in graph" :key="datum.timestamp" :style="{ height: (datum.count / size) + '%' }"></div>
    </div>
    <div v-for="item in list" :key="item.name">
      {{ item.name }} {{ item.active }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

interface Item {
  name: string
  active: boolean
}

interface Datum {
  name: string
  timestamp: number
  count: number
}

export default defineComponent({
  props: {
    size: Number,
  },
  setup(props) {
    const list = ref<Item[]>([])
    const graph = ref<Datum[]>([])

    for (let i = 0; i < props.size!; i++) {
      list.value.push({
        name: 'Item ' + i,
        active: false,
      })
    }

    const changeRandom = () => {
      let r = Math.random()
      r = r * props.size!
      r = Math.floor(r)

      let entry = list.value[r]
      if (!entry) return

      entry.active = !entry.active

      const lastDatum = graph.value[graph.value.length - 1] || { count: 0 }
      let count = lastDatum.count
      count += entry.active ? 1 : -1

      graph.value.push({
        name: entry.name,
        timestamp: Date.now(),
        count,
      })
    }

    return  {
      list,
      graph,
      changeRandom,
    }
  }
})
</script>

<style>
.graph {
  width: 100%;
  height: 300px;
  display: flex;
}

.bar {
  background: #000;
  width: 1px;
}
</style>