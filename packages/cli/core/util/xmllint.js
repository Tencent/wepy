 const HTMLHint  = require("htmlhint").HTMLHint;

 const DEFAULT_RULES = {
  // Component can be uppercase
  "tagname-lowercase": false,
  "attr-lowercase": false,
  "attr-value-double-quotes": true,
  "attr-value-not-empty": false,
  "attr-no-duplication": true,
  // no need doctype
  "doctype-first": false,
  "tag-pair": true,
  "tag-self-close": false,
  "spec-char-escape": false,
  "id-unique": true,
  "src-not-empty": true,
  // do not need title
  "title-require": false,
  // do not need alt
  "alt-require": false,
  "doctype-html5": false,
  "id-class-value": false,
  "style-disabled": false,
  "inline-style-disabled": false,
  "inline-script-disabled": true,
  "space-tab-mixed-disabled": "space",
  "id-class-ad-disabled": false,
  "href-abs-or-rel": false,
  "attr-unsafe-chars": true,
  "head-script-disabled": true
};


exports = module.exports = {
  verify (html, rules) {
    if (!rules) {
      rules = DEFAULT_RULES;
    } else {
      rules = Object.assign({}, DEFAULT_RULES, rules);
    }
    return HTMLHint.verify(html, rules);
  }
};
