import { wepy, CombineWepyInstance, WepyInstace, WepyApp } from "./wepy";


type Constructor = {
  new (...args: any[]): any;
}

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)
/**
 * This type should be used when an array of strings is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithArrayProps<V extends WepyInstace, Data, Methods, Hooks, Computed, PropNames extends string> =
  object &
  ComponentOptions<V, DataDef<Data, Record<PropNames, any>, V>, Methods, Hooks, Computed, PropNames[], Record<PropNames, any>> &
  ThisType<CombineWepyInstance<V, Data, Methods, Hooks, Computed, Readonly<Record<PropNames, any>>>>;

/**
 * This type should be used when an object mapped to `PropOptions` is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithRecordProps<V extends WepyInstace, Data, Methods, Hooks, Computed, Props> =
  object &
  ComponentOptions<V, DataDef<Data, Props, V>, Methods, Hooks, Computed, RecordPropsDefinition<Props>, Props> &
  ThisType<CombineWepyInstance<V, Data, Methods, Hooks, Computed, Readonly<Props>>>;

type DefaultData<V> =  object | ((this: V) => object);
type DefaultProps = Record<string, any>;
type DefaultMethods<V> =  { [key: string]: (this: V, ...args: any[]) => any };
type DefaultHooks<V> =  { [key: string]: (this: V, ...args: any[]) => any };
type DefaultComputed = { [key: string]: any };



export interface AppOptions<
  A extends WepyApp,
  Hooks=DefaultHooks<A>> extends wepy.App.AppInstance {
    hooks?: Hooks;
}

export interface ComponentOptions<
  V extends WepyInstace,
  Data=DefaultData<V>,
  Methods=DefaultMethods<V>,
  Hooks=DefaultHooks<V>,
  Computed=DefaultComputed,
  PropsDef=PropsDefinition<DefaultProps>,
  Props=DefaultProps> extends wepy.Page.PageInstance {
  data?: Data;
  props?: PropsDef;
  propsData?: object;
  hooks?: Hooks;
  computed?: Accessors<Computed>;
  methods?: Methods;
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any> | string>;

  relations?: Record<string, any>;

  el?: Element | string;
  template?: string;
  // hack is for functional component type inference, should not be used in user code

  created?(): void;
  attached?(): void;
  ready?(): void;
  moved?(): void;
  detached?(): void;

}

export interface RenderContext<Props=DefaultProps> {
  props: Props;
  slots(): any;
  listeners: { [key: string]: Function | Function[] };
  injections: any
}

export type Prop<T> = { (): T } | { new(...args: any[]): T & object }

export type PropType<T> = Prop<T> | Prop<T>[];

export type PropValidator<T> = PropOptions<T> | PropType<T>;

export interface PropOptions<T=any> {
  type?: PropType<T>;
  required?: boolean;
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: T): boolean;
}

export type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>
}
export type ArrayPropsDefinition<T> = (keyof T)[];
export type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;

export interface ComputedOptions<T> {
  get?(): T;
  set?(value: T): void;
  cache?: boolean;
}

export type WatchHandler<T> = (val: T, oldVal: T) => void;

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export interface WatchOptionsWithHandler<T> extends WatchOptions {
  handler: WatchHandler<T>;
}
export type InjectKey = string | symbol;

export type InjectOptions = {
  [key: string]: InjectKey | { from?: InjectKey, default?: any }
} | string[];
