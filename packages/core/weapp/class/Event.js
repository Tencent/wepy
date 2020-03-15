export default class Event {
  constructor(e) {
    const { detail, target, currentTarget } = e;
    this.$wx = e;
    this.type = e.type;
    this.timeStamp = e.timeStamp;
    this.detail = detail;

    if (detail) {
      this.x = detail.x;
      this.y = detail.y;

      if ('arguments' in detail) {
        this.detail = detail.arguments.length > 1 ? detail.arguments : detail.arguments[0];
        this.arguments = detail.arguments;
        e.detail = this.detail;
      }
    }

    this.target = target;
    this.currentTarget = currentTarget;
    this.touches = e.touches;
    this.changedTouches = e.changedTouches;
  }
}
