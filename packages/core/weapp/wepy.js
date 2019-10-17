import WepyConstructor from './class/WepyConstructor';
import $global from './global';
import { initGlobalAPI } from './apis/index';
import { config } from './config';

const wepy = initGlobalAPI(WepyConstructor);

wepy.config = config;
wepy.global = $global;
wepy.version = __VERSION__;

export default wepy;
