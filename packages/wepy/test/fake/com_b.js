let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

module.exports = class Com extends wepy.component {


    constructor () {
        super();
        this.data = {
            'a': 1
        };

        this.props = ['combprop1', 'combprop2'];
    }

}