import { observe } from './../observer/index';
import { proxy } from './data';
import { initRender } from './render';
import { isFunc, isArr, isStr, isObj, isUndef, noop, clone  } from './../util/index';

const AllowedTypes = [ String, Number, Boolean, Object, Array, null ];

const propOberverHandler = function (prop, newVal, oldVal, changedPaths) {
  console.log(prop);
  debugger;
}

const observerFn = function (output, props, prop) {
  return function (newVal, oldVal, changedPaths) {
    let vm = this.$wepy;
    let _props;
    let _data = newVal;
    let key = changedPaths[0];
    if (typeof _data === 'function') {
      _data = _data.call(vm);
    }

    _props = vm._props || {};
    _props[key] = _data;
    vm._props = _props;
    Object.keys(_props).forEach(key => {
      proxy(vm, '_props', key);
    });

    observe(vm, _props, null, true);

    initRender(vm, Object.keys(_props));
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
      let newProp = {};

      // props.type
      if (isUndef(prop.type)){
        newProp.type = null;
      } else if (isArr(prop.type)) {
        newProp.type = null;
        console.warn(`Type property of props "${k}" is invalid. Array is not allowed, please specify the type.`)
      } else if (AllowedTypes.indexOf(prop.type) === -1) {
        newProp.type = null;
        console.warn(`Type property of props "${k}" is invalid. Only String/Number/Boolean/Object/Array/null is allowed in weapp Component`);
      } else {
        newProp.type = prop.type;
      }

      // props.default
      if (prop.default) {
        if (isFunc(prop.default)) {
          newProp.value = prop.default.call(output);
        } else {
          newProp.value = prop.default;
        }
      }
      // TODO
      // props.validator
      // props.required

      newProp.observer = observerFn(this.$wepy, output, props, prop);

      newProps[k] = newProp;
    }
  }

  Object.keys(newProps).forEach(prop => {

  });

  output.properties = newProps;
};

/*
 * init props
 */
export function initProps (vm, properties) {
  vm._props = {};
  vm.$dirty = vm.$dirty || [];

  if (!properties) {
    return;
  }

  Object.keys(properties).forEach(key => {
    vm._props[key] = properties[key].value;
    proxy(vm, '_props', key);
  });

  observe(vm, vm._props, null, true);
};
