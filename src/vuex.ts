import { reactive, watch, InjectionKey, inject, provide, watchEffect } from 'vue';
import { isArray, isObject, isModule } from './util/vuex-helpers';

export interface StoreOptions<State, R> {
  state: State;
  setup(state: State): R;
  strict?: boolean;
}

export interface ModuleOptions<State, R> extends StoreOptions<State, R> {
  name?: string;
}

type MutationFunction = (payload: any) => any;
type ActionFunction = (...args: any[]) => any;

interface MutationObject {
  type: string;
  path: string;
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

export function mutation<M extends MutationFunction>(type: string, mutator: M): M {
  const path = modulePath.concat(type).join('/');
  const wrapped = (payload: any) => {
    currentMutation = {
      type,
      path,
      payload,
    };
    console.log('MUTATION', currentMutation.path);
    const ret = mutator(payload);
    currentMutation = null;
    return ret;
  };

  return wrapped as M;
}

export function action<A extends ActionFunction>(type: string, actor: A): A {
  // const path = modulePath.concat(type).join('/');
  const wrapped = (...args: any[]) => {
    const ret = actor(...args);
    return ret;
  };
  return wrapped as A;
}

export function defineModule<State extends object, R>(config: ModuleOptions<State, R>): ModuleOptions<State, R> {
  return config;
}

const onTrigger = (path: any[]) => ({ type, key, target, oldValue, newValue }: any) => {
  if (isInitializing) return;
  const leftPad = currentMutation ? '  ' : '';
  const prettyType = type.toUpperCase();
  const prettyPath = path.join('/');
  switch (type) {
    case 'set':
      console.log(leftPad, prettyType, prettyPath, key, oldValue, '=>', newValue);
      break;
    case 'add':
      console.log(leftPad, prettyType, prettyPath, key, newValue);
      break;
    default:
      console.log(leftPad, prettyType, prettyPath, key);
  }
};

function traverse(value: unknown, seen: Set<object> = new Set()) {
  if (!isObject(value) || seen.has(value)) {
    return value;
  }

  if (seen.size > 0 && isModule(value)) {
    return value;
  }

  seen.add(value);
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (value instanceof Map) {
    value.forEach((v, key) => {
      // to register mutation dep for existing keys
      traverse(value.get(key), seen);
    });
  } else if (value instanceof Set) {
    value.forEach((v) => {
      traverse(v, seen);
    });
  } else {
    for (const key in value) {
      traverse(value[key], seen);
    }
  }
  return value;
}

function guard<T extends object>(state: T, strict: boolean = false) {
  states.add(state);
  const path = ['root', ...modulePath];

  watchEffect(() => traverse(state), {
    onTrigger: onTrigger(path),
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

  guard(state, config.strict);

  Object.defineProperty(state, '__module_name', {
    value: name,
    enumerable: false,
    configurable: false,
  });

  if (currentState[name]) {
    throw new Error(`Module name ${name} conflicts with existing state or module`);
  } else {
    currentState[name] = state;
    stateStack.push(state);
  }

  const storeModule = config.setup(state);

  isStrict = wasStrict;
  stateStack.pop();
  modulePath.pop();
  return storeModule;
}

export default function createStore<RootState extends object, R>(
  config: StoreOptions<RootState, R>
): R & {
  $subscribe: (listener: (mutation: MutationObject, state: RootState) => any) => () => void;
  $subscribeAction: (listener: (action: ActionObject, state: RootState) => any) => () => void;
} {
  isInitializing = true;
  isStrict = !!config.strict;
  const state = reactive(config.state) as RootState;
  stateStack.push(state);

  guard(state, config.strict);
  const store = config.setup(state);

  const augmentedStore = Object.assign(store, {
    $subscribe: subscriber(state),
    $subscribeAction: actionSubscriber(state),
  });

  stateStack.pop();
  isInitializing = false;

  return augmentedStore;
}

export function storeProvider<T extends object>(store: T) {
  const StoreSymbol: InjectionKey<T> = Symbol();

  return {
    provideStore: () => provide(StoreSymbol, store),
    useStore: () => inject(StoreSymbol)!,
  };
}
