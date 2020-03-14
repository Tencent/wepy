exports = module.exports = {
  getNameForExpression(expression) {
    let expr = expression;
    const exprName = [];
    while (expr.type === 'MemberExpression' && expr.property.type === (expr.computed ? 'Literal' : 'Identifier')) {
      exprName.push(expr.computed ? expr.property.value : expr.property.name);
      expr = expr.object;
    }
    let free;
    if (expr.type === 'Identifier') {
      free = this.scope.definitions.indexOf(expr.name) === -1;
      exprName.push(this.scope.renames['$' + expr.name] || expr.name);
    } else if (expr.type === 'ThisExpression' && this.scope.renames.$this) {
      free = true;
      exprName.push(this.scope.renames.$this);
    } else if (expr.type === 'ThisExpression') {
      free = false;
      exprName.push('this');
    } else {
      return null;
    }
    let prefix = '';
    for (let i = exprName.length - 1; i >= 1; i--) prefix += exprName[i] + '.';
    const name = prefix + exprName[0];
    const nameGeneral = prefix + '*';
    return {
      name,
      nameGeneral,
      instance: prefix.substring(0, prefix.length - 1),
      callee: exprName[0],
      free
    };
  }
};
