import config from './config';
import { noop } from '../../shared/util';

export let warn = noop;
export let tip = noop;

const generateComponentTrace = function(vm) {
  return `Found in component: "${vm.$is}"`;
};

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined';
  // TODO
  warn = (msg, vm) => {
    if (hasConsole && !config.silent) {
      // eslint-disable-next-line
      console.error(`[WePY warn]: ${msg}` + (vm ? generateComponentTrace(vm) : ''));
    }
  };

  tip = (msg, vm) => {
    if (hasConsole && !config.silent) {
      // eslint-disable-next-line
      console.warn(`[WePY tip]: ${msg}` + (vm ? generateComponentTrace(vm) : ''));
    }
  };
}
