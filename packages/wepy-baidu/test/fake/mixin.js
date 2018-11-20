/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

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

    onLoad () {
        this.valueChangedAt = 'mixin onLoad'
    }

    onShow () {
        this.valueChangedAt = 'mixin onShow'
    }

    onRoute () {
        this.valueChangedAt = 'mixin onRoute'
    }

    onShareAppMessage () {
        this.valueChangedAt = 'mixin onShareAppMessage'
    }
}
