/// <reference path="./wx/index.d.ts" />



import { wepy } from './wepy';

export default wepy;

export as namespace wepy;

export {
  WepyConstructor
} from './wepy';

export {
  ComponentOptions,
  PropType,
  PropOptions,
  ComputedOptions,
  WatchHandler,
  WatchOptions,
  WatchOptionsWithHandler,
} from "./options";

export {
  PluginFunction,
  PluginObject
} from "./plugin";

