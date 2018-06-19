import { patchData, patchMethods, patchLifecycle, initWatch, initComputed } from './init/index';

function page (option, rel) {

  let pageConfig = {};

  patchMethods(pageConfig, option.methods);

  patchData(pageConfig, option.data);

  patchLifecycle(pageConfig, option, rel);

  return Page(pageConfig);
}


export default page;
