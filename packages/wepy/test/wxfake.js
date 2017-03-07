module.exports = {
    resetGlobal: function () {
        if (typeof(window) !== 'undefined') {
            global = window;
        } else if (typeof(global) !== 'undefined') {
            global = global;
        } else {
            gloabl = Function('return this')();
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
                    name: 'gcaufy'
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
            }
        };

        global.getApp = function () { return {app:'app'}; };
        global.getCurrentPages = function () { 
            return [{__route__: 'index'}]; 
        };
    },
    getWxPage: function () {
        return {
            $root: { '$wxapp': { app: 'app' } },
            setData: function (v) { return v; },
            getCurrentPages: function () {
                return 'wxpage';
            },
            $coma$comaa$tap: function () {
                return arguments;
            }
        };
    }
};