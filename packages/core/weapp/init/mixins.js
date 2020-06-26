import { isArr } from '../../shared/index';
import { WEAPP_LIFECYCLE } from '../../shared/index';
import { config } from '../config';
import $global from '../global';

// [Default Strategy]
// Update if it's not exist in output. Can be replaced by option[key].
// e.g.
// export default {
//   myCustomMethod () {
//     // doSomething
//   }
// }
//
// [Merge Strategy]
// Replaced by the latest mixins property.
// e.g.
// export default {
//   data: {
//     a: 1
//   }
// }
//
// [Lifecycle Strategy]
// Extend lifecycle. update lifecycle to an array.
// e.g.
// export default {
//   onShow: {
//     console.log('onShow');
//   }
// }
let globalMixinPatched = false;

let strats = null;

function getStrategy(key) {
  if (!strats) {
    initStrats();
  }
  if (strats[key]) {
    return strats[key];
  } else {
    return defaultStrat;
  }
}
function defaultStrat(output, option, key, data) {
  if (!output[key]) {
    output[key] = data;
  }
}

function simpleMerge(parentVal, childVal) {
  return !parentVal || !childVal ? parentVal || childVal : Object.assign({}, parentVal, childVal);
}

function initStrats() {
  if (strats) return strats;

  strats = config.optionMergeStrategies;

  strats.data = strats.props = strats.methods = strats.computed = strats.watch = strats.hooks = function mergeStrategy(
    output,
    option,
    key,
    data
  ) {
    option[key] = simpleMerge(data, option[key]);
  };

  WEAPP_LIFECYCLE.forEach(lifecycle => {
    if (!strats[lifecycle]) {
      strats[lifecycle] = function lifeCycleStrategy(output, option, key, data) {
        if (!option[key]) {
          option[key] = isArr(data) ? data : [data];
        } else {
          option[key] = [data].concat(option[key]);
        }
      };
    }
  });
}

export function patchMixins(output, option, mixins) {
  if (!mixins && !$global.mixin) {
    return;
  }

  if (!globalMixinPatched) {
    let globalMixin = $global.mixin || [];

    mixins = globalMixin.concat(mixins);
    globalMixinPatched = true;
  }

  if (isArr(mixins)) {
    mixins.forEach(mixin => patchMixins(output, option, mixin));
    globalMixinPatched = false;
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
