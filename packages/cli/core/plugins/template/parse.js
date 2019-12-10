const htmlparser = require('htmlparser2');
const tools = require('../../util/tools');
const RawSource = require('../../compile/source').RawSource;
const modifierRE = /\.[^.]+/g;

const toAST = html => {
  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler(
      function(error, dom) {
        if (error) {
          reject(error);
        } else {
          resolve(dom);
        }
      },
      { withStartIndices: true, withEndIndices: true }
    );
    const parser = new htmlparser.Parser(handler, { xmlMode: true });
    parser.write(html);
    parser.end();
  });
};
/**
 * parse modifiers
 * @param  {String} name e.g. tap.stop.other
 * @return {Object}      e.g. {stop: true, other: true}
 */
const parseModifiers = (name = '') => {
  let ret = {};
  let match = name.match(modifierRE);
  if (match) {
    match.forEach(function(m) {
      ret[m.slice(1)] = true;
    });
  }
  return ret;
};

exports = module.exports = function() {
  this.register('parse-template-ast-attr', function parseAstAttr(chain, item, scope) {
    let attrs = item.attribs;
    let parsedAttr = item.parsedAttr || {};

    let cleanAttrs = [];

    // Pre walk attributes
    for (let name in attrs) {
      let expr = attrs[name];

      ({ item, name, expr } = this.hookUniqueReturnArg('parse-template-ast-pre-attr-' + name, { item, name, expr }));

      let modifiers = parseModifiers(name);

      if (modifiers) {
        name = name.replace(modifierRE, '');
      }

      let hook = 'parse-template-ast-pre-attr-' + name;

      if (!this.hasHook(hook)) {
        hook = 'parse-template-ast-pre-attr-[other]';
      }

      ({ chain, item, name, expr, modifiers, scope } = this.hookUniqueReturnArg(hook, {
        chain,
        item,
        name,
        expr,
        modifiers,
        scope
      }));

      cleanAttrs.push({
        item: item,
        name: name,
        expr: expr,
        modifiers: modifiers
      });
    }

    // Apply walk attributes
    cleanAttrs.forEach(({ item, name, expr, modifiers }) => {
      let hook = 'parse-template-ast-attr-' + name;
      if (!this.hasHook(hook)) {
        hook = 'parse-template-ast-attr-[other]';
      }

      let payload = this.hookUnique(hook, { chain, item, name, expr, modifiers, scope });

      let applyHook = payload.hook || `parse-template-ast-attr-${name}-apply`;
      if (!this.hasHook(applyHook)) {
        applyHook = `parse-template-ast-attr-[other]-apply`;
      }

      payload = this.hookUniqueReturnArg(applyHook, { chain, item, scope, payload });
      if (payload && payload.attrs) {
        parsedAttr = Object.assign(parsedAttr, payload.attrs);
      }
    });

    item.parsedAttr = parsedAttr;

    return [chain, item, scope];
  });

  this.register('parse-template-ast-tag', function parseAstTag(chain, item, scope) {
    let htmlTags = this.tags.htmlTags;
    let wxmlTags = this.tags.wxmlTags;
    let html2wxmlMap = this.tags.html2wxmlMap;
    let logger = this.logger;

    let components = chain.bead.parsed.rel.components;
    if (components[item.name]) {
      // It's a user defined component
      logger.silly('tag', `Found user defined component "${item.name}"`);
      item.parsedAttr = item.parsedAttr || {};
      item.parsedAttr['bind_init'] = '_initComponent';
    } else if (html2wxmlMap[item.name]) {
      // Tag is in the map list
      logger.silly('html2wxml', `Change "${item.name}" to "${html2wxmlMap[item.name]}"`);
      item.name = html2wxmlMap[item.name];
    } else if (wxmlTags.indexOf(item.name) > -1) {
      // Tag is a wxml tag
    } else if (htmlTags.indexOf(item.name) > -1) {
      // Tag is a html tag
      logger.silly('html2wxml', `Change "${item.name}" is a html tag, changed to "view"`);
      item.name = 'view';
    } else {
      // Tag is a unknow tag
      logger.silly('tag', `Assume "${item.name}" is a user defined component`);
    }
    return [chain, item, scope];
  });

  this.register('parse-template-ast', function parseAST(chain, ast, scope) {
    let currentScope;
    ast.forEach(item => {
      if (item.type === 'tag') {
        [chain, item, scope] = this.hookSeq('parse-template-ast-tag', chain, item, scope);
      }
      if (item.attribs) {
        [chain, item, currentScope] = this.hookSeq('parse-template-ast-attr', chain, item, scope);
      }
      if (item.children && item.children.length) {
        [chain, item.childen, currentScope] = this.hookSeq('parse-template-ast', chain, item.children, currentScope);
      }
    });
    return [chain, scope];
  });

  this.register('parse-template-ast-to-str', function astToStr(ast) {
    let str = '';
    ast.forEach(item => {
      if (item.type === 'text') {
        str += item.data;
      } else if (item.type === 'tag') {
        str += '<' + item.name;
        if (item.events) {
          item.events.forEach(evt => {
            if (evt.proxy) item.parsedAttr['data-wpy-evt'] = evt.id;
            item.parsedAttr[evt.type] = evt.expr;
            evt.params.forEach((p, i) => {
              if (i > 26) {
                // Maxium params.
                this.logger.warn(`Too many params`);
              } else {
                let evtAttr = 'data-wpy' + evt.event.toLowerCase() + '-' + String.fromCharCode(97 + i);
                if (evtAttr.length > 31) {
                  this.logger.warn(`Function name is too long, it may cause an Error. "${evt.handler}"`);
                }
                item.parsedAttr[evtAttr] = `${p}`;
              }
            });
          });
        }
        if (item.parsedAttr) {
          Object.keys(item.parsedAttr).forEach(attr => {
            if (item.parsedAttr[attr] !== undefined && attr !== 'class' && attr !== 'style')
              str +=
                tools.isTrue(item.parsedAttr[attr]) || item.parsedAttr[attr] === ''
                  ? ` ${attr}`
                  : ` ${attr}="${item.parsedAttr[attr]}"`;
          });
        }
        if (item.parsedAttr.style || (item.bindStyle && item.bindStyle.length)) {
          let staticStyle = (item.parsedAttr.style || '').trim();
          if (staticStyle !== '' && /;$/.test(staticStyle) === false) {
            staticStyle += ';';
          }
          let bindStyle = item.bindStyle && item.bindStyle.length ? ` {{ ${item.bindStyle.join(' + ')} }}` : '';
          str += ` style="${staticStyle + bindStyle}"`;
        }
        if (item.parsedAttr.class || (item.bindClass && item.bindClass.length)) {
          let staticClass = item.parsedAttr.class || '';
          let bindClass = item.bindClass && item.bindClass.length ? ` {{ [ ${item.bindClass.join(',')} ] }}` : '';
          str += ` class="${staticClass + bindClass}"`;
        }
        str += '>';
        if (item.children && item.children.length) {
          str += this.hookUnique('parse-template-ast-to-str', item.children);
        }
        str += `</${item.name}>`;
      }
    });
    return str;
  });

  this.register('parse-template-main', function parse(chain) {
    const bead = chain.bead;
    const parsed = bead.parsed;

    return toAST(bead.content).then(ast => {
      let rel = parsed.rel;
      // eslint-disable-next-line
      let scope = null;
      parsed.ast = ast;

      this.hookSeq('parse-template-ast', chain, ast, scope);

      let code = this.hookUnique('parse-template-ast-to-str', ast);
      parsed.source = new RawSource(code);
      parsed.ast = ast;
      parsed.rel = rel;
      return chain;
    });
  });
};
