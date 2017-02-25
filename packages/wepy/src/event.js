export default class {

    active = true;

    constructor (name, source, type) {

        this.name = name;
        this.source = source;
        this.type = type;
    }

    $destroy () {
        this.active = false;
    }

    $transfor(wxevent) {
        let k = 0;
        for (k in wxevent) {
            this[k] = wxevent[k];
        }
    }
}
