export default {
    /**
     * Merge options from element
     * @param  {Element} elem           Dom element
     * @param  {Object} defaultOptions weapp component options
     * @return {Object}                Merged options
     */
    merge (elem, defaultOptions) {
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
}