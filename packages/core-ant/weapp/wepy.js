import WepyConstructor from '../../core/weapp/class/WepyConstructor';
import $global from '../../core/weapp/global';
import { initGlobalAPI } from './apis/index';
import { config } from '../../core/weapp/config';


const wepy = initGlobalAPI(WepyConstructor);

wepy.config = config;
wepy.global = $global;
wepy.version = __VERSION__;

export default wepy;
