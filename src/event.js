export default class {

    active = true;

    constructor (name, source, type) {

        this.name = name;
        this.source = source;
        this.type = type;
    }

    destroy () {
        this.active = false;
    }
}