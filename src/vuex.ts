import { reactive, effect } from '@vue/reactivity';
import { InjectionKey, inject, provide } from 'vue';

export interface SetupArgs<State> {
  state: State;
}

export interface StoreOptions<State, R> {
  state: State;
  setup(args: SetupArgs<State>): R;
  strict?: boolean;
}

export interface ModuleOptions<State, R> extends StoreOptions<State, R> {
  name?: string;
}

interface MutationObject {
  type: string;
  payload: any;
}

interface ActionObject extends MutationObject {}

type Listener<T> = (action: ActionObject, state: T) => void;
type SubscribeOptions<T> = Listener<T> | { before: Listener<T>; after: Listener<T> };

// Globals
let isStrict = false;
let currentMutation: any = null;
let isInitializing = false;
const stateStack: any[] = [];
const modulePath: string[] = [];
const states = new WeakSet();
const subscriptions = new WeakMap<Object, Listener<any>[]>();
const actionSubscriptions = new WeakMap<
  Object,
  {
    before: Listener<any>[];
    after: Listener<any>[];
  }
>();

const subscriber = <T extends object>(state: T) => (
  listener: (mutation: MutationObject, state: T) => void
): (() => void) => {
  if (subscriptions.has(state)) {
    subscriptions.get(state)!.push(listener);
  } else {
    subscriptions.set(state, [listener]);
  }
  return function unsubscribe() {
    if (subscriptions.has(state)) {
      const list = subscriptions.get(state)!.filter((l: Function) => l !== listener);
      subscriptions.set(state, list);
    }
  };
};

const actionSubscriber = <T extends object>(state: T) => <T extends object>(
  listener: SubscribeOptions<T>
): (() => void) => {
  if (!listener) return () => {};

  let subscriptionSet = {
    before: [] as Listener<any>[],
    after: [] as Listener<any>[],
  };

  if (actionSubscriptions.has(state)) {
    subscriptionSet = actionSubscriptions.get(state)!;
  } else {
    actionSubscriptions.set(state, subscriptionSet);
  }

  if (typeof listener === 'object') {
    if (listener.before) subscriptionSet.before.push(listener.before);
    if (listener.after) subscriptionSet.after.push(listener.after);

    return () => {
      subscriptionSet.before = subscriptionSet.before.filter((fn) => fn !== listener.before);
      subscriptionSet.after = subscriptionSet.after.filter((fn) => fn !== listener.after);
    };
  }

  subscriptionSet.before.push(listener);
  return () => {
    subscriptionSet.before = subscriptionSet.before.filter((fn) => fn !== listener);
  };
};

export function mutation<A extends [any] | []>(type: string, mutator: (...args: A) => void): (...args: A) => void {
  const path = modulePath.concat(type).join('/');
  return (...args: A) => {
    currentMutation = {
      type,
      path,
      payload: args,
    };
    const ret = mutator(...args);
    currentMutation = null;
    return ret;
  };
}

export function action<A extends [] | [any], R>(type: string, actor: (...args: A) => R): (...args: A) => R {
  const path = modulePath.concat(type).join('/');
  return (...args: A) => {
    const ret = actor(...args);
    return ret;
  };
}

export function defineModule<State extends object, R>(config: ModuleOptions<State, R>): ModuleOptions<State, R> {
  return config;
}

function guard<T extends object>(state: T, strict: boolean = false) {
  states.add(state);
  Object.keys(state).forEach((key) => {
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
        subscriptions.get(state)!.forEach((listener: Function) => {
          listener.call(null, state, currentMutation);
        });
      }
    });
  });
}

export function createModule<State extends object, R>(name: string, config: ModuleOptions<State, R>): R {
  modulePath.push(name);
  const wasStrict = isStrict;
  isStrict = isStrict || !!config.strict;
  const state = reactive(config.state) as State;
  const currentState = stateStack[stateStack.length - 1];

  if (!isInitializing) {
    throw new Error(`Cannot create module outside of store setup()`);
  }

  if (currentState[name]) {
    throw new Error(`Module name ${name} conflicts with existing state or module`);
  } else {
    currentState[name] = state;
    stateStack.push(state);
  }

  guard(state, config.strict);
  const storeModule = config.setup({ state });

  isStrict = wasStrict;
  stateStack.pop();
  modulePath.pop();
  return storeModule;
}

export default function createStore<RootState extends object, R>(
  config: StoreOptions<RootState, R>
): R & { $subscribe: (mutation: MutationObject, state: RootState) => void } {
  isInitializing = true;
  isStrict = !!config.strict;
  const state = reactive(config.state) as RootState;
  stateStack.push(state);

  guard(state, config.strict);
  const store = config.setup({ state });

  Object.defineProperty(store, '$subscribe', subscriber(state));
  Object.defineProperty(store, '$subscribeAction', actionSubscriber(state));

  stateStack.pop();
  isInitializing = false;
  return store;
}

export function storeProvider<T extends object>(store: T) {
  const StoreSymbol: InjectionKey<T> = Symbol();

  return {
    provideStore: () => provide(StoreSymbol, store),
    useStore: () => inject(StoreSymbol)!,
  };
}
