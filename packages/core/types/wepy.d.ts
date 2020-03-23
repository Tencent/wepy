import {
  ComponentOptions,
  WatchOptionsWithHandler,
  WatchHandler,
  RecordPropsDefinition,
  ThisTypedComponentOptionsWithArrayProps,
  ThisTypedComponentOptionsWithRecordProps,
  WatchOptions,
  AppOptions,
} from "./options";
import { PluginFunction, PluginObject } from "./plugin";

export interface Base {
  new (): Base;

  $set: (target: string, key: string, value: string) => void;
  $delete: (target: string, key: string) => void;
  $on(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $off(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
}

export interface WepyApp extends Base {
}

export interface WepyComponent extends Base {
  readonly $refs: { [ key: string ]: WepyComponent | WepyComponent[] };

  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
  ): (() => void);
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
  ): (() => void);
  $trigger(event: string, data: any, option: object): this;
}
export interface WepyPage extends WepyComponent {
  $launch(url: string, params: object): void;
  $navigate(url: string, params: object): void;
  $redirect(url: string, params: object): void;
  $back(p: number | { delta: number }): void;
  $route(type: string, url: string, params: object): void;
}

export type WepyInstace = WepyPage | WepyComponent;

export interface Vue {
  /*
  readonly $options: ComponentOptions<Vue>;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $children: Vue[];
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  */
  readonly $data: Record<string, any>;
  readonly $props: Record<string, any>;
  readonly $ssrContext: any;
  readonly $attrs: Record<string, string>;
  readonly $listeners: Record<string, Function | Function[]>;

  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
  $forceUpdate(): void;
  $destroy(): void;
  $set: (traget: object, key: string, value: string) => void;
  $delete: (traget: object, key: string) => void;
  $on(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $off(event: string | string[] | Record<string, Function>, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
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
  $on(event: string | string[], callback: Function): this;
  $once(event: string | string[], callback: Function): this;
  $off(event?: string | string[], callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
}

export type CombineWepyInstance<Instance extends WepyInstace, Data, Methods, Computed, Props> =  Data & Methods & Computed & Props & Instance;

export interface WepyConfiguration {
  silent: boolean;
}

export interface WepyConstructor<V extends WepyInstace = WepyInstace, P extends WepyPage = WepyPage, C extends WepyComponent = WepyComponent, A extends WepyApp = WepyApp> {
  new (): Base;

  app(options: AppOptions<WepyApp>): void;

  page<Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<P, Data, Methods, Computed, PropNames>): wepy.Page.PageInstance;
  page<Data, Methods, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<P, Data, Methods, Computed, Props>): wepy.Page.PageInstance;
  page(options?: ComponentOptions<P>): wepy.Page.PageInstance;

  component<Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<C, Data, Methods, Computed, PropNames>): wepy.Page.PageInstance;
  component<Data, Methods, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<C, Data, Methods, Computed, Props>): wepy.Page.PageInstance;
  component(options?: ComponentOptions<C>): wepy.Page.PageInstance;

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
