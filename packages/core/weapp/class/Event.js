export default class Event {
  constructor(e) {
    const { detail, target, currentTarget } = e;
    this.$wx = e;
    this.type = e.type;
    this.timeStamp = e.timeStamp;
    if (detail) {
      this.x = detail.x;
      this.y = detail.y;
    }

    this.target = target;
    this.currentTarget = currentTarget;
    this.touches = e.touches;
    this.changedTouches = e.changedTouches;
  }
}
