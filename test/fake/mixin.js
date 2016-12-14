let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

module.exports = class Mix extends wepy.mixin {
    constructor () {
        super();
        this.data = {
            'a': 1
        };
        this.methods = {
            'tap': function () {}
        };
    }

    onLoad() {

    }

    onShow () {

    }
}
