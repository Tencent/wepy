const onRE = /^@|^v-on:/;
const bindRE = /^:|^v-bind:/;
const nativeBindRE = /^bind:?|^catch:?|^capture-bind:?|^capture-catch:?/;

exports = module.exports = function() {
  this.register('parse-template-ast-attr-[other]', function parseDirectivesFor({
    chain,
    item,
    name,
    expr,
    modifiers,
    scope
  }) {
    if (chain.previous.self().wepy) {
      if (nativeBindRE.test(name)) {
        let bindType = name.match(nativeBindRE)[0];
        name = name.replace(bindType, '');
        modifiers = {};
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
        return this.hookUnique('parse-template-ast-attr-v-on', { chain, item, name, expr, modifiers, scope });
      }

      if (bindRE.test(name)) {
        // :prop or v-bind:prop;

        return this.hookUnique('parse-template-ast-attr-v-bind', { chain, item, name, expr, modifiers, scope });
      } else if (onRE.test(name)) {
        // @ or v-on:
        name = name.replace(onRE, '');
        return this.hookUnique('parse-template-ast-attr-v-on', { chain, item, name, expr, modifiers, scope });
      }
    }

    return {
      attrs: {
        [name]: expr
      }
    };
  });

  this.register('parse-template-ast-attr-[other]-apply', function applyDirective({ payload }) {
    return payload;
  });
};
