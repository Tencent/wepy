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
            request: function () {},
            pauseVoice: function () {},
            getUserInfo: function () { return {name: 'gcaufy'}; }
        };

        global.getApp = function () { return {app:'app'}; };
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