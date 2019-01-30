/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const UglifyJS = require('uglify-js');

exports = module.exports = function (options = {}) {
  return function () {
    this.register('output-file', function ({ filename, code, encoding }) {

      let ext = path.extname(filename);
      if (ext !== '.js') {
        return { filename, code, encoding };
      }

      let result = UglifyJS.minify({ [filename]: code }, options);

      if (result.error) {
        let pos = {
          line: result.error.line,
          column: result.error.col
        };
        throw {
          handler: 'script',
          error: {
            filename: result.error.filename,
            code: code,
            type: 'error',
            message: result.error.message,
            title: 'uglifyjs'
          },
          pos: {
            start: pos,
            end: pos
          }
        };
      }
    });
  }
};
