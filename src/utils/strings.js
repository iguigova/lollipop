
export const toString = (...args) => args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
