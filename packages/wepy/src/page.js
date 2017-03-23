import component from './component';

export default class extends component {

    isComponent = false;


    $preloadData = {};

    init (wxpage, $parent) {

        this.$parent = $parent;
        this.$root = this;
        if (!$parent.$wxapp) {
            $parent.$wxapp = getApp();
        }
        this.$wxapp = $parent.$wxapp;
        super.init(wxpage, this);
    }

    onLoad () {
        super.onLoad();
    }

    $preload(key, data) {
        if (typeof(key) === 'object' && data) {
            let k;
            for (k in key) {
                this.$preload(k, key[k]);
            }
        } else {
            this.$preloadData[key] = data;
        }
    }
}