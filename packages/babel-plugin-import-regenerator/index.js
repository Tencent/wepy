const helperModelImports = require('@babel/helper-module-imports');

let wm = new WeakMap();

exports = module.exports = ({types: t}) => {
  return {
    visitor: {
      CallExpression (path, file) {

        let callee = path.get('callee');

        if (callee.node && callee.node.object && callee.node.property) {
          if (t.isIdentifier(callee.node.object, { name: 'regeneratorRuntime' })) {

            let programPath = path.scope.getProgramParent().path;
            let runtimeId;

            if (wm.has(programPath.node)) {
              runtimeId = t.identifier(wm.get(programPath.node));
            } else {
              runtimeId = helperModelImports.addDefault(programPath, 'regenerator-runtime', {
                nameHint:'regeneratorRuntime',
                importedInterop: "uncompiled",
                blockHoist: 3
              });
              wm.set(programPath.node, runtimeId.name);
            }
            callee.node.object.name = runtimeId.name;
          }
        }
      }
    }
  };
}

// test
