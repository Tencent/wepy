import { isArr } from '../../shared/index';
import { WEAPP_LIFECYCLE } from '../../shared/index';
import { patchProps } from './props';
import { patchData } from './data';
import { config } from '../config';
import $global from '../global';

let globalMixinPatched = false;

const defaultStrat = (parentVal, childVal) => childVal ? childVal : parentVal;
let strats = null;


function simpleMerge(parentVal, childVal) {
  return (!parentVal || !childVal) ? (parentVal || childVal) : Object.assign({}, parentVal, childVal);
}

function initStrats () {
  if (strats)
    return strats;

  strats = config.optionMergeStrategies;

  strats.data = strats.props = strats.methods = strats.computed = strats.watch = function (output, option, key, data) {
    option[key] = simpleMerge(option[key], data);
  };

  WEAPP_LIFECYCLE.forEach(lifecycle => {
    if (!strats[lifecycle]) {
      strats[lifecycle] = function (output, option, key, data) {
        if (!option[key]) {
          option[key] = isArr(data) ? data: [data];
        } else {
          if (isArr(option[key])) {
            option[key].push(data);
          } else {
            option[key] = [ option[key] ].concat(data);
          }
        }
      }
    }
  });
}

export function patchMixins (output, option, mixins) {
  if (!mixins) {
    return;
  }

  if (!globalMixinPatched) {
    const globalMixin = $global.mixin || {};
    mixins = [].concat(mixins).concat(globalMixin);
    globalMixinPatched = true;
  }

  if (isArr(mixins)) {
    mixins.forEach(mixin => patchMixins(output, option, mixin));
  } else {

    if (!strats) {
      initStrats();
    }
    for (let k in mixins) {
      let strat = strats[k] || defaultStrat;
      strat(output, option, k, mixins[k]);
    }
  }
}

