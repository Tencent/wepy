/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import app from './app';
import page from './page';
import component from './component';
import event from './event';
import base from './base';
import util from './util';
import mixin from './mixin';

// wx polyfill
import wx from './wx';

export default {
    env: 'web',
    event: event,
    app: app,
    component: component,
    page: page,
    mixin: mixin,

    $createApp: base.$createApp,
    $createPage: base.$createPage,

    $isEmpty: util.$isEmpty,
    $isEqual: util.$isEqual,
    $isDeepEqual: util.$isDeepEqual,
    $has: util.$has,
    $extend: util.$extend,
    $isPlainObject: util.$isPlainObject,
    $copy: util.$copy,
};
