import { isArr } from '../../shared/index';
import { WEAPP_LIFECYCLE } from '../../shared/index';
import { config } from '../config';
import $global from '../global';

// 用于简单合并的工具函数
function simpleMerge(parentVal = {}, childVal = {}) {
  return {...parentVal, ...childVal};
}

// 定义选项合并逻辑
const strategyObj = config.optionMergeStrategies;

// 对 data、props、methods、computed、hooks 来说，在内部会进行简单合并，并在发生冲突时以组件数据优先。
for (const property of ['data', 'props', 'methods', 'computed', 'hooks']) {
  strategyObj[property] = function mergeStrategy(output, option, key, value) {
    option[key] = simpleMerge(value, option[key]);
  }
}

// 对钩子函数来说，将合并为一个数组，其中混入对象的钩子将在组件自身钩子之前
for (const lifecycle of WEAPP_LIFECYCLE) {
  strategyObj[lifecycle] = function lifeCycleStrategy(output, option, key, data) {
    if (!isArr(data)) {
      data = [data];
    }

    if (!option[key]) {
      option[key] = data;
    } else {
      option[key] = data.concat(option[key]);
    }
  };
}

// 其他情况下的合并逻辑
// 如果既不是 data、props、methods、computed、hooks，也不是生命周期，则简单地赋值
function defaultStrategy(output, option, key, value) {
  if (!output[key]) {
    output[key] = value;
  }
}

/**
 * 用于合并根对象 App、页面对象 Page 和组件对象 Component 的 data、props、methods、watch、hook 和生命周期。
 *
 * @param {Object}  output    最终交由微信 App() / Page() / Component() 调用的函数参数
 * @param {Object}  option    由 wepy.app() / wepy.page() / wepy.component() 调用（传入）的函数参数
 * @param {Array}   mixins    option 中的 mixin 属性引用
 */
export function patchMixins(output, option, mixins) {
  if (!mixins) {
    return;
  }

  if ($global.mixins) {
    mixins = $global.mixins.concat(mixins);
  }

  for (const mixin of mixins) {
    for (const [key, value] of Object.entries(mixin)) {
      const strategy = strategyObj[key] || defaultStrategy;

      strategy(output, option, key, value);
    }
  }
}
