import { wepy } from './wepy';

export default wepy;

export as namespace wepy;

export { WepyConstructor } from './wepy';

export {
  AppOptions,
  ComponentOptions,
  PropType,
  PropOptions,
  ComputedOptions,
  WatchHandler,
  WatchOptions,
  WatchOptionsWithHandler
} from './options';

export {
  PluginFunction,
  PluginObject
} from "./plugin";
