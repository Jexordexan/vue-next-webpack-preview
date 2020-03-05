import { reactive, ref, InjectionKey, readonly, watch, computed } from "vue";


export class Store<State extends object> {
  private _state: State;
  history = ref<any[]>([]);
  constructor(initialState: State) {
    this._state = reactive<State>(initialState) as State;
  }
  private logAction(name: string, payload: any) {
    this.history.value.push([name, payload, JSON.stringify(this.state)]);
    console.log(name, payload);
  }

  get state(): Readonly<State> {
    return readonly(this._state) as Readonly<State>
  }

  action<R, T extends any[]>(name: string, effect: (state: State, ...args: T) => R) {
    return (...args: T) => {
      const ret = effect(this._state, ...args);
      this.logAction(name, args);
      return ret;
    };
  }

  getter<R>(effect: (state: State) => R) {
    return computed(() => effect(this.state))
  }
}
