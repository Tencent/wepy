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
    },
  /**
   * Compatible types
   * @param defaultOptions single prop option
   * @param v   original value
   * @returns {*}
   */
    typePolyfill (defaultOptions, v) {
      let val
      switch (defaultOptions.type) {
        case Boolean:
          val = !!v
          break
        case String:
          val = v == null ? '' : (typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v))
          break
        case Number:
          let n = Number(v)
          val = isNaN(n) ? 0 : n
      }
      return val
    }
}