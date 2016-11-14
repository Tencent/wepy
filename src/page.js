import component from './component';

export default class extends component {

    isComponent = false;

    init (wxpage, $parent) {

        this.$parent = $parent;
        this.$root = this;
        super.init(wxpage, this);
    }

    onLoad () {
        console.log('page ' + this.name + ' onload');
        super.onLoad();
    }

}