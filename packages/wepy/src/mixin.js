/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

export default class {

    data = {};

    components = {};

    methods = {};

    events = {};

    $init (parent) {
        let k;

        // 自定义属性覆盖
        Object.getOwnPropertyNames(this)
            .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
            .forEach((k) => {
                if (k[0] + k[1] !== 'on' && k !== 'constructor') {
                    if (!parent[k])
                        parent[k] = this[k];
                }
        });


        // 数据，事件，组件覆盖
        ['data', 'events', 'components'].forEach((item) => {
            Object.getOwnPropertyNames(this[item]).forEach((k) => {
                if (k !== 'init' && !parent[item][k])
                    parent[item][k] = this[item][k];
            });
        });
    }
}