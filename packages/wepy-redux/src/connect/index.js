/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import { getStore } from '../store';
import { mapState, mapActions } from '../helpers';

export default function connect (states, actions) {
    states = mapState(states || {});
    actions = mapActions(actions || {});
    return function connectComponent(Component) {
        let unSubscribe = null;
        // 绑定
        const onLoad = Component.prototype.onLoad;
        const onUnload = Component.prototype.onUnload;

        const onStateChange = function () {
            const store = getStore();
            let hasChanged = false;
            Object.keys(states).forEach((k) => {
                const newV = states[k].call(this);
                if (this[k] !== newV) {
                    // 不相等
                    this[k] = newV;
                    hasChanged = true;
                }
            });
            hasChanged && this.$apply();
        };
        return class extends Component {
            constructor () {
                super();
                this.computed = Object.assign(this.computed || {}, states);
                this.methods = Object.assign(this.methods || {}, actions);
            }
            onLoad() {
                const store = getStore();
                unSubscribe = store.subscribe(onStateChange.bind(this));
                onStateChange.call(this);
                onLoad && onLoad.apply(this, arguments);
            }
            onUnload () {
                unSubscribe && unSubscribe();
                unSubscribe = null;
                onUnload && onUnload.apply(this, arguments);
            }
        };
    };
};
