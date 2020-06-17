import { defineModule, action, mutation } from '../nuex';
import { poke, IPokemon } from '../graphql/pokemon';
import { computed } from 'vue';

export default defineModule({
  state: {
    pokemonById: {} as Record<string, IPokemon>,
    pokemonIds: [] as string[],
    activeId: '',
  },
  init(state) {
    const updateMonters = mutation('updateMonsters', (monsters: IPokemon[]) => {
      state.pokemonIds = monsters.map((p) => p.id);
      const pokemonById: Record<string, IPokemon> = {};
      monsters.forEach((p) => {
        pokemonById[p.id] = p;
      });
      state.pokemonById = pokemonById;
    });

    const load = action('fetchPokemon', async () => {
      const monsters: { pokemons: IPokemon[] } = await poke();
      updateMonters(monsters.pokemons);
    });

    const all = computed(() => {
      return state.pokemonIds.map((id) => state.pokemonById[id]).filter(Boolean);
    });

    const setActive = mutation('setActive', (id: string) => {
      state.activeId = id || '';
    });

    const active = computed({
      get: () => state.pokemonById[state.activeId] || null,
      set: ({ id }) => setActive(id),
    });

    const getById = (id: string) => computed((_) => state.pokemonById[id]);

    return {
      state,
      active,
      load,
      all,
      getById,
    };
  },
});
