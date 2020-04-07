import api from '../api';
import { defineModule, mutation } from '../vuex';

export interface DataState {
  state: string;
  positive: number;
  positiveScore: number;
  negativeScore: number;
  negativeRegularScore: number;
  commercialScore: number;
  grade: string;
  score: number;
  negative: number;
  pending: null;
  hospitalizedCurrently: null;
  hospitalizedCumulative: number;
  inIcuCurrently: null;
  inIcuCumulative: null;
  onVentilatorCurrently: null;
  onVentilatorCumulative: null;
  recovered: null;
  lastUpdateEt: string;
  checkTimeEt: string;
  death: number;
  hospitalized: number;
  total: number;
  totalTestResults: number;
  posNeg: number;
  fips: string;
  dateModified: string;
  dateChecked: string;
  notes: string;
  hash: string;
}

export default defineModule({
  name: 'covid',
  state: {
    states: [] as DataState[],
    daily: [] as DataState[],
  },
  setup({ state }) {
    const setStates = mutation('setStates', val => {
      state.states = val;
    });
    const setDaily = mutation('setDaily', val => {
      state.daily = val;
    });

    async function fetchStateData() {
      const [states, daily] = await Promise.all([api.get('states'), api.get('states/daily')]);
      setDaily(daily.data);
      setStates(states.data);
    }

    return {
      state,
      fetchStateData,
    };
  },
});
