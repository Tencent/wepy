const imports = require('@babel/helper-module-imports');

let importedName;

module.exports = module = ({types: t}) => {
  return {
    visitor: {
      CallExpression (path, file) {
        let callee = path.get('callee');
        if (callee.node && callee.node.object && callee.node.property) {
          if (t.isIdentifier(callee.node.object, { name: 'regeneratorRuntime' })) {
            if (!importedName) {
              let node = imports.addDefault(path, 'regenerator-runtime');
              importedName = node.name;
            }
            callee.node.object.name = importedName;
          }
        }
      }
    }
  };
}
