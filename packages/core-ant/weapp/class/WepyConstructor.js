import Base from './Base';
import WepyComponent from './WepyComponent';
import { initData } from '../init/data';
import { initWatch } from '../init/watch';
import { initComputed } from '../init/computed';

export default class WepyConstructor extends WepyComponent {

  constructor (opt = {}) {
    let vm = new WepyComponent();

    // Only need data and watchers for a empty WepyComponent
    if (opt.data) {
      initData(vm, opt.data);
    }
    initWatch(vm);

    initComputed(vm, opt.computed);
    return vm;
  }
}
