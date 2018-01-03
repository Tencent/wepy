/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import util from './util';

const cachePath = '.wepycache';
let _buildCache = null;
let _cacheChanged = false;
let _filelistCache = {};

export default {
    setFileNotWritten: function setFileNotWritten(v) {
        this._filesNotWritten = (this._filesNotWritten || []).concat(v);
    },
    getFileNotWritten: function getFileNotWritten(v) {
        return this._filesNotWritten ? this._filesNotWritten.indexOf(v) : -1;
    },
    setParams (v) {
        this._params = v;
    },
    getParams () {
        return this._params;
    },
    setExt (v) {
        this._ext = v;
    },
    getExt () {
        return this._ext || '.wpy';
    },
    getSrc () {
        return this._src || 'src';
    },
    setSrc (v = 'src') {
        this._src = v;
    },
    getDist () {
        return this._dist || 'dist';
    },
    setDist (v = 'dist') {
        this._dist = v;
    },
    setPages (v = []) {
        this._pages = v;
    },
    getPages () {
        return this._pages || [];
    },
    getConfig () {
        return this._config || null;
    },
    setConfig (v = null) {
        this._config = v;
    },
    setFileList (key, v) {
        _filelistCache[key] = v;
    },
    getFileList (key) {
        return _filelistCache[key] || null;
    },
    getBuildCache (file) {
        if (_buildCache)
            return _buildCache;

        if (util.isFile(cachePath)) {
            _buildCache = util.readFile(cachePath);
            try {
                _buildCache = JSON.parse(_buildCache);
            } catch (e) {
                _buildCache = null;
            }
        }

        return _buildCache || {};
    },
    setBuildCache (file) {
        let cache = this.getBuildCache();
        cache[file] = util.getModifiedTime(file);
        _buildCache = cache;
        _cacheChanged = true;
    },
    clearBuildCache() {
        util.unlink(cachePath);
    },
    saveBuildCache() {
        if (_cacheChanged) {
            util.writeFile(cachePath, JSON.stringify(_buildCache));
            _cacheChanged = false;
        }
    },
    checkBuildCache(file) {
        let cache = this.getBuildCache();
        return cache[file] && cache[file] === util.getModifiedTime(file);
    }
}