import { patchMixins, patchMethods, patchLifecycle, patchProps } from './init/index';

function page (option = {}, rel) {

  let pageConfig = {};

  patchMixins(pageConfig, option, option.mixins);

  if (option.properties) {
    pageConfig.properties = option.properties;
    if (option.props) {
      console.warn(`props will be ignore, if properties is set`);
    }
  } else if (option.props) {
    patchProps(pageConfig, option.props);
  }

  patchMethods(pageConfig, option.methods);

  patchLifecycle(pageConfig, option, rel);

  return Component(pageConfig);
}


export default page;
