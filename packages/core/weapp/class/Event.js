export default class Event {
  constructor (e) {
    let { detail, target, currentTarget } = e;
    this.$wx = e;
    this.type = e.type;
    this.timeStamp = e.timeStamp;
    this.x = detail.x;
    this.y = detail.y;

    this.target = target;
    this.currentTarget = currentTarget;
    this.touches = e.touches;
  }
}
