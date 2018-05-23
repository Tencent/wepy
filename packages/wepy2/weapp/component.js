import { patchMethods, patchData, patchLifecycle, patchProps } from './init/index';

function component (option, rel) {

  let compConfig = {};

  if (option.properties) {
    compConfig.properties = option.properties;
    if (option.props) {
      console.warn(`props will be ignore, if properties is set`);
    }
  } else if (option.props) {
    patchProps(compConfig, option.props);
  }

  patchMethods(compConfig, option.methods, true);

  patchData(compConfig, option.data, true);

  patchLifecycle(compConfig, option, rel, true);

  return Component(compConfig);
}


export default component;
