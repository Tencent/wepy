/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import eslint from 'eslint';
import formatter from 'eslint-friendly-formatter';

export default function (esConfig, filepath) {
    if (!esConfig.formatter) {
        esConfig.formatter = formatter;
    }
    esConfig.output = esConfig.output === undefined ? true : esConfig.output;
    const engine = new eslint.CLIEngine(esConfig);
    const report = engine.executeOnFiles([filepath]);
    const formatter = engine.getFormatter();
    let rst = formatter(report.results);
    if (rst && esConfig.output) {
      console.log(rst);
    }
    return rst;
};
