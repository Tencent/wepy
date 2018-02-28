class AstWalker {
  constructor (ast) {
    this.ast = ast;
    this.state = {};
    this.deps = [];
  }

  run () {
    const oldScope = this.scope;
    const oldState = this.state;
    const oldComments = this.comments;

    this.scope = {
			inTry: false,
			definitions: [],
			renames: {}
		};
    const state = {};
    this.prewalkStatements(this.ast.body);
    this.walkStatements(this.ast.body);
  }
  // Walking iterates the statements and expressions and processes them
  walkStatements(statements) {
    for(let index = 0, len = statements.length; index < len; index++) {
      const statement = statements[index];
      this.walkStatement(statement);
    }
  }
  walkStatement(statement) {
    // if(this.applyPluginsBailResult1("statement", statement) !== undefined) return;
    const handler = this["walk" + statement.type];
    if(handler)
      handler.call(this, statement);
  }

  walkClass(classy) {
    if(classy.superClass)
      this.walkExpression(classy.superClass);
    if(classy.body && classy.body.type === "ClassBody") {
      classy.body.body.forEach(methodDefinition => {
        if(methodDefinition.type === "MethodDefinition")
          this.walkMethodDefinition(methodDefinition);
      });
    }
  }

  walkMethodDefinition(methodDefinition) {
    if(methodDefinition.computed && methodDefinition.key)
      this.walkExpression(methodDefinition.key);
    if(methodDefinition.value)
      this.walkExpression(methodDefinition.value);
  }

  // Prewalking iterates the scope for variable declarations
  prewalkStatements(statements) {
    for(let index = 0, len = statements.length; index < len; index++) {
      const statement = statements[index];
      this.prewalkStatement(statement);
    }
  }

  // Walking iterates the statements and expressions and processes them
  walkStatements(statements) {
    for(let index = 0, len = statements.length; index < len; index++) {
      const statement = statements[index];
      this.walkStatement(statement);
    }
  }

  prewalkStatement(statement) {
    const handler = this["prewalk" + statement.type];
    if(handler)
      handler.call(this, statement);
  }

  walkStatement(statement) {
    // if(this.applyPluginsBailResult1("statement", statement) !== undefined) return;
    const handler = this["walk" + statement.type];
    if(handler)
      handler.call(this, statement);
  }

  // Real Statements
  prewalkBlockStatement(statement) {
    this.prewalkStatements(statement.body);
  }

  walkBlockStatement(statement) {
    this.walkStatements(statement.body);
  }

  walkExpressionStatement(statement) {
    this.walkExpression(statement.expression);
  }

  prewalkIfStatement(statement) {
    this.prewalkStatement(statement.consequent);
    if(statement.alternate)
      this.prewalkStatement(statement.alternate);
  }

  walkIfStatement(statement) {
    const result = undefined;
    // const result = this.applyPluginsBailResult1("statement if", statement);
    if(result === undefined) {
      this.walkExpression(statement.test);
      this.walkStatement(statement.consequent);
      if(statement.alternate)
        this.walkStatement(statement.alternate);
    } else {
      if(result)
        this.walkStatement(statement.consequent);
      else if(statement.alternate)
        this.walkStatement(statement.alternate);
    }
  }

  prewalkLabeledStatement(statement) {
    this.prewalkStatement(statement.body);
  }

  walkLabeledStatement(statement) {
    const result = undefined;
    // const result = this.applyPluginsBailResult1("label " + statement.label.name, statement);
    if(result !== true)
      this.walkStatement(statement.body);
  }

  prewalkWithStatement(statement) {
    this.prewalkStatement(statement.body);
  }

  walkWithStatement(statement) {
    this.walkExpression(statement.object);
    this.walkStatement(statement.body);
  }

  prewalkSwitchStatement(statement) {
    this.prewalkSwitchCases(statement.cases);
  }

  walkSwitchStatement(statement) {
    this.walkExpression(statement.discriminant);
    this.walkSwitchCases(statement.cases);
  }

  walkTerminatingStatement(statement) {
    if(statement.argument)
      this.walkExpression(statement.argument);
  }

  walkReturnStatement(statement) {
    this.walkTerminatingStatement(statement);
  }

  walkThrowStatement(statement) {
    this.walkTerminatingStatement(statement);
  }

  prewalkTryStatement(statement) {
    this.prewalkStatement(statement.block);
  }

  walkTryStatement(statement) {
    if(this.scope.inTry) {
      this.walkStatement(statement.block);
    } else {
      this.scope.inTry = true;
      this.walkStatement(statement.block);
      this.scope.inTry = false;
    }
    if(statement.handler)
      this.walkCatchClause(statement.handler);
    if(statement.finalizer)
      this.walkStatement(statement.finalizer);
  }

  prewalkWhileStatement(statement) {
    this.prewalkStatement(statement.body);
  }

  walkWhileStatement(statement) {
    this.walkExpression(statement.test);
    this.walkStatement(statement.body);
  }

  prewalkDoWhileStatement(statement) {
    this.prewalkStatement(statement.body);
  }

  walkDoWhileStatement(statement) {
    this.walkStatement(statement.body);
    this.walkExpression(statement.test);
  }

  prewalkForStatement(statement) {
    if(statement.init) {
      if(statement.init.type === "VariableDeclaration")
        this.prewalkStatement(statement.init);
    }
    this.prewalkStatement(statement.body);
  }

  walkForStatement(statement) {
    if(statement.init) {
      if(statement.init.type === "VariableDeclaration")
        this.walkStatement(statement.init);
      else
        this.walkExpression(statement.init);
    }
    if(statement.test)
      this.walkExpression(statement.test);
    if(statement.update)
      this.walkExpression(statement.update);
    this.walkStatement(statement.body);
  }

  prewalkForInStatement(statement) {
    if(statement.left.type === "VariableDeclaration")
      this.prewalkStatement(statement.left);
    this.prewalkStatement(statement.body);
  }

  walkForInStatement(statement) {
    if(statement.left.type === "VariableDeclaration")
      this.walkStatement(statement.left);
    else
      this.walkExpression(statement.left);
    this.walkExpression(statement.right);
    this.walkStatement(statement.body);
  }

  prewalkForOfStatement(statement) {
    if(statement.left.type === "VariableDeclaration")
      this.prewalkStatement(statement.left);
    this.prewalkStatement(statement.body);
  }

  walkForOfStatement(statement) {
    if(statement.left.type === "VariableDeclaration")
      this.walkStatement(statement.left);
    else
      this.walkExpression(statement.left);
    this.walkExpression(statement.right);
    this.walkStatement(statement.body);
  }

  // Declarations
  prewalkFunctionDeclaration(statement) {
    if(statement.id) {
      this.scope.renames["$" + statement.id.name] = undefined;
      this.scope.definitions.push(statement.id.name);
    }
  }

  walkFunctionDeclaration(statement) {
    statement.params.forEach(param => {
      this.walkPattern(param);
    });
    this.inScope(statement.params, () => {
      if(statement.body.type === "BlockStatement") {
        this.prewalkStatement(statement.body);
        this.walkStatement(statement.body);
      } else {
        this.walkExpression(statement.body);
      }
    });
  }

  prewalkImportDeclaration(statement) {
    const source = statement.source.value;
    // this.applyPluginsBailResult("import", statement, source);
    statement.specifiers.forEach(function(specifier) {
      const name = specifier.local.name;
      this.scope.renames["$" + name] = undefined;
      this.scope.definitions.push(name);
      switch(specifier.type) {
        case "ImportDefaultSpecifier":
          // this.applyPluginsBailResult("import specifier", statement, source, "default", name);
          break;
        case "ImportSpecifier":
          // this.applyPluginsBailResult("import specifier", statement, source, specifier.imported.name, name);
          break;
        case "ImportNamespaceSpecifier":
          // this.applyPluginsBailResult("import specifier", statement, source, null, name);
          break;
      }
    }, this);
  }

  prewalkExportNamedDeclaration(statement) {
    let source;
    if(statement.source) {
      source = statement.source.value;
      // this.applyPluginsBailResult("export import", statement, source);
    } else {
      // this.applyPluginsBailResult1("export", statement);
    }
    if(statement.declaration) {
      if(/Expression$/.test(statement.declaration.type)) {
        throw new Error("Doesn't occur?");
      } else {
        if(true || !this.applyPluginsBailResult("export declaration", statement, statement.declaration)) {
          const pos = this.scope.definitions.length;
          this.prewalkStatement(statement.declaration);
          const newDefs = this.scope.definitions.slice(pos);
          for(let index = newDefs.length - 1; index >= 0; index--) {
            const def = newDefs[index];
            // this.applyPluginsBailResult("export specifier", statement, def, def, index);
          }
        }
      }
    }
    if(statement.specifiers) {
      for(let specifierIndex = 0; specifierIndex < statement.specifiers.length; specifierIndex++) {
        const specifier = statement.specifiers[specifierIndex];
        switch(specifier.type) {
          case "ExportSpecifier":
            {
              const name = specifier.exported.name;
              /*
              if(source)
                // this.applyPluginsBailResult("export import specifier", statement, source, specifier.local.name, name, specifierIndex);
              else
                // this.applyPluginsBailResult("export specifier", statement, specifier.local.name, name, specifierIndex);
              */
              break;
            }
        }
      }
    }
  }

  walkExportNamedDeclaration(statement) {
    if(statement.declaration) {
      this.walkStatement(statement.declaration);
    }
  }

  prewalkExportDefaultDeclaration(statement) {
    if(/Declaration$/.test(statement.declaration.type)) {
      const pos = this.scope.definitions.length;
      this.prewalkStatement(statement.declaration);
      const newDefs = this.scope.definitions.slice(pos);
      for(let index = 0, len = newDefs.length; index < len; index++) {
        const def = newDefs[index];
      // this.applyPluginsBailResult("export specifier", statement, def, "default");
      }
    }
  }

  walkExportDefaultDeclaration(statement) {
    // this.applyPluginsBailResult1("export", statement);
    if(/Declaration$/.test(statement.declaration.type)) {
      if(!this.applyPluginsBailResult("export declaration", statement, statement.declaration)) {
        this.walkStatement(statement.declaration);
      }
    } else {
      this.walkExpression(statement.declaration);
      if(!this.applyPluginsBailResult("export expression", statement, statement.declaration)) {
        // this.applyPluginsBailResult("export specifier", statement, statement.declaration, "default");
      }
    }
  }

  prewalkExportAllDeclaration(statement) {
    const source = statement.source.value;
    // this.applyPluginsBailResult("export import", statement, source);
    // this.applyPluginsBailResult("export import specifier", statement, source, null, null, 0);
  }

  prewalkVariableDeclaration(statement) {
    if(statement.declarations)
      this.prewalkVariableDeclarators(statement.declarations);
  }

  walkVariableDeclaration(statement) {
    if(statement.declarations)
      this.walkVariableDeclarators(statement.declarations);
  }

  prewalkClassDeclaration(statement) {
    if(statement.id) {
      this.scope.renames["$" + statement.id.name] = undefined;
      this.scope.definitions.push(statement.id.name);
    }
  }

  walkClassDeclaration(statement) {
    this.walkClass(statement);
  }

  prewalkSwitchCases(switchCases) {
    for(let index = 0, len = switchCases.length; index < len; index++) {
      const switchCase = switchCases[index];
      this.prewalkStatements(switchCase.consequent);
    }
  }

  walkSwitchCases(switchCases) {
    for(let index = 0, len = switchCases.length; index < len; index++) {
      const switchCase = switchCases[index];

      if(switchCase.test) {
        this.walkExpression(switchCase.test);
      }
      this.walkStatements(switchCase.consequent);
    }
  }

  walkCatchClause(catchClause) {
    this.inScope([catchClause.param], () => {
      this.prewalkStatement(catchClause.body);
      this.walkStatement(catchClause.body);
    });
  }

  prewalkVariableDeclarators(declarators) {
    declarators.forEach(declarator => {
      switch(declarator.type) {
        case "VariableDeclarator":
          {
            this.enterPattern(declarator.id, (name, decl) => {
              if (!this.applyMethods(`var${declarator.kind}${name}`, decl)) {
                if (!this.applyMethods(`var${name}`, decl)) {
                  this.scope.renames['$' + name] = undefined;
                  if(this.scope.definitions.indexOf(name) < 0)
                    this.scope.definitions.push(name);
                }
              }
              /*
              if(true || !this.applyPluginsBailResult1("var-" + declarator.kind + " " + name, decl)) {
                if(true || !this.applyPluginsBailResult1("var " + name, decl)) {
                  this.scope.renames["$" + name] = undefined;
                  if(this.scope.definitions.indexOf(name) < 0)
                    this.scope.definitions.push(name);
                }
              }*/
            });
            break;
          }
      }
    });
  }

  walkVariableDeclarators(declarators) {
    declarators.forEach(declarator => {
      switch(declarator.type) {
        case "VariableDeclarator":
          {
            const renameIdentifier = declarator.init && this.getRenameIdentifier(declarator.init);
            if(renameIdentifier && declarator.id.type === "Identifier" && this.applyMethods("canrename" + renameIdentifier, declarator.init)) {
            // if(renameIdentifier && declarator.id.type === "Identifier" && this.applyPluginsBailResult1("can-rename " + renameIdentifier, declarator.init)) {
              // renaming with "var a = b;"
              if(!this.applyMethods("rename" + renameIdentifier, declarator.init)) {
              // if(!this.applyPluginsBailResult1("rename " + renameIdentifier, declarator.init)) {
                this.scope.renames["$" + declarator.id.name] = this.scope.renames["$" + renameIdentifier] || renameIdentifier;
                const idx = this.scope.definitions.indexOf(declarator.id.name);
                if(idx >= 0) this.scope.definitions.splice(idx, 1);
              }
            } else {
              this.walkPattern(declarator.id);
              if(declarator.init)
                this.walkExpression(declarator.init);
            }
            break;
          }
      }
    });
  }

  walkPattern(pattern) {
    if(pattern.type === "Identifier")
      return;
    if(this["walk" + pattern.type])
      this["walk" + pattern.type](pattern);
  }

  walkAssignmentPattern(pattern) {
    this.walkExpression(pattern.right);
    this.walkPattern(pattern.left);
  }

  walkObjectPattern(pattern) {
    for(let i = 0, len = pattern.properties.length; i < len; i++) {
      const prop = pattern.properties[i];
      if(prop) {
        if(prop.computed)
          this.walkExpression(prop.key);
        if(prop.value)
          this.walkPattern(prop.value);
      }
    }
  }

  walkArrayPattern(pattern) {
    for(let i = 0, len = pattern.elements.length; i < len; i++) {
      const element = pattern.elements[i];
      if(element)
        this.walkPattern(element);
    }
  }

  walkRestElement(pattern) {
    this.walkPattern(pattern.argument);
  }

  walkExpressions(expressions) {
    for(let expressionsIndex = 0, len = expressions.length; expressionsIndex < len; expressionsIndex++) {
      const expression = expressions[expressionsIndex];
      if(expression)
        this.walkExpression(expression);
    }
  }

  walkExpression(expression) {
    if(this["walk" + expression.type])
      return this["walk" + expression.type](expression);
  }

  walkAwaitExpression(expression) {
    const argument = expression.argument;
    if(this["walk" + argument.type])
      return this["walk" + argument.type](argument);
  }

  walkArrayExpression(expression) {
    if(expression.elements)
      this.walkExpressions(expression.elements);
  }

  walkSpreadElement(expression) {
    if(expression.argument)
      this.walkExpression(expression.argument);
  }

  walkObjectExpression(expression) {
    for(let propIndex = 0, len = expression.properties.length; propIndex < len; propIndex++) {
      const prop = expression.properties[propIndex];
      if(prop.computed)
        this.walkExpression(prop.key);
      if(prop.shorthand)
        this.scope.inShorthand = true;
      this.walkExpression(prop.value);
      if(prop.shorthand)
        this.scope.inShorthand = false;
    }
  }

  walkFunctionExpression(expression) {
    expression.params.forEach(param => {
      this.walkPattern(param);
    });
    this.inScope(expression.params, () => {
      if(expression.body.type === "BlockStatement") {
        this.prewalkStatement(expression.body);
        this.walkStatement(expression.body);
      } else {
        this.walkExpression(expression.body);
      }
    });
  }

  walkArrowFunctionExpression(expression) {
    expression.params.forEach(param => {
      this.walkPattern(param);
    });
    this.inScope(expression.params, () => {
      if(expression.body.type === "BlockStatement") {
        this.prewalkStatement(expression.body);
        this.walkStatement(expression.body);
      } else {
        this.walkExpression(expression.body);
      }
    });
  }

  walkSequenceExpression(expression) {
    if(expression.expressions)
      this.walkExpressions(expression.expressions);
  }

  walkUpdateExpression(expression) {
    this.walkExpression(expression.argument);
  }

  walkUnaryExpression(expression) {
    if(expression.operator === "typeof") {
      const exprName = this.getNameForExpression(expression.argument);
      if(exprName && exprName.free) {


        const result = undefined;

        // const result = this.applyPluginsBailResult1("typeof " + exprName.name, expression);
        if(result === true)
          return;
      }
    }
    this.walkExpression(expression.argument);
  }

  walkLeftRightExpression(expression) {
    this.walkExpression(expression.left);
    this.walkExpression(expression.right);
  }

  walkBinaryExpression(expression) {
    this.walkLeftRightExpression(expression);
  }

  walkLogicalExpression(expression) {
    this.walkLeftRightExpression(expression);
  }

  walkAssignmentExpression(expression) {
    debugger;
    const renameIdentifier = this.getRenameIdentifier(expression.right);
    if(expression.left.type === "Identifier" && renameIdentifier && this.applyMethods("canrename" + renameIdentifier, expression.right)) {
    // if(expression.left.type === "Identifier" && renameIdentifier && this.applyPluginsBailResult1("can-rename " + renameIdentifier, expression.right)) {
      // renaming "a = b;"
      if(!this.applyMethods("rename" + renameIdentifier, expression.right)) {
      // if(!this.applyPluginsBailResult1("rename " + renameIdentifier, expression.right)) {
        this.scope.renames["$" + expression.left.name] = renameIdentifier;
        const idx = this.scope.definitions.indexOf(expression.left.name);
        if(idx >= 0) this.scope.definitions.splice(idx, 1);
      }
    } else if(expression.left.type === "Identifier") {
      if(!this.applyMethods("assigned" + expression.left.name, expression)) {
      // if(!this.applyPluginsBailResult1("assigned " + expression.left.name, expression)) {
        this.walkExpression(expression.right);
      }
      this.scope.renames["$" + expression.left.name] = undefined;
      if(!this.applyMethods("assign" + expression.left.name, expression)) {
      // if(!this.applyPluginsBailResult1("assign " + expression.left.name, expression)) {
        this.walkExpression(expression.left);
      }
    } else if (expression.left.type === 'MemberExpression' && expression.left.object.name === '_this' && expression.left.property.name === 'config' && expression.right.type === 'ObjectExpression') { // _this.config = {}
      this.config = expression.right;
    } else if (expression.left.type === 'MemberExpression' && expression.left.object.name === 'exports' && expression.left.property.name === 'default' && expression.right.type === 'Identifier') { // _this.config = {}
      this.export = expression;
    } else if (expression.left.type === 'MemberExpression' && expression.left.object.type === 'ThisExpression' && expression.left.property.name === 'components' && expression.right.type === 'ObjectExpression') { // this.components = {}
      this.components = expression;
    } else {
      this.walkExpression(expression.right);
      this.walkPattern(expression.left);
      this.enterPattern(expression.left, (name, decl) => {
        this.scope.renames["$" + name] = undefined;
      });
    }
  }

  walkConditionalExpression(expression) {


    const result = undefined;

    // const result = this.applyPluginsBailResult1("expression ?:", expression);
    if(result === undefined) {
      this.walkExpression(expression.test);
      this.walkExpression(expression.consequent);
      if(expression.alternate)
        this.walkExpression(expression.alternate);
    } else {
      if(result)
        this.walkExpression(expression.consequent);
      else if(expression.alternate)
        this.walkExpression(expression.alternate);
    }
  }

  walkNewExpression(expression) {
    this.walkExpression(expression.callee);
    if(expression.arguments)
      this.walkExpressions(expression.arguments);
  }

  walkYieldExpression(expression) {
    if(expression.argument)
      this.walkExpression(expression.argument);
  }

  walkTemplateLiteral(expression) {
    if(expression.expressions)
      this.walkExpressions(expression.expressions);
  }

  walkTaggedTemplateExpression(expression) {
    if(expression.tag)
      this.walkExpression(expression.tag);
    if(expression.quasi && expression.quasi.expressions)
      this.walkExpressions(expression.quasi.expressions);
  }

  walkClassExpression(expression) {
    this.walkClass(expression);
  }

  walkCallExpression(expression) {
    let result;
    function walkIIFE(functionExpression, options, currentThis) {
      function renameArgOrThis(argOrThis) {
        const renameIdentifier = this.getRenameIdentifier(argOrThis);
        if(renameIdentifier && this.applyMethods("canrename" + renameIdentifier, argOrThis)) {
        // if(renameIdentifier && this.applyPluginsBailResult1("can-rename " + renameIdentifier, argOrThis)) {
          if(!this.applyMethods("rename" + renameIdentifier, argOrThis))
          // if(!this.applyPluginsBailResult1("rename " + renameIdentifier, argOrThis))
            return renameIdentifier;
        }
        this.walkExpression(argOrThis);
      }
      const params = functionExpression.params;
      const renameThis = currentThis ? renameArgOrThis.call(this, currentThis) : null;
      const args = options.map(renameArgOrThis, this);
      this.inScope(params.filter(function(identifier, idx) {
        return !args[idx];
      }), () => {
        if(renameThis) {
          this.scope.renames.$this = renameThis;
        }
        for(let i = 0; i < args.length; i++) {
          const param = args[i];
          if(!param) continue;
          if(!params[i] || params[i].type !== "Identifier") continue;
          this.scope.renames["$" + params[i].name] = param;
        }
        if(functionExpression.body.type === "BlockStatement") {
          this.prewalkStatement(functionExpression.body);
          this.walkStatement(functionExpression.body);
        } else
          this.walkExpression(functionExpression.body);
      });
    }
    if(expression.callee.type === "MemberExpression" &&
      expression.callee.object.type === "FunctionExpression" &&
      !expression.callee.computed &&
      (["call", "bind"]).indexOf(expression.callee.property.name) >= 0 &&
      expression.arguments &&
      expression.arguments.length > 0
    ) {
      // (function(...) { }.call/bind(?, ...))
      walkIIFE.call(this, expression.callee.object, expression.arguments.slice(1), expression.arguments[0]);
    } else if(expression.callee.type === "FunctionExpression" && expression.arguments) {
      // (function(...) { }(...))
      walkIIFE.call(this, expression.callee, expression.arguments);
    } else if(expression.callee.type === "Import") {
      // result = this.applyPluginsBailResult1("import-call", expression);
      if(result === true)
        return;

      if(expression.arguments)
        this.walkExpressions(expression.arguments);
    } else {

      const callee = this.evaluateExpression(expression.callee);
      if(callee.identifier) {
        let fn = `call${callee.identifier}`;
        if (this[fn]) {
          result = this[fn](expression);
        }
        // result = this.applyPluginsBailResult1("call " + callee.identifier, expression);
        if(result === true)
          return;
        let identifier = callee.identifier.replace(/\.[^.]+$/, ".*");
        if(identifier !== callee.identifier) {
          let fn = `call${identifier}`;
          if (this[fn]) {
            result = this[fn](expression);
          }
          // result = this.applyPluginsBailResult1("call " + identifier, expression);
          if(result === true)
            return;
        }
      }

      if(expression.callee)
        this.walkExpression(expression.callee);
      if(expression.arguments)
        this.walkExpressions(expression.arguments);
    }
  }

  walkMemberExpression(expression) {
    const exprName = this.getNameForExpression(expression);
    if(exprName && exprName.free) {
      let result;
      // let result = this.applyPluginsBailResult1("expression " + exprName.name, expression);
      if(result === true)
        return;
      // result = this.applyPluginsBailResult1("expression " + exprName.nameGeneral, expression);
      if(result === true)
        return;
    }
    this.walkExpression(expression.object);
    if(expression.computed === true)
      this.walkExpression(expression.property);
  }

  walkIdentifier(expression) {
    if(this.scope.definitions.indexOf(expression.name) === -1) {
      let fn = 'expression' + (this.scope.renames["$" + expression.name] || expression.name);
      let result;
      if (this[fn]) {
        result = this[fn](expression);
      }
      // const result = this.applyPluginsBailResult1("expression " + (this.scope.renames["$" + expression.name] || expression.name), expression);
      if(result === true)
        return;
    }
  }

  inScope(params, fn) {
    const oldScope = this.scope;
    this.scope = {
      inTry: false,
      inShorthand: false,
      definitions: oldScope.definitions.slice(),
      renames: Object.create(oldScope.renames)
    };

    this.scope.renames.$this = undefined;

    for(let paramIndex = 0, len = params.length; paramIndex < len; paramIndex++) {
      const param = params[paramIndex];

      if(typeof param !== "string") {
        this.enterPattern(param, param => {
          this.scope.renames["$" + param] = undefined;
          this.scope.definitions.push(param);
        });
      } else {
        this.scope.renames["$" + param] = undefined;
        this.scope.definitions.push(param);
      }
    }

    fn();
    this.scope = oldScope;
  }

  enterPattern(pattern, onIdent) {
    if(pattern && this["enter" + pattern.type])
      this["enter" + pattern.type](pattern, onIdent);
  }

  enterIdentifier(pattern, onIdent) {
    onIdent(pattern.name, pattern);
  }

  enterObjectPattern(pattern, onIdent) {
    for(let propIndex = 0, len = pattern.properties.length; propIndex < len; propIndex++) {
      const prop = pattern.properties[propIndex];
      this.enterPattern(prop.value, onIdent);
    }
  }

  enterArrayPattern(pattern, onIdent) {
    for(let elementIndex = 0, len = pattern.elements.length; elementIndex < len; elementIndex++) {
      const element = pattern.elements[elementIndex];
      this.enterPattern(element, onIdent);
    }
  }

  enterRestElement(pattern, onIdent) {
    this.enterPattern(pattern.argument, onIdent);
  }

  enterAssignmentPattern(pattern, onIdent) {
    this.enterPattern(pattern.left, onIdent);
  }

  evaluateExpression(expression) {
    try {
      let result;
      let fn = `evaluate${expression.type}`;
      if (this[fn]) {
        result = this[fn](expression);
      }
      // const result = this.applyPluginsBailResult1("evaluate " + expression.type, expression);
      if(result !== undefined)
        return result;
    } catch(e) {
      console.warn(e);
      // ignore error
    }
    return expression.range;
    return new BasicEvaluatedExpression().setRange(expression.range);
  }

  getRenameIdentifier (expr) {
    const result = this.evaluateExpression(expr);
    if(!result) return;
    if(result.identifier) return result.identifier;
    return;
  }

  parseString(expression) {
    switch(expression.type) {
      case "BinaryExpression":
        if(expression.operator === "+")
          return this.parseString(expression.left) + this.parseString(expression.right);
        break;
      case "Literal":
        return expression.value + "";
    }
    throw new Error(expression.type + " is not supported as parameter for require");
  }

  parseCalculatedString(expression) {
    switch(expression.type) {
      case "BinaryExpression":
        if(expression.operator === "+") {
          const left = this.parseCalculatedString(expression.left);
          const right = this.parseCalculatedString(expression.right);
          if(left.code) {
            return {
              range: left.range,
              value: left.value,
              code: true
            };
          } else if(right.code) {
            return {
              range: [left.range[0], right.range ? right.range[1] : left.range[1]],
              value: left.value + right.value,
              code: true
            };
          } else {
            return {
              range: [left.range[0], right.range[1]],
              value: left.value + right.value
            };
          }
        }
        break;
      case "ConditionalExpression":
        {
          const consequent = this.parseCalculatedString(expression.consequent);
          const alternate = this.parseCalculatedString(expression.alternate);
          const items = [];
          if(consequent.conditional)
            Array.prototype.push.apply(items, consequent.conditional);
          else if(!consequent.code)
            items.push(consequent);
          else break;
          if(alternate.conditional)
            Array.prototype.push.apply(items, alternate.conditional);
          else if(!alternate.code)
            items.push(alternate);
          else break;
          return {
            value: "",
            code: true,
            conditional: items
          };
        }
      case "Literal":
        return {
          range: expression.range,
          value: expression.value + ""
        };
    }
    return {
      value: "",
      code: true
    };
  }

  parseStringArray(expression) {
    if(expression.type !== "ArrayExpression") {
      return [this.parseString(expression)];
    }

    const arr = [];
    if(expression.elements)
      expression.elements.forEach(function(expr) {
        arr.push(this.parseString(expr));
      }, this);
    return arr;
  }

  parseCalculatedStringArray(expression) {
    if(expression.type !== "ArrayExpression") {
      return [this.parseCalculatedString(expression)];
    }

    const arr = [];
    if(expression.elements)
      expression.elements.forEach(function(expr) {
        arr.push(this.parseCalculatedString(expr));
      }, this);
    return arr;
  }

  parse(source, initialState) {
    let ast;
    const comments = [];
    for(let i = 0, len = POSSIBLE_AST_OPTIONS.length; i < len; i++) {
      if(!ast) {
        try {
          comments.length = 0;
          POSSIBLE_AST_OPTIONS[i].onComment = comments;
          ast = acorn.parse(source, POSSIBLE_AST_OPTIONS[i]);
        } catch(e) {
          // ignore the error
        }
      }
    }
    if(!ast) {
      // for the error
      ast = acorn.parse(source, {
        ranges: true,
        locations: true,
        ecmaVersion: ECMA_VERSION,
        sourceType: "module",
        plugins: {
          dynamicImport: true
        },
        onComment: comments
      });
    }
    if(!ast || typeof ast !== "object")
      throw new Error("Source couldn't be parsed");
    const oldScope = this.scope;
    const oldState = this.state;
    const oldComments = this.comments;
    this.scope = {
      inTry: false,
      definitions: [],
      renames: {}
    };
    const state = this.state = initialState || {};
    this.comments = comments;
    if(this.applyPluginsBailResult("program", ast, comments) === undefined) {
      this.prewalkStatements(ast.body);
      this.walkStatements(ast.body);
    }
    this.scope = oldScope;
    this.state = oldState;
    this.comments = oldComments;
    return state;
  }

  evaluate(source) {
    const ast = acorn.parse("(" + source + ")", {
      ranges: true,
      locations: true,
      ecmaVersion: ECMA_VERSION,
      sourceType: "module",
      plugins: {
        dynamicImport: true
      }
    });
    if(!ast || typeof ast !== "object" || ast.type !== "Program")
      throw new Error("evaluate: Source couldn't be parsed");
    if(ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement")
      throw new Error("evaluate: Source is not a expression");
    return this.evaluateExpression(ast.body[0].expression);
  }

  getComments(range) {
    return this.comments.filter(comment => comment.range[0] >= range[0] && comment.range[1] <= range[1]);
  }

  getCommentOptions(range) {
    const comments = this.getComments(range);
    if(comments.length === 0) return null;
    const options = comments.map(comment => {
      try {
        return json5.parse(`{${comment.value}}`);
      } catch(e) {
        return {};
      }
    });
    return options.reduce((o, i) => Object.assign(o, i), {});
  }

  getNameForExpression(expression) {
    let expr = expression;
    const exprName = [];
    while(expr.type === "MemberExpression" && expr.property.type === (expr.computed ? "Literal" : "Identifier")) {
      exprName.push(expr.computed ? expr.property.value : expr.property.name);
      expr = expr.object;
    }
    let free;
    if(expr.type === "Identifier") {
      free = this.scope.definitions.indexOf(expr.name) === -1;
      exprName.push(this.scope.renames["$" + expr.name] || expr.name);
    } else if(expr.type === "ThisExpression" && this.scope.renames.$this) {
      free = true;
      exprName.push(this.scope.renames.$this);
    } else if(expr.type === "ThisExpression") {
      free = false;
      exprName.push("this");
    } else {
      return null;
    }
    let prefix = "";
    for(let i = exprName.length - 1; i >= 1; i--)
      prefix += exprName[i] + ".";
    const name = prefix + exprName[0];
    const nameGeneral = prefix + "*";
    return {
      name,
      nameGeneral,
      free
    };
  }

  // Plugins
  evaluateMemberExpression (expression) {
    let exprName = this.getNameForExpression(expression);
    if(exprName) {
      if(exprName.free) {
        let fn = `evaluateIdentifier${exprName.name}`;
        let rst;
        if (this[fn]) {
          rst = this[fn](expression);
        }
        return rst ? rst : {
          identifier: exprName.name,
          range: expression.range
        };
        // const result = this.applyPluginsBailResult1("evaluate Identifier " + exprName.name, expression);
        // if(result) return result;
        // return new BasicEvaluatedExpression().setIdentifier(exprName.name).setRange(expression.range);
      } else {
        let fn = `evaluatedefinedIdentifier${exprName.name}`;
        let rst;
        if (this[fn]) {
          rst = this[fn](expression);
        }
        return rst;
        // return this.applyPluginsBailResult1("evaluate defined Identifier " + exprName.name, expression);
      }
    }
  }

  evaluateIdentifier (expr) {
    const name = this.scope.renames["$" + expr.name] || expr.name;
    if(this.scope.definitions.indexOf(expr.name) === -1) {
      let fn = `evaluateIdentifier${name}`;
      let rst;
      if (this[fn]) {
        rst = this[fn](expr);
      }
      return rst ? rst : {
        identifier: name,
        range: expr.range
      };
      // const result = this.applyPluginsBailResult1("evaluate Identifier " + exprName.name, expr);
      // if(result) return result;
      // return new BasicEvaluatedexpr().setIdentifier(exprName.name).setRange(expr.range);
    } else {
      let fn = `evaluatedefinedIdentifier${name}`;
      let rst;
      if (this[fn]) {
        rst = this[fn](expr);
      }
      return rst;
      // return this.applyPluginsBailResult1("evaluate defined Identifier " + exprName.name, expression);
    }
  }
  applyMethods (method) {
    let rst;
    if (this[method]) {
      rst = this[method](expr);
    }
    return rst;
  }
  /*
  callrequire (expr) {
    // support for browserify style require delegator: "require(o, !0)"
    if(expr.arguments.length !== 2) return;
    const second = this.evaluateExpression(expr.arguments[1]);
    if(!second.isBoolean()) return;
    if(second.asBool() !== true) return;
    // const dep = new ConstDependency("require", expr.callee.range);
    const demp = {
      expression: 'require',
      range: expr.callee.range
    };
    dep.loc = expr.loc;
    if(this.state.current.dependencies.length > 1) {
      const last = this.state.current.dependencies[this.state.current.dependencies.length - 1];
      if(last.critical && last.request === "." && last.userRequest === "." && last.recursive)
        this.state.current.dependencies.pop();
    }
    this.state.current.addDependency(dep);
    return true;
  }*/
  callrequire (expr) {
    
    let param;
    let dep;
    let result;

    const old = this.state.current;

    if(expr.arguments.length >= 1) {
      param = this.evaluateExpression(expr.arguments[0]);
      dep = {
        expr: expr,
        outerRange: param.range,
        arrayRange: (expr.arguments.length > 1) ? expr.arguments[1].range : null,
        functionRange: (expr.arguments.length > 2) ? expr.arguments[2].range : null,
        errorCallbackRange: this.state.module,
        module: expr.arguments[0].type === 'Literal' ? expr.arguments[0].value : '',
        loc: expr.loc
      };
      /*
      dep = new AMDRequireDependenciesBlock(
        expr,
        param.range,
        (expr.arguments.length > 1) ? expr.arguments[1].range : null,
        (expr.arguments.length > 2) ? expr.arguments[2].range : null,
        this.state.module,
        expr.loc
      );*/
      this.deps.push(dep);
      this.state.current = dep;
    }

    if(expr.arguments.length === 1) {
      this.inScope([], () => {
        let fn = `callrequireAmdArray`;
        result = this[fn] ? this[fn](expr, param) : undefined;
        // result = this.applyPluginsBailResult("call require:amd:array", expr, param);
      });
      this.state.current = old;
      if(!result) return;
      // this.state.current.addBlock(dep);
      return true;
    }

    if(expr.arguments.length === 2 || expr.arguments.length === 3) {
      try {
        this.inScope([], () => {
          let fn = `callrequireAmdArray`;
          result = this[fn] ? this[fn](expr, param) : undefined;
          // result = this.applyPluginsBailResult("call require:amd:array", expr, param);
        });
        if(!result) {
          dep = new UnsupportedDependency("unsupported", expr.range);
          old.addDependency(dep);
          if(this.state.module)
            this.state.module.errors.push(new UnsupportedFeatureWarning(this.state.module, "Cannot statically analyse 'require(..., ...)' in line " + expr.loc.start.line));
          dep = null;
          return true;
        }
        dep.functionBindThis = this.processFunctionArgument(parser, expr.arguments[1]);
        if(expr.arguments.length === 3) {
          dep.errorCallbackBindThis = this.processFunctionArgument(parser, expr.arguments[2]);
        }
      } finally {
        this.state.current = old;
        if(dep)
          this.state.current.addBlock(dep);
      }
      return true;
    }
  }

  callrequireAmdArray (expr, param) {
    
    // if(param.isArray()) {
    if (param.items && param.items.forEach) {
      param.items.forEach((param) => {
        let result;
        let fn = `callrequireAmdItem`;
        if (this[fn]) {
          result = this[fn](expr, param);
        }
        // const result = this.applyPluginsBailResult("call require:amd:item", expr, param);
        if(result === undefined) {
          let fn = `callrequireAmdContext`;
          if (this[fn]) {
            this[fn](expr, param);
          }
          // this.applyPluginsBailResult("call require:amd:context", expr, param);
        }
      });
      return true;
    // } else if(param.isConstArray()) {

    } else if(param.array && param.array.length) {
      const deps = [];
      param.array.forEach((request) => {
        let dep, localModule;
        if(request === "require") {
          dep = "__webpack_require__";
        } else if(["exports", "module"].indexOf(request) >= 0) {
          dep = request;
        } else if(localModule = LocalModulesHelpers.getLocalModule(this.state, request)) { // eslint-disable-line no-cond-assign
          dep = new LocalModuleDependency(localModule);
          dep.loc = expr.loc;
          this.state.current.addDependency(dep);
        } else {
          dep = new AMDRequireItemDependency(request);
          dep.loc = expr.loc;
          dep.optional = !!this.scope.inTry;
          this.state.current.addDependency(dep);
        }
        deps.push(dep);
      });
      // const dep = new AMDRequireArrayDependency(deps, param.range);
      const dep = {
        depsArray: depsArray,
        range: param.range
      };
      dep.loc = expr.loc;
      dep.optional = !!this.scope.inTry;
      // this.state.current.addDependency(dep);
      return true;
    }
  }

  callrequireAmdItem (expr, param) {
    if(param.isConditional()) {
      param.options.forEach((param) => {
        let fn = 'callrequireAmdItem';
        const result = this[fn] ? this[fn](expr, param) : undefined;
        // const result = this.applyPluginsBailResult("call require:amd:item", expr, param);
        if(result === undefined) {
          let fn = 'callrequireAmdContext';
          if (this[fn]) {
            this[fn](expr, param);
          }
          this.applyPluginsBailResult("call require:amd:context", expr, param);
        }
      });
      return true;
    } else if(param.isString()) {
      let dep, localModule;
      if(param.string === "require") {
        dep = new ConstDependency("__webpack_require__", param.string);
      } else if(param.string === "module") {
        dep = new ConstDependency(this.state.module.moduleArgument || "module", param.range);
      } else if(param.string === "exports") {
        dep = new ConstDependency(this.state.module.exportsArgument || "exports", param.range);
      } else if(localModule = LocalModulesHelpers.getLocalModule(this.state, param.string)) { // eslint-disable-line no-cond-assign
        dep = new LocalModuleDependency(localModule, param.range);
      } else {
        dep = new AMDRequireItemDependency(param.string, param.range);
      }
      dep.loc = expr.loc;
      dep.optional = !!this.scope.inTry;
      this.state.current.addDependency(dep);
      return true;
    }
  }

  callrequireAmdContext (expr, param) {
    const dep = ContextDependencyHelpers.create(AMDRequireContextDependency, param.range, param, expr, options);
    if(!dep) return;
    dep.loc = expr.loc;
    dep.optional = !!this.scope.inTry;
    this.state.current.addDependency(dep);
    return true;
  }
}

exports = module.exports = AstWalker;
