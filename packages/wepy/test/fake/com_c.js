let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

module.exports = class Com extends wepy.component {


    constructor () {
        super();

        this.props = ['combprop1', 'combprop2'];
    }

}