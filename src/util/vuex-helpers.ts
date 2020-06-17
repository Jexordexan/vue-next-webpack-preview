export function isArray(obj: any): obj is Array<any> {
  return Array.isArray(obj);
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

export function isModule(val: any): boolean {
  return val && typeof val === 'object' && val.hasOwnProperty('__module_name');
}
