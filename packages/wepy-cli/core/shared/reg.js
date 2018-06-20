// use for template attr
exports.forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
exports.forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
exports.stripParensRE = /^\(|\)$/g;
exports.variableRE = /^\s*[a-zA-Z\$_][a-zA-Z\d_]*\s*$/;
exports.onRE = /^@|^v-on:/;
exports.modelRE = /^v-model/;
exports.modifierRE = /\.[^.]+/g;