/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const sfcCompiler = require('vue-template-compiler');
const fs = require('fs');
const path = require('path');

const acorn = require('acorn-dynamic-import').default;
const Walker = require('./astWalk');


const ECMA_VERSION = 2017;

const POSSIBLE_AST_OPTIONS = [{
  ranges: true,
  locations: true,
  ecmaVersion: ECMA_VERSION,
  sourceType: "module",
  plugins: {
    dynamicImport: true
  }
}, {
  ranges: true,
  locations: true,
  ecmaVersion: ECMA_VERSION,
  sourceType: "script",
  plugins: {
    dynamicImport: true
  }
}];

exports = module.exports =  {

  parse (rst) {
    debugger;
    let ast = this.ast(rst.code);
    return ;
    let sfc;
  },

  ast (source) {
    let ast;
    const comments = [];
    for(let i = 0, len = POSSIBLE_AST_OPTIONS.length; i < len; i++) {
      if(!ast) {
        try {
          comments.length = 0;
          POSSIBLE_AST_OPTIONS[i].onComment = comments;
          ast = acorn.parse(source, POSSIBLE_AST_OPTIONS[i]);
        } catch(e) {
          // ignore the error
        }
      }
    }

    if (!ast) {
      ast = acorn.parse(source, {
        ranges: true,
        locations: true,
        ecmaVersion: ECMA_VERSION,
        sourceType: "module",
        plugins: {
          dynamicImport: true
        },
        onComment: comments
      });
    }

    if (!ast || typeof ast !== 'object') {
      throw new Error(`Source could\'t be parsed`);
    }
    let walker = new Walker(ast);
    walker.run();

    return ast;
  }

}
