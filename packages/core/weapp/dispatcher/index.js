import Event from '../class/Event';
import { callUserHook } from '../init/hooks';
import { isFunc, camelize } from './../util/index';

/**
 * Transform wxml data-xx params to an array
 */
function transformParams(dataset, type, hasModel = false) {
  let i = 0;
  let params = [];
  let modelParams = [];

  let noParams = false;
  let noModelParams = !hasModel;

  const camelizedType = camelize(type);
  while (i++ < 26 && (!noParams || !noModelParams)) {
    let alpha = String.fromCharCode(64 + i);
    if (!noParams) {
      let key = 'wpy' + camelizedType + alpha;
      if (!(key in dataset)) {
        // it can be undefined;
        noParams = true;
      } else {
        params.push(dataset[key]);
      }
    }
    if (!noModelParams && hasModel) {
      let modelKey = 'model' + alpha;
      if (!(modelKey in dataset)) {
        noModelParams = true;
      } else {
        modelParams.push(dataset[modelKey]);
      }
    }
  }

  return {
    handler: params,
    model: modelParams
  };
}

export const dispatcher = function(e) {
  const vm = this.$wepy;
  const type = e.type;
  // touchstart do not have currentTarget
  const dataset = (e.currentTarget || e.target).dataset || {};
  const evtid = dataset.wpyEvt;
  const modelId = dataset.modelId;
  const rel = vm.$rel || {};
  const handler = rel.handlers && rel.handlers[evtid] && rel.handlers[evtid][type];
  const model = rel.models && rel.models[modelId];

  if (!handler && !model) {
    return;
  }

  const params = transformParams(dataset, type, !!model);

  // Call model method
  if (model && type === model.type && isFunc(model.handler)) {
    model.handler.call(vm, e.detail.value, params.model);
  }

  // Call handler method
  if (isFunc(handler)) {
    const $event = new Event(e);
    const paramsWithEvent = params.handler.concat($event);
    let args = (e.detail && e.detail.arguments) || [];

    const hookRes = callUserHook(vm, 'before-event', {
      event: $event,
      params: paramsWithEvent,
      args: args
    });

    if (hookRes === false) {
      // Event cancelled.
      return;
    }
    return handler.apply(vm, paramsWithEvent);
  } else if (!model) {
    throw new Error('Unrecognized event');
  }
};
