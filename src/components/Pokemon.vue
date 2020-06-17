<template>
  <div class="grid grid-flow-row grid-cols-4 divide-x divide-gray-4">
    <div
      v-for="pokemon in pokemons"
      :key="pokemon.id"
      class="bg-white rounded-lg p-3 shadow-lg m-3"
      @click="active = pokemon"
    >
      <h5>
        <div class="bg-gray-700 text-white rounded-full px-2 inline-block mr-2">{{ pokemon.number }}</div>
        <strong>{{ pokemon.name }}</strong>
      </h5>
      <img :src="pokemon.image" class="mx-auto h-48 object-contain" />
      <strong>Types:</strong>
      <div>
        <span
          v-for="type in pokemon.types"
          :key="type"
          :style="getTypeBadgeStyles(type)"
          class="inline-block px-2 rounded-full mr-1"
          >{{ type }}</span
        >
      </div>
      <strong>Weaknesses:</strong>
      <div>
        <span
          v-for="type in pokemon.weaknesses"
          :key="type"
          :style="getTypeBadgeStyles(type)"
          class="inline-block px-2 rounded-full mr-1"
          >{{ type }}</span
        >
      </div>
    </div>
    <a-modal :visible="active" @close="active = { id: null }">
      <div>
        <h5>
          <div class="bg-gray-700 text-white rounded-full px-2 inline-block mr-2">{{ active.number }}</div>
          <strong>{{ active.name }}</strong>
        </h5>
        <img :src="active.image" class="mx-auto h-48 object-contain" />
        <strong>Types:</strong>
        <div>
          <span
            v-for="type in active.types"
            :key="type"
            :style="getTypeBadgeStyles(type)"
            class="inline-block px-2 rounded-full mr-1"
            >{{ type }}</span
          >
        </div>
        <strong>Weaknesses:</strong>
        <div>
          <span
            v-for="type in active.weaknesses"
            :key="type"
            :style="getTypeBadgeStyles(type)"
            class="inline-block px-2 rounded-full mr-1"
            >{{ type }}</span
          >
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { useStore } from '../store';
import { ref } from 'vue';
export default {
  setup() {
    const {
      pokemon: { active, load, all },
    } = useStore();
    load().then(() => console.log('done loading'));

    const typeColors: Record<string, string> = {
      Grass: '#393',
      Poison: '#96f',
      Fire: '#F82',
      Water: '#2ea7e8',
      Bug: '#cf3',
      Flying: '#9cf',
      Normal: '#fc9',
      Fighting: '#ccbdb3',
      Fairy: '#f9c',
      Ground: '#c96',
      Psychic: '#93f',
      Electric: '#fc0',
      Steel: '#8699ac',
      Dragon: '#ff5050',
      Ice: '#66ccff',
      Rock: '#8c7d7e',
      Ghost: '#7f578f',
      Dark: '#37355c',
    };

    const invertColors: Record<string, boolean> = {
      Grass: true,
      Poison: true,
      Fire: true,
      Water: true,
      Fairy: true,
      Ground: true,
      Psychic: true,
      Steel: true,
      Rock: true,
      Ghost: true,
      Dark: true,
      Dragon: true,
    };

    const getTypeBadgeStyles = (type: string) => {
      const bg = typeColors[type] || 'gray-200';
      const fg = invertColors[type] ? 'white' : 'black';

      return {
        backgroundColor: bg,
        color: fg,
      };
    };

    return {
      active,
      pokemons: all,
      getTypeBadgeStyles,
    };
  },
};
</script>

<style></style>
