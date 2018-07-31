import { patchData, patchMethods, patchLifecycle, patchProps } from './init/index';

function page (option, rel) {

  let pageConfig = {};

  if (option.properties) {
    pageConfig.properties = option.properties;
    if (option.props) {
      console.warn(`props will be ignore, if properties is set`);
    }
  } else if (option.props) {
    patchProps(pageConfig, option.props);
  }

  patchMethods(pageConfig, option.methods);

  patchData(pageConfig, option.data);

  patchLifecycle(pageConfig, option, rel);

  return Component(pageConfig);
}


export default page;
