module.exports = {
  definedVariable: 'http://www.foo.com',
  inObjectProperty: { BASE_URL: 'http://foo.com' },
  inString: 'BASE_URL',
  inTemplateLiterals: 'http://www.bar.com/api/',

  shouldReplaced: 'http://www.bar.com',
  objectTest: 'development',

  typeofTest: 'undefined',
  typeofTest2: 'undefined',

  builtinFuncValue: 666
};
