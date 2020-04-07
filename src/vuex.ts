import { reactive, effect, computed } from '@vue/reactivity';

export interface SetupArgs<State> {
  state: State;
  module: <M extends object, R extends object>(module: ModuleOptions<M, R>) => R;
}

export interface StoreOptions<State, R> {
  state: State;
  setup(args: SetupArgs<State>): R;
  strict?: boolean;
}

export interface ModuleOptions<State, R> extends StoreOptions<State, R> {
  name: string;
}

interface MutationObject {
  type: string;
  path: string;
  payload: any;
}

// Globals
let isStrict = false;
let currentMutation: any = null;
let isInitializing = false;
const stateStack: any[] = [];
const modulePath: string[] = [];
const subscriptions = new WeakMap();

export function subscribe<T extends object>(state: T, listener: (mutation: MutationObject, state: T) => void) {
  if (subscriptions.has(state)) {
    subscriptions.get(state).push(listener);
  } else {
    subscriptions.set(state, [listener]);
  }
}

export function mutation<A extends any[]>(type: string, mutator: (...args: A) => void): (...args: A) => void {
  const path = modulePath.concat(type).join('/');
  return (...args: A) => {
    currentMutation = {
      type,
      path,
      payload: args,
    };
    console.log(path, args);
    const ret = mutator(...args);
    currentMutation = null;
    return ret;
  };
}

export function defineModule<State extends object, R>(config: ModuleOptions<State, R>): ModuleOptions<State, R> {
  return config;
}

function guard<T extends object>(state: T, strict: boolean = false) {
  Object.keys(state).forEach(key => {
    effect(() => {
      if (state[key as keyof T] !== undefined && !(isInitializing || currentMutation)) {
        const keyPath = modulePath.concat(key).join('/');
        if (strict) {
          throw new Error('State mutated outside of a mutation: ' + keyPath);
        } else {
          console.warn('Do not mutate state outside a mutation: ' + keyPath);
        }
      } else if (currentMutation) {
        if (!subscriptions.has(state)) return;
        subscriptions.get(state).forEach((listener: Function) => {
          listener.call(null, state, currentMutation);
        });
      }
    });
  });
}

function createModule<State extends object, R>(config: ModuleOptions<State, R>): R {
  modulePath.push(config.name);
  const wasStrict = isStrict;
  isStrict = isStrict || !!config.strict;
  const state = reactive(config.state) as State;
  const currentState = stateStack[stateStack.length - 1];

  if (!isInitializing) {
    throw new Error(`Cannot create module outside of store setup()`);
  }

  if (currentState[config.name]) {
    throw new Error(`Module name ${config.name} conflicts with existing state or module`);
  } else {
    currentState[config.name] = state;
    stateStack.push(state);
  }

  guard(state, config.strict);
  const storeModule = config.setup({ state, module: createModule });

  isStrict = wasStrict;
  stateStack.pop();
  modulePath.pop();
  return storeModule;
}

export default function createStore<RootState extends object, R>(config: StoreOptions<RootState, R>): R {
  isInitializing = true;
  isStrict = !!config.strict;
  const state = reactive(config.state) as RootState;
  stateStack.push(state);

  guard(state, config.strict);
  const store = config.setup({ state, module: createModule });

  stateStack.pop();
  isInitializing = false;
  return store;
}
