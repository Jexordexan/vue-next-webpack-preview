export interface StoreOptions<State, R> {
  state: State;
  init(state: State): R;
  strict?: boolean;
}

export interface ModuleOptions<State, R> extends StoreOptions<State, R> {
  name?: string;
}

export type MutationFunction = {
  (payload: any): any;
  __nuex_mutation_name?: string;
};

export type ActionFunction = {
  (...args: any[]): any;
  __nuex_action_name?: string;
};

export type StoreModule<R> = R & {
  __nuex_module_name?: string;
};

export type Listener<T> = (action: ActionObject, state: T) => void;
export type SubscribeOptions<T> = Listener<T> | { before: Listener<T>; after: Listener<T> };

export type Store<R> = R & {
  $subscribe: (cb: Listener<any>) => () => void;
  $subscribeAction: (cb: SubscribeOptions<any>) => () => void;
};

export interface MutationObject {
  type: string;
  path: string;
  payload: any;
}

export interface ActionObject extends MutationObject {}
