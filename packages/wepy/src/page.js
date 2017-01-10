import component from './component';

export default class extends component {

    isComponent = false;

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


}