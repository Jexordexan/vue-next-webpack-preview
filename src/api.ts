const baseURL = 'https://covidtracking.com/api';

export default {
  get: (path: string) => fetch(`${baseURL}/${path}`).then((r) => r.json()),
};
