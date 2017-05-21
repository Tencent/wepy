
class  ModuleMap {

    constructor () {
        this._index = -1;
        this._map = {};
        this._objectMap = {};
        this._objectPending = {};
    }

    add (file, wpy) {
        let index = this.get(file);
        if (index === undefined) {
            this._index++;
            this.length = this._index + 1;
            index = this._index
            this._map[file] = index;
        }
        if (wpy)
            this._objectMap[index] = wpy;
        return index;
    }

    get (file) {
        return this._map[file];
    }

    getObject (file) {
        let index = file;
        if (typeof(file) === 'string') {
            index = this.get(file);
        }
        return this._objectMap[index];
    }

    getArray () {
        this._objectMap.length = this.length;
        return Array.prototype.slice.apply(this._objectMap);
    }


    setPending (src) {
        this._objectPending[src] = true;
    }

    getPending (src) {
        return this._objectPending[src];
    }

}

let instance;

exports = module.exports = {
    getInstance: () => {
        if (!instance)
            throw 'Create instance before call getInstance';
        return instance;
    },
    createInstance: () => {
        instance = new ModuleMap();
        return instance;
    }
};
