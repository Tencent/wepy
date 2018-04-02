import { isFunc, isArr, isStr, isObj, isUndef  } from './../util/index';
const AllowedTypes = [ String, Number, Boolean, Object, Array, null ];

export function initProps (vm, compConfig, props) {
  let newProps = {};
  if (isStr(props)) {
    newProps = [props];
  }
  if (isArr(props)) {
    props.forEach(prop => {
      newProps[prop] = {
        type: null
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
          newProp.value = prop.default.call(vm);
        } else {
          newProp.value = prop.default;
        }
      }
      // TODO
      // props.validator
      // props.required

      newProps[k] = newProp;
    }
  }

  compConfig.properties = newProps;
}
