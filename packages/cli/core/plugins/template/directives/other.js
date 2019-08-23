const parseVOn = require('../../../ast/parseVOn');
const onRE = /^@|^v-on:/;
const bindRE = /^:|^v-bind:/;
const modifierRE = /\.[^.]+/g;

const nativeBindRE = /^bind:?|^catch:?|^capture-bind:?|^capture-catch:?/;


exports = module.exports = function () {

  /*
  this.register('template-parse-ast-pre-attr-[other]', function preParseDirectivesFor ({item, name, expr, modifiers, scope, ctx}) {
  });
  */

  this.register('template-parse-ast-attr-[other]', function parseDirectivesFor ({item, name, expr, modifiers, scope, ctx}) {
    expr = expr.trim();
    let hook = '';

    if (nativeBindRE.test(name)) {
      let bindType = name.match(nativeBindRE)[0];
      name = name.replace(bindType, '');
      modifiers = {};
      hook = 'template-parse-ast-attr-v-on';
      if (bindType[bindType.length - 1] === ':') {
        bindType = bindType.substring(0, bindType.length - 1);
      }
      switch (bindType) {
        case 'bind':
          break;
        case 'catch':
          modifiers.stop = true;
          break;
        case 'capture-bind':
          modifiers.capture = true;
          break;
        case 'capture-catch':
          modifiers.stop = true;
          modifiers.capture = true;
          break;
      }
    } else if (bindRE.test(name)) { // :prop or v-bind:prop;
      hook = 'template-parse-ast-attr-v-bind';
    } else if (onRE.test(name)) {  // @ or v-on:
      name = name.replace(onRE, '');
      hook = 'template-parse-ast-attr-v-on';
    }

    if (!hook) {
      return {
        attrs: {
          [name]: expr
        }
      };
    } else {
      return this.hookUnique(hook, { item, name, expr, modifiers, scope, ctx });
    }
  });

  this.register('template-parse-ast-attr-[other]-apply', function applyDirective ({ parsed, rel }) {
    return {
      parsed,
      rel
    };
  });

};



