import {
  AppOptions,
  ComponentOptions,
  ThisTypedComponentOptionsWithArrayProps,
  ThisTypedComponentOptionsWithRecordProps,
  WatchOptions,
  WatchHandler,
  WatchOptionsWithHandler,
} from "./options";
import { PluginFunction, PluginObject } from "./plugin";

export interface WepyBase {
  new(): WepyBase;

  $set: (target: string, key: string, value: string) => void;
  $delete: (target: string, key: string) => void;
  $on(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $once(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $off(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
}

export interface WepyApp extends WepyBase {
  readonly $wx: WechatMiniprogram.App.TrivialInstance;
}

export interface WepyComponent extends WepyBase {
  readonly $parent: WepyInstance;
  readonly $root: WepyInstance;
  readonly $app: WepyApp;
  readonly $children: WepyInstance[];
  readonly $refs: { [key: string]: WepyComponent | WepyComponent[] };
  readonly $id: string;
  readonly $is: string;
  readonly $options: ComponentOptions<WepyInstance>;
  readonly $wx: WechatMiniprogram.Component.TrivialInstance;

  $watch(
      expOrFn: string,
      callback: (this: this, n: any, o: any) => void,
      options?: WatchOptions
  ): (() => void);
  $watch<T>(
      expOrFn: (this: this) => T,
      callback: (this: this, n: T, o: T) => void,
      options?: WatchOptions
  ): (() => void);
  $trigger(event: string, data: any, option: object): this;
  $nextTick(callback: (this: this) => void): void;
}

export interface WepyPage extends Omit<WepyComponent, '$wx'> {
  readonly $wx: WechatMiniprogram.Page.TrivialInstance;

  $launch(url: string, params: object): void;
  $navigate(url: string, params: object): void;
  $redirect(url: string, params: object): void;
  $back(p: number | { delta: number }): void;
  $route(type: string, url: string, params: object): void;
}

export type WepyInstance = WepyPage | WepyComponent;

export type CombineWepyInstance<Instance extends WepyInstance, Data, Methods, Hooks, Computed, Props> = Data & Methods & Hooks & Computed & Props & Instance;

export interface WepyConfiguration {
  silent: boolean;
  errorHandler(err: Error, vm: WepyInstance, info: string): void;
}

export interface WepyConstructor<V extends WepyInstance = WepyInstance, P extends WepyPage = WepyPage, C extends WepyComponent = WepyComponent, A extends WepyApp = WepyApp> {
  new(): WepyBase;

  app(options: AppOptions<WepyApp>): WechatMiniprogram.App.TrivialInstance;

  page<Data, Methods, Hooks, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<P, Data, Methods, Hooks, Computed, PropNames>): WechatMiniprogram.Page.TrivialInstance;
  page<Data, Methods, Hooks, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<P, Data, Methods, Hooks, Computed, Props>): WechatMiniprogram.Page.TrivialInstance;
  page(options?: ComponentOptions<P>): WechatMiniprogram.Page.TrivialInstance;

  component<Data, Methods, Hooks, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<C, Data, Methods, Hooks, Computed, PropNames>): WechatMiniprogram.Component.TrivialInstance;
  component<Data, Methods, Hooks, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<C, Data, Methods, Hooks, Computed, Props>): WechatMiniprogram.Component.TrivialInstance;
  component(options?: ComponentOptions<C>): WechatMiniprogram.Component.TrivialInstance;

  nextTick<T>(callback: (this: T) => void, context?: T): void;
  nextTick(): Promise<void>
  set<T>(object: object, key: string | number, value: T): T;
  set<T>(array: T[], key: number, value: T): T;
  delete(object: object, key: string | number): void;
  delete<T>(array: T[], key: number): void;


  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): WepyConstructor<V>;
  use(plugin: PluginObject<any> | PluginFunction<any>, ...options: any[]): WepyConstructor<V>;
  mixin(mixin: WepyConstructor | ComponentOptions<WepyPage>): WepyConstructor<V>;

  observable<T>(obj: T): T;

  config: WepyConfiguration;
  version: string;
}

export const wepy: WepyConstructor;
