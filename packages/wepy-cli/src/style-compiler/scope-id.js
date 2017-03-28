// copy https://github.com/vuejs/vue-loader/blob/master/lib/style-compiler/plugins/scope-id.js and fix by wepy

import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export default postcss.plugin('add-id', function (id) {
    return function (root) {
        root.each(function rewriteSelector (node) {
            if (!node.selector) {
                // handle media queries
                if (node.type === 'atrule' && node.name === 'media') {
                    node.each(rewriteSelector);
                }
                return;
            }
            node.selector = selectorParser(function (selectors) {
                selectors.each(function (selector) {
                    var node = null;
                    selector.each(function (n) {
                        if (n.type !== 'pseudo') node = n;
                    });
                    selector.insertAfter(node, selectorParser.className({
                        value: id
                    }));
                });
            }).process(node.selector).result;
        });
    };
});