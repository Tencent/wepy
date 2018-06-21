/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = {
    resetGlobal: function () {
        if (typeof(window) !== 'undefined') {
            global = window;
        } else if (typeof(global) !== 'undefined') {
            global = global;
        } else {
            global = Function('return this')();
        }

        global.wx = {
            request: function (p) {
                p.success({
                    number: p.data.number
                });
                p.complete({
                    complete: 'complete'
                });
            },
            pauseVoice: function () {},
            getUserInfo: function (p) {
                p.success({
                    name: 'fakeID'
                });
                p.complete({
                    complete: 'complete'
                });
            },
            login: function (p) {
                p.fail({
                    code: 'xxx'
                });
                p.complete({
                    complete: 'complete'
                });
            },
            createCanvasContext: function () {
                return 'createCanvasContext';
            },
            redirectTo: function () {
                //console.log('redirectTo')
            },
            navigateTo: function () {
                //console.log('navigateTo');
            },
            switchTab: function () {
                //console.log('switchTab');
            },
            navigateBack: function () {
                //console.log('navigateBack');
            },
            uploadFile: function (p) {
                p.success({
                    success: 'success'
                });
                p.complete({
                    complete: 'complete'
                });

                const uploadTask = {
                    onProgressUpdate: (callback) => callback({
                        progress: 50,
                        totalBytesSent: 512,
                        totalBytesExpectedToSend: 1024
                    }),
                    abort: () => console.log('upload abort')
                }
                return uploadTask
            },
            downloadFile: function (p) {
                p.success({
                    success: 'success'
                });
                p.complete({
                    complete: 'complete'
                });

                const downloadTask = {
                    onProgressUpdate: (callback) => callback({
                        progress: 50,
                        totalBytesSent: 512,
                        totalBytesExpectedToSend: 1024
                    }),
                    abort: () => console.log('download abort')
                }
                return downloadTask
            },
        };

        global.getApp = function () { return {app:'app'}; };
        global.getCurrentPages = function () { 
            return [{__route__: 'pages/page1', __wxWebviewId__: 0}]; 
        };
    },
    getWxPage: function () {
        return {
            $root: { '$wxapp': { app: 'app' } },
            setData: function (v, fn) {
                if (typeof fn === 'function') {
                    fn();
                }
                return v;
            },
            $coma$comaa$tap: function () {
                return arguments;
            }
        };
    }
};