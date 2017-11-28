/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import postcss from 'postcss';

let rpxConvert = postcss.plugin('rpx-convert', function () {
  return function (root) {
    root.walkDecls(function(decl, i) {
      // replace page to body
      if (decl.parent.selector === 'page') {
        decl.parent.selector = 'body';
      }
      if (decl.value.indexOf('px') === -1) {
        return;
      }
      let value = decl.value.replace(/"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)rpx/ig, (m, $1) => {
        if (!$1) {
            return m;
        }
        let pixels = parseFloat($1);
        let fixedVal = pixels / 2;
        return (fixedVal === 0) ? '0' : fixedVal + 'px';
      });
      decl.value = value;
    });
  };
});

export default function handler (content, cb) {
  return postcss(rpxConvert()).process(content).css;
}