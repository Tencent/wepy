/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const fs = require('fs');
const path = require('path');
const htmlparser = require('htmlparser2');
const parseOptions = require('./parseOptions');


const ENTRY_FILE = 'app.wpy';

exports = module.exports =  {

  parse (compiled, ctx) {
    return this.getAST(compiled.content).then(ast => {
      debugger;

      return compiled;
    }).catch(e => {
      throw e;
    })
  },

  getAST (html) {
    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
          reject(error);
        } else {
          resolve(dom);
        }
      });
      const parser = new htmlparser.Parser(handler);
      parser.write(html);
      parser.end();
    });
  }
}
