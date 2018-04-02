/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

class ModuleSet {

  constructor () {
    this._index = -1;
    this._map = {};
    this._set = {};
    this._array = {};
  }

  add (file) {
    let id = this.get(file);

    if (id === undefined) {
      this._index++;
      this.length = this._index + 1;
      id = this._index;
      this._map[file] = id;
      this._array[id] = file;
    }

    return id;
  }

  get (file) {
    return this._map[file];
  }

  pending (file) {
    return this.get(file) !== undefined && this._set[file] === undefined;
  }

  update (file, data) {
    this._set[file] = data;
  }

  data (file) {
    return this._set[file];
  }

  array () {
    this._array.length = this.length;
    return Array.prototype.slice.apply(this._array);
  }
}


exports = module.exports = ModuleSet;