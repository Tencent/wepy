export interface WepyCustomEvent<
  Detail extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject,
  Mark extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject,
  CurrentTargetDataset extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject,
  TargetDataset extends WechatMiniprogram.IAnyObject = CurrentTargetDataset
> extends WechatMiniprogram.BaseEvent<Mark, CurrentTargetDataset, TargetDataset> {
  $wx: WechatMiniprogram.CustomEvent<Detail, Mark, CurrentTargetDataset, TargetDataset>;
}
