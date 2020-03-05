import { reactive, effect } from "@vue/reactivity"

export interface SetupArgs<State, RootState> {
  state: State,
  rootState?: RootState,
  module: <M extends object, R extends object>(module: ModuleOptions<M, RootState, R>) => R
}

export interface StoreOptions<State, R> {
  state: State,
  setup(args: SetupArgs<State, State>): R
}

export interface ModuleOptions<State, RootState, R> {
  name?: string,
  state: State,
  setup(args: SetupArgs<State, RootState>): R
}

const MutationPaths = new WeakMap<object, string>()

// Globals
let isCommitting = false 
let isInitializing = false 
const modulePath: string[] = []

export function mutation<A extends any[]>(name: string, effect: (...args: A) => void): (...args: A) => void {
  MutationPaths.set(effect, modulePath.concat(name).join('/'))
  return (...args: A) => {
    isCommitting = true
    const path = MutationPaths.get(effect)
    console.log(path, args)
    const ret = effect(...args)
    isCommitting = false
    return ret
  }
}

export function defineModule<RootState extends object, State extends object, R>(config: ModuleOptions<State, RootState, R>): ModuleOptions<State, RootState, R> {
  return config
}

function guard<T>(state: T) {
  Object.keys(state).forEach(key => {
    effect(() => {
      if (state[key as keyof T] !== undefined && !(isInitializing || isCommitting)) {
        const keyPath = modulePath.concat(key).join('/')
        console.error('Dont mutate state outside mutation: ' + keyPath)
      }
    })
  })
}

function moduleBuilder<RootState extends object>(rootState: RootState) {
  return function module<ModuleState extends object, R>(config: ModuleOptions<ModuleState, RootState, R>): R {
    return createModule(rootState, config)
  }
}

function createModule<RootState extends object, State extends object, R>(rootState: RootState, config: ModuleOptions<State, RootState, R>): R {
  const state = reactive(config.state) as State
  const name = config.name || 'anonymous'
  modulePath.push(name)
  
  guard(state)
  const store: any = config.setup({ state, rootState, module: moduleBuilder(rootState) })

  modulePath.pop()
  return store
}

export default function createStore<RootState extends object, R>(config: StoreOptions<RootState, R>): R {
  const state = reactive(config.state) as RootState
  isInitializing = true

  guard(state)
  const store = config.setup({ state, rootState: state, module: moduleBuilder(state) })

  isInitializing = false
  return store
}
