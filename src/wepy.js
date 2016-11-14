import app from './app';
import page from './page';
import component from './component';
import event from './event';
import base from './base';
import util from './util';


export default {
    event: event,
    app: app,
    component: component,
    page: page,

    $createApp: base.$createApp,
    $createPage: base.$createPage,

    $isEmpty: util.$isEmpty,
    $isDeepEqual: util.$isDeepEqual,
    $has: util.$has,
    $extend: util.$extend,
    $isPlainObject: util.$isPlainObject,
    $copy: util.$copy,
};


