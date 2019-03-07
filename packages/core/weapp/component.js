import { patchMixins, patchMethods, patchData, patchLifecycle, patchProps, patchRelations, patchExternalClasses } from './init/index';

function component (opt = {}, rel) {

  let compConfig = {
    externalClasses: opt.externalClasses || [],
    // support component options property
    // example: options: {addGlobalClass:true}
    options: opt.options || {}
  };

  patchMixins(compConfig, opt, opt.mixins);

  if (opt.properties) {
    compConfig.properties = opt.properties;
    if (opt.props) {
      console.warn(`props will be ignore, if properties is set`);
    }
  } else if (opt.props) {
    patchProps(compConfig, opt.props);
  }

  patchMethods(compConfig, opt.methods, true);

  patchData(compConfig, opt.data, true);

  patchRelations(compConfig, opt.relations);

  patchExternalClasses(compConfig, opt.externalClasses);

  patchLifecycle(compConfig, opt, rel, true);

  return Component(compConfig);
}


export default component;
