import Base from './base';
import { initProps } from './init/props';

class WepyComponent extends Base {
  $init (option) {
    let compConfig = {};

    if (option.properties) {
      compConfig.properties = option.properties;
      if (option.props) {
        console.warn(`props will be ignore, if properties is set`);
      }
    } else if (option.props) {
      initProps(this, compConfig, option.props);
    }
    return option;
  }
};


function component (option) {
  let vm = new WepyComponent();

  let compConfig = vm.$init(option);
  return Component(compConfig);
}


export default component;
