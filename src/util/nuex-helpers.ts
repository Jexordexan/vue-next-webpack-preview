import { StoreModule, MutationFunction } from './nuex-types';

export function isArray(obj: any): obj is Array<any> {
  return Array.isArray(obj);
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

export function isModule(val: any): val is StoreModule<any> {
  return val && typeof val === 'object' && val.hasOwnProperty('__nuex_module_name');
}

export function isMutation(val: any): val is MutationFunction {
  return val && typeof val === 'function' && val.hasOwnProperty('__nuex_mutation_name');
}
