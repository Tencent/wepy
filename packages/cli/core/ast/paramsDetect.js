const acorn = require('acorn');
const walk = require('acorn/dist/walk');

function isScope(node) {
  return (
    node.type === 'FunctionExpression' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'Program'
  );
}
function isBlockScope(node) {
  return node.type === 'BlockStatement' || isScope(node);
}

function declaresArguments(node) {
  return node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration';
}

function declaresThis(node) {
  return node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration';
}

function reallyParse(source, options) {
  var parseOptions = Object.assign({}, options, {
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowHashBang: true
  });
  return acorn.parse(source, parseOptions);
}
module.exports = findGlobals;
module.exports.parse = reallyParse;
function findGlobals(source, options) {
  options = options || {};
  let globals = [];
  let expressions = [];
  let callee;
  var ast;
  // istanbul ignore else
  if (typeof source === 'string') {
    ast = reallyParse(source, options);
  } else {
    ast = source;
  }
  // istanbul ignore if
  if (!(ast && typeof ast === 'object' && ast.type === 'Program')) {
    throw new TypeError('Source must be either a string of JavaScript or an acorn AST');
  }
  var declareFunction = function(node) {
    var fn = node;
    fn.locals = fn.locals || {};
    node.params.forEach(function(node) {
      declarePattern(node, fn);
    });
    if (node.id) {
      fn.locals[node.id.name] = true;
    }
  };
  var declarePattern = function(node, parent) {
    switch (node.type) {
      case 'Identifier':
        parent.locals[node.name] = true;
        break;
      case 'ObjectPattern':
        node.properties.forEach(function(node) {
          declarePattern(node.value, parent);
        });
        break;
      case 'ArrayPattern':
        node.elements.forEach(function(node) {
          if (node) declarePattern(node, parent);
        });
        break;
      case 'RestElement':
        declarePattern(node.argument, parent);
        break;
      case 'AssignmentPattern':
        declarePattern(node.left, parent);
        break;
      // istanbul ignore next
      default:
        throw new Error('Unrecognized pattern type: ' + node.type);
    }
  };
  var declareModuleSpecifier = function(node) {
    ast.locals = ast.locals || {};
    ast.locals[node.local.name] = true;
  };
  walk.ancestor(ast, {
    VariableDeclaration: function(node, parents) {
      var parent = null;
      for (var i = parents.length - 1; i >= 0 && parent === null; i--) {
        if (node.kind === 'var' ? isScope(parents[i]) : isBlockScope(parents[i])) {
          parent = parents[i];
        }
      }
      parent.locals = parent.locals || {};
      node.declarations.forEach(function(declaration) {
        declarePattern(declaration.id, parent);
      });
    },
    FunctionDeclaration: function(node, parents) {
      var parent = null;
      for (var i = parents.length - 2; i >= 0 && parent === null; i--) {
        if (isScope(parents[i])) {
          parent = parents[i];
        }
      }
      parent.locals = parent.locals || {};
      parent.locals[node.id.name] = true;
      declareFunction(node);
    },
    Function: declareFunction,
    ClassDeclaration: function(node, parents) {
      var parent = null;
      for (var i = parents.length - 2; i >= 0 && parent === null; i--) {
        if (isScope(parents[i])) {
          parent = parents[i];
        }
      }
      parent.locals = parent.locals || {};
      parent.locals[node.id.name] = true;
    },
    TryStatement: function(node) {
      if (node.handler === null) return;
      node.handler.locals = node.handler.locals || {};
      node.handler.locals[node.handler.param.name] = true;
    },
    ImportDefaultSpecifier: declareModuleSpecifier,
    ImportSpecifier: declareModuleSpecifier,
    ImportNamespaceSpecifier: declareModuleSpecifier
  });
  function identifier(node, parents) {
    var name = node.name;
    if (name === 'undefined') return;
    for (var i = 0; i < parents.length; i++) {
      if (name === 'arguments' && declaresArguments(parents[i])) {
        return;
      }
      if (parents[i].locals && name in parents[i].locals) {
        return;
      }
    }
    node.parents = parents;
    globals[name] = globals[name] || {};
    let callable = false;
    if (parents && parents.length > 2) {
      let parent = parents[parents.length - 2];
      callable = parent.type === 'CallExpression' && parent.callee === node;
    }
    globals[name].callable = globals[name].callable || callable;
    globals[name].nodes = globals[name].nodes || [];
    globals[name].nodes.push(node);
  }
  walk.ancestor(ast, {
    VariablePattern: identifier,
    Identifier: identifier,
    CallExpression: function(node) {
      callee = getNameForExpression(node.callee);
      expressions = node.arguments.map(arg => {
        let p = getNameForExpression(arg);
        p.node = arg;
        return p;
      });
    },
    ThisExpression: function(node, parents) {
      for (var i = 0; i < parents.length; i++) {
        if (declaresThis(parents[i])) {
          return;
        }
      }
      node.parents = parents;
      globals.push(node);
    }
  });
  return {
    identifiers: globals,
    callee,
    params: expressions
  };
}

function getNameForExpression(expression) {
  let expr = expression;
  const exprName = [];
  while (expr.type === 'MemberExpression' && expr.property.type === (expr.computed ? 'Literal' : 'Identifier')) {
    exprName.push(expr.computed ? expr.property.value : expr.property.name);
    expr = expr.object;
  }
  if (expr.type === 'Identifier') {
    exprName.push(expr.name);
  } else if (expr.type === 'Literal') {
    exprName.push(expr.value);
  }
  let name = exprName.pop();
  let t;
  while ((t = exprName.pop())) {
    name += typeof t === 'number' ? `[${t}]` : `.${t}`;
  }
  return {
    name,
    type: expr.type
  };
}
