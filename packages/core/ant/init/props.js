import { observe } from '../../weapp/observer/index';
import { proxy } from '../../weapp/init/data';
import { isFunc, isArr, isStr, isObj, isUndef, noop, clone  } from '../../weapp/util/index';

const AllowedTypes = [ String, Number, Boolean, Object, Array, null ];

const observerFn = function (output, props, prop) {
  return function (newVal, oldVal, changedPaths) {
    let vm = this.$wepy;

    // changedPaths 长度大于 1，说明是由内部赋值改变的 prop
    if (changedPaths.length > 1) {
      return
    }
    let _data = newVal;
    if (typeof _data === 'function') {
      _data = _data.call(vm);
    }
    vm[changedPaths[0]] = _data;
  };
};
/*
 * patch props option
 */
export function patchProps (output, props) {
  let newProps = {};
  if (isStr(props)) {
    newProps = [props];
  }
  if (isArr(props)) {
    props.forEach(prop => {
      newProps[prop] = {
        type: null,
        observer: observerFn(output, props, prop)
      };
    });
  } else if (isObj(props)) {
    for (let k in props) {
      let prop = props[k];

      // notsupport obj
      if(!isObj(prop)){
        newProps[k] = prop;
      }else{
        newProps[k] = prop.default ? prop.default : '';
      }
    }
  }

  newProps["onInit"] = ''
  output.properties = newProps;
};

/*
 * init props
 */
export function initProps (vm, properties) {
  vm._props = {};

  if (!properties) {
    return;
  }

  Object.keys(properties).forEach(key => {
    vm._props[key] = properties[key].value;
    proxy(vm, '_props', key);
  });

  observe({
    vm: vm,
    key: '',
    value: vm._props,
    root: true
  });
};
