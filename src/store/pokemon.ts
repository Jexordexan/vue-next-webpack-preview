import { defineModule, action, mutation } from '../vuex';
import { poke, IPokemon } from '../graphql/pokemon';
import { computed } from 'vue';

export default defineModule({
  state: {
    pokemonById: new Map<string, any>(),
    pokemonIds: [] as string[],
    active: null as IPokemon | null,
  },
  setup({ state }) {
    const updateMonters = mutation('updateMonsters', (monsters: IPokemon[]) => {
      console.log(monsters);

      state.pokemonIds = monsters.map((p) => p.id);
      monsters.forEach((p) => {
        state.pokemonById.set(p.id, p);
      });
    });

    const load = action('fetchPokemon', async () => {
      const monsters: { pokemons: IPokemon[] } = await poke();
      updateMonters(monsters.pokemons);
    });

    const all = computed(() => {
      return state.pokemonIds.map((id) => state.pokemonById.get(id));
    });

    const getById = (id: string) => computed((_) => state.pokemonById.get(id));

    return {
      state,
      load,
      all,
      getById,
    };
  },
});
