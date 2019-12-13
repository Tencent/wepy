/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const { ReplaceSource, RawSource } = require('../../compile/source');

// const path = require('path');

exports = module.exports = function() {
  this.register('parse-file', function(chain) {
    const bead = chain.bead;
    const compiledCode = bead.compiled.code;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }

    bead.parsed = {
      code: new ReplaceSource(new RawSource(compiledCode))
    };

    return Promise.resolve(chain);
  });
};
