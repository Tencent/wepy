import WepyConstructor from '../weapp/class/WepyConstructor';
import $global from '../weapp/global';
import { initGlobalAPI } from './apis/index';
import { config } from '../weapp/config';

const wepy = initGlobalAPI(WepyConstructor);

wepy.config = config;
wepy.global = $global;
wepy.version = __VERSION__;

export default wepy;
