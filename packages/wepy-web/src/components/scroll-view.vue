<template>
    <div class="wepy_scroll-view" @scroll="scroll($event)"><slot></slot></div>
</template>
<script>
import event from '../event';
import helper from '../helper';

let TABLE_OPTIONS = {
    'scroll-x': {
        type: Boolean,
        default: false
    },
    'scroll-y': {
        type: Boolean,
        default: false
    },
    'upper-threshold': {
        type: Number,
        default: 50
    },
    'lower-threshold': {
        type: Number,
        default: 50
    },
    'scroll-top': {
        type: Number,
        default: 0
    },
    'scroll-left': {
        type: Number,
        default: 0
    },
    'scroll-into-view': {
        type: String,
        default: ''
    },
    'scroll-with-animation': {
        type: Boolean,
        default: false
    },
    'enable-back-to-top': {
        type: Boolean,
        default: false
    }
};
let TABLE_EVENT = {
    scrolltoupper: null,
    scrolltolower: null,
    scroll: null,
};

export default {
    name: 'scroll-view',
    methods: {
        scroll (e) {
            let elem = e.srcElement || e.currentTarget;
            let evt = new event('system', this.$parent.$wepy, e.type);
            evt.$transfor(e);
            this.$parent.$event = evt;

            let options = helper.merge(elem, TABLE_OPTIONS);

            this.$emit('scroll');

            let upper = options['scroll-x'] ? elem.scrollLeft : elem.scrollTop;
            let lower = options['scroll-x'] ? (elem.scrollWidth - elem.scrollLeft - elem.clientWidth) : (elem.scrollHeight - elem.scrollTop - elem.clientHeight);
            
            if (upper <= options['upper-threshold']) {
                this.$emit('scrolltoupper');
            }
            if (lower <= options['lower-threshold']) {
                this.$emit('scrolltolower');
            }
        }
    }
}
</script>