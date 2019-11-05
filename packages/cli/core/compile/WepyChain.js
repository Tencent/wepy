import Chain from './Chain';
export default class WepyChain extends Chain {
  constructor() {
    super();
    this.wepy.self = true;
  }
}
