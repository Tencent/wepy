const { isStr, isArr, isPlainObject, isUndef } = require('./tools');
const CONST = require('./const');
const DEFAULT_WEAPP_RULES = CONST.DEFAULT_WEAPP_RULES;

function transferWeappRule(option, type) {
  let result = [];
  let addRule = {};
  let addDefault = false;

  const defaultLang = DEFAULT_WEAPP_RULES[type].lang;
  const defaultExt = DEFAULT_WEAPP_RULES[type].ext;

  if (isUndef(option)) {
    addRule.lang = defaultLang;
    addRule.ext = defaultExt;
  }
  if (isStr(option)) {
    addRule.lang = defaultLang;
    addRule.ext = option;
    addDefault = option !== defaultExt;
  }
  if (isPlainObject(option)) {
    addRule.lang = option.lang || defaultLang;
    addRule.ext = option.ext || defaultExt;
    addDefault = addRule.lang !== defaultLang || addRule.ext !== defaultExt;
  }
  // TODO: fix array
  if (isArr(option)) {
    return option.map(o => transferWeappRule(o, type)[0]);
  }
  result.push(addRule);
  if (addDefault) {
    result.push({
      ext: defaultExt,
      lang: defaultLang
    });
  }

  return result;
}

exports = module.exports = function extTransform(weappRule) {
  const ruleType = ['script', 'style', 'config', 'template'];

  // weappRule: '.wpy'
  const result = {};

  ruleType.forEach(t => {
    result[t] = transferWeappRule(isStr(weappRule) ? weappRule : weappRule[t], t);
  });

  return result;
};
