    /**
     * Merge options from element
     * @param  {Element} elem           Dom element
     * @param  {Object} defaultOptions weapp component options
     * @return {Object}                Merged options
     */
export const merge = (elem, defaultOptions) =>{
    let o = {};
    for (let k in defaultOptions) {
        let val = elem.getAttribute(k);
        switch (defaultOptions[k].type) {
            case Boolean:
                val = !!val;
                break;
            case String:
                val = val == null ? '' : (typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
                break;
            case Number:
                let n = parseFloat(val);
                val = isNaN(n) ? val : n;
        }
        o[k] = val ? val : defaultOptions[k].default;
    }
    return o;
}
export const wxCallback = (type, name, options, data) => {
    if (typeof options[type] === 'function') {
        setTimeout(() => {
            if (name === 'login') {
                options[type].call(window.wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), code: data.code, data: data});
            } else {
                options[type].call(window.wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), data: data});
            }
        }, 0);
    }
};
export const wxSuccess = (name, options, data) => {
    wxCallback('success', name, options, data);
    wxCallback('complete', name, options, data);
};
export const wxFail = (name, options, data) => {
    wxCallback('fail', name, options, data);
    wxCallback('complete', name, options, data);
}