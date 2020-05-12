export interface IPokemon {
  id: string;
  name: string;
  number: string;
  image: string;
  types: string[];
  weaknesses: string[];
}

export const gql = <R extends any>(v: TemplateStringsArray): (() => Promise<R>) => {
  const body = JSON.stringify({ query: v.join('').trim() });

  return async function () {
    console.log('fetching pokemon');
    return fetch('https://graphql-pokemon.now.sh/?', {
      body,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((response) => response.data);
  };
};

export const poke = gql`
  query {
    pokemons(first: 250) {
      id
      name
      number
      image
      types
      weaknesses
    }
  }
`;
