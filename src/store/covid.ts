import api from '../api';
import { defineModule, mutation } from '../vuex';

export interface DataState {
  positive: number;
  positiveScore: number;
  negativeScore: number;
  negativeRegularScore: number;
  commercialScore: number;
  score: number;
  negative: number;
  pending: number;
  hospitalizedCurrently: number;
  hospitalizedCumulative: number;
  inIcuCurrently: number;
  inIcuCumulative: number;
  onVentilatorCurrently: number;
  onVentilatorCumulative: number;
  recovered: number;
  death: number;
  hospitalized: number;
  total: number;
  totalTestResults: number;
  posNeg: number;
}

export interface State extends DataState {
  state: string;
  grade: string;
  lastUpdateEt: string;
  checkTimeEt: string;
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
  init(state) {
    const setStates = mutation('setStates', (val) => {
      state.states = val;
    });
    const setDaily = mutation('setDaily', (val: DataState[]) => {
      state.daily = val;
    });

    async function fetchStateData() {
      const [states, daily] = await Promise.all([api.get('states'), api.get('states/daily')]);
      setDaily(daily);
      setStates(states);
    }

    return {
      state,
      fetchStateData,
    };
  },
});
