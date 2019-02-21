declare type IAnyObject = Record<string, any>

declare type KVInfer<T> = {
  [K in keyof T]: T[K]
}

declare type Void<T> = T | undefined | null

declare type PartialOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Pick<T, Exclude<keyof T, K>>

declare type Optional<T> = {
  [K in keyof T]+?: T[K]
}