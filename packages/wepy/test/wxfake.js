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
            }
        };

        global.getApp = function () { return {app:'app'}; };
        global.getCurrentPages = function () { 
            return [{__route__: 'pages/page1', __wxWebviewId__: 0}]; 
        };
    },
    getWxPage: function () {
        return {
            $root: { '$wxapp': { app: 'app' } },
            setData: function (v) { return v; },
            $coma$comaa$tap: function () {
                return arguments;
            }
        };
    }
};