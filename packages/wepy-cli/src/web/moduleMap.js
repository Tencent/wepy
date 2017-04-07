export default class {

    constructor () {
        this._index = -1;
        this._map = {};
    }

    add (file) {
        this._index++;
        this.length = this._index + 1;
        this._map[file] = this._index;
    }

    get (file) {
        return this._map[file];
    }
}