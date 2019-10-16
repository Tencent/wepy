/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const UglifyJS = require('uglify-js');
const path = require('path');

/*
 * To human readable size
 */
function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + ' GB';
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes > 1) {
    bytes = bytes + ' bytes';
  } else if (bytes == 1) {
    bytes = bytes + ' byte';
  } else {
    bytes = '0 bytes';
  }
  return bytes;
}

let totalSize = 0;
let totalFile = 0;
let totalMinSize = 0;

exports = module.exports = function(options = {}) {
  return function() {
    this.register('process-done', function() {
      this.logger.info(
        'uglifyjs',
        `Compressed File: ${totalFile}, Original Size: ${formatSizeUnits(
          totalSize
        )}, Compressed Size: ${formatSizeUnits(totalMinSize)}, Ratio: ${(totalMinSize / totalSize).toFixed(2)}%`
      );

      // Clear data
      totalFile = 0;
      totalSize = 0;
      totalMinSize = 0;
    });

    this.register('output-file', function({ filename, code, encoding }) {
      this.logger.silly('uglifyjs', 'File: ' + filename);

      let ext = path.extname(filename);
      if (ext !== '.js') {
        return { filename, code, encoding };
      }

      totalFile++;
      totalSize += code.length;

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
      } else {
        totalMinSize += result.code.length;
        return Promise.resolve({
          filename,
          code: result.code,
          encoding
        });
      }
    });
  };
};
