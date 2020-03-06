import { reactive, effect } from '@vue/reactivity';

export interface SetupArgs<State> {
  state: State;
  addModule: <M extends object, R extends object>(module: ModuleOptions<M, R>) => R;
}

export interface StoreOptions<State, R> {
  state: State;
  setup(args: SetupArgs<State>): R;
}

export interface ModuleOptions<State, R> extends StoreOptions<State, R> {
  name: string;
}

const MutationPaths = new WeakMap<object, string>();

// Globals
let isCommitting = false;
let isInitializing = false;
const stateStack: any[] = [];
const modulePath: string[] = [];

export function mutation<A extends any[]>(name: string, effect: (...args: A) => void): (...args: A) => void {
  MutationPaths.set(effect, modulePath.concat(name).join('/'));
  return (...args: A) => {
    isCommitting = true;
    const path = MutationPaths.get(effect);
    console.log(path, args);
    const ret = effect(...args);
    isCommitting = false;
    return ret;
  };
}

export function defineModule<State extends object, R>(config: ModuleOptions<State, R>): ModuleOptions<State, R> {
  return config;
}

function guard<T extends object>(state: T) {
  Object.keys(state).forEach(key => {
    effect(() => {
      if (state[key as keyof T] !== undefined && !(isInitializing || isCommitting)) {
        const keyPath = modulePath.concat(key).join('/');
        console.error('Dont mutate state outside mutation: ' + keyPath);
      } else {
        console.log('state', state);
      }
    });
  });
}

function createModule<State extends object, R>(config: ModuleOptions<State, R>): R {
  modulePath.push(config.name);
  const state = reactive(config.state) as State;
  const currentState = stateStack[stateStack.length - 1];

  if (currentState[config.name]) {
    throw new Error(`Module name ${config.name} conflicts with existing state or module`);
  } else {
    currentState[config.name] = state;
    stateStack.push(state);
  }

  guard(state);
  const storeModule = config.setup({ state, addModule: createModule });

  stateStack.pop();
  modulePath.pop();
  return storeModule;
}

export default function createStore<RootState extends object, R>(config: StoreOptions<RootState, R>): R {
  isInitializing = true;
  const state = reactive(config.state) as RootState;
  stateStack.push(state);

  guard(state);
  const store = config.setup({ state, addModule: createModule });

  stateStack.pop();
  isInitializing = false;
  return store;
}
