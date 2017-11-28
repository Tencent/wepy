/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


// copy https://github.com/vuejs/vue-loader/blob/master/lib/style-compiler/plugins/scope-id.js and fix by wepy

import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export default postcss.plugin('add-id', function (id) {
    return function (root) {
        root.each(function rewriteSelector (node) {
            if (!node.selector) {
                // handle media queries
                if (node.type === 'atrule' && node.name === 'media') {
                    node.each(rewriteSelector);
                }
                return;
            }
            node.selector = selectorParser(function (selectors) {
                selectors.each(function (selector) {
                    var node = null;
                    selector.each(function (n) {
                        if (n.type !== 'pseudo') node = n;
                    });
                    selector.insertAfter(node, selectorParser.className({
                        value: id
                    }));
                });
            }).process(node.selector).result;
        });
    };
});