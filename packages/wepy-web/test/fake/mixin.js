let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

module.exports = class Mix extends wepy.mixin {
    constructor () {
        super();
        this.data = {
            'a': 1
        };
        this.methods = {
            'tap': function () {},
            'notInPage': function () {}
        };
    }

    func1 () {
        return 'mixin-func1';
    }

    func2 () {
        return 'mixin-func2';
    }

    onLoad() {

    }

    onShow () {

    }
}
