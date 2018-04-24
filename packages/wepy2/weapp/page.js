import { patchData, patchMethods, patchLifecycle, initWatch, initComputed } from './init/index';

function page (option) {

  let pageConfig = {};

  patchMethods(pageConfig, option.methods);

  patchData(pageConfig, option.data);

  patchLifecycle(pageConfig, option);

  return Page(pageConfig);
}


export default page;
