export default {
    all () {
        if (document.cookie === '') return {};

        var cookies = document.cookie.split('; '),
            result = {};

        document.cookie.split('; ').forEach(v => {
            let item = item = v.split('=');
            let key = decodeURIComponent(item.shift());
            let value = decodeURIComponent(item.join('='));
            result[key] = value;
        });
        return result;
    },

    get (keys) {
        let cookies = this.all();

        if (Object.prototype.toString.call(keys) === '[object Array]') {
            let rst = {};
            keys.forEach(v => {
                rst[v] = cookies[v];
            })
        } else {
            return cookies[keys];
        }

    }
}