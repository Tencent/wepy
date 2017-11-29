/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */



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
