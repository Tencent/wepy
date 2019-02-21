import { wepy as _wepy } from './wepy';

export type PluginFunction<T> = (wepy: typeof _wepy, options?: T) => void;

export interface PluginObject<T> {
  install: PluginFunction<T>;
  [key: string]: any;
}
