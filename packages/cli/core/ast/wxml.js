const htmlparser = require('htmlparser2');


const walk = function (ast, opt) {
  let { type, name, attr } = opt;
  ast.forEach(item => {
    if (type && typeof type[item.type] === 'function') {
      type[item.type].call(null, item);
    }
    if (name && typeof name[item.name] === 'function') {
      name[item.name].call(null, item);
    }
    if (attr && item.attribs) {
      for (let key in item.attribs) {
        if (attr[key] && typeof attr[key] === 'function') {
          attr[key].call(null, item, attr, item.attribs[key]);
        }
      }
    }
  });
};

const generate = function (ast) {
  let str = '';
  if (!Array.isArray(ast)) {
    ast = [ast];
  }

  ast.forEach(item => {
    if (item.type === 'text') {
      str += item.data;
    } else if (item.type === 'tag') {
      str += '<' + item.name;
      if (item.attribs) {
        Object.keys(item.attribs).forEach(attr => {
          if (item.attribs[attr] !== undefined)
            str += (item.attribs[attr] === true)
              ? ` ${attr}`
              : ` ${attr}="${item.attribs[attr]}"`;
        });
      }
      str += '>';
      if (item.children && item.children.length) {
        str += generate(item.children);
      }
      str += `</${item.name}>`;
    }
  });
  return str;
};

module.exports = function ast (html) {
  return new Promise((resolve, reject) => {
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error) {
        reject(error);
      } else {
        resolve(dom);
      }
    }, { withStartIndices: true, withEndIndices: true });
    const parser = new htmlparser.Parser(handler, { xmlMode: true });
    parser.write(html);
    parser.end();
  });
};

module.exports.walk = walk;
module.exports.generate = generate;
