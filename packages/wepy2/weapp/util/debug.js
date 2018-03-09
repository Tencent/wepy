import config from './config';
import { noop } from '../../shared/util';

export let warn = noop;
export let tip = noop;

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined';
  const classifyRE = /(?:^|[-_])(\w)/g;
  const classify = str => str
    .replace(classifyRE, c => c.toUpperCase())
    .replace(/[-_]/g, '');
  // TODO
  warn = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.error(`[WePY warn]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ))
    }
  }

  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[WePY tip]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ))
    }
  }
}
