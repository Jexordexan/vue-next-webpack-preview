import { reactive, InjectionKey, inject, provide, watchEffect } from 'vue';
import { isArray, isObject, isModule, isMutation, isPromise } from './util/nuex-helpers';
import {
  Listener,
  MutationObject,
  SubscribeOptions,
  MutationFunction,
  ActionFunction,
  ModuleOptions,
  StoreOptions,
  Store,
} from './util/nuex-types';

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

export function mutation<M extends MutationFunction>(mutator: M): M;
export function mutation<M extends MutationFunction>(type: string, mutator: M): M;
export function mutation<M extends MutationFunction>(arg1: string | M, arg2?: M): M {
  const name = typeof arg1 === 'string' ? arg1 : '';
  const mutator = typeof arg1 === 'function' ? arg1 : arg2!;

  const path = modulePath.join('/');
  const wrapped = ((payload: any) => {
    currentMutation = {
      type: name,
      path,
      payload,
    };
    console.log('MUTATION', `${path}/${wrapped.__nuex_mutation_name}`);
    const ret = mutator(payload);
    currentMutation = null;
    return ret;
  }) as M;

  Object.defineProperty(wrapped, '__nuex_mutation_name', { value: name, writable: true });

  return wrapped;
}

export function action<A extends ActionFunction>(actor: A): A;
export function action<A extends ActionFunction>(type: string, mutator: A): A;
export function action<A extends ActionFunction>(arg1: string | A, arg2?: A): A {
  const name = typeof arg1 === 'string' ? arg1 : '';
  const actor = typeof arg1 === 'function' ? arg1 : arg2!;

  const path = modulePath.join('/');
  const wrapped = ((payload: any) => {
    console.log('STARTED', `${path}/${wrapped.__nuex_action_name}`);

    const ret = actor(payload);
    if (isPromise(ret)) {
      ret.then(() => console.log('FINISHED', `${path}/${wrapped.__nuex_action_name}`));
    } else {
      console.log('FINISHED', `${path}/${wrapped.__nuex_action_name}`);
    }

    return ret;
  }) as A;

  Object.defineProperty(wrapped, '__nuex_action_name', { value: name, writable: true });

  return wrapped;
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

function nameMutations<T>(storeObject: T) {
  Object.keys(storeObject).forEach((key) => {
    const val = storeObject[key as keyof T];
    if (isMutation(val) && val.__nuex_mutation_name === '') {
      val.__nuex_mutation_name = key;
    }
  });
}

export function createModule<State extends object, R>(name: string, config: ModuleOptions<State, R>): R {
  modulePath.push(name);
  const wasStrict = isStrict;
  isStrict = isStrict || !!config.strict;
  const state = reactive(config.state) as State;
  const currentState = stateStack[stateStack.length - 1];

  if (!isInitializing) {
    throw new Error(`Cannot create module outside of store init()`);
  }

  guard(state, config.strict);

  Object.defineProperty(state, '__nuex_module_name', { value: name });

  if (currentState[name]) {
    throw new Error(`Module name ${name} conflicts with existing state or module`);
  } else {
    currentState[name] = state;
    stateStack.push(state);
  }

  const storeModule = config.init(state);

  nameMutations(storeModule);

  isStrict = wasStrict;
  stateStack.pop();
  modulePath.pop();
  return storeModule;
}

export default function createStore<RootState extends object, R>(config: StoreOptions<RootState, R>): Store<R> {
  isInitializing = true;
  isStrict = !!config.strict;
  const state = reactive(config.state) as RootState;
  stateStack.push(state);

  guard(state, config.strict);
  const store = config.init(state);

  nameMutations(store);

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
