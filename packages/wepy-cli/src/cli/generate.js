import chalk from 'chalk';
import Metalsmith from 'metalsmith';
import Handlebars from 'handlebars';
import async from 'async';
import ncp from 'ncp';
import { handlebars } from 'consolidate';
import path from 'path';
import multimatch from 'multimatch';
import getOptions from './options';
import ask from './ask';
import filter from './filter';
import * as logger from './logger';

// register handlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
    return a === b
    ? opts.fn(this)
    : opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
    return a === b
    ? opts.inverse(this)
    : opts.fn(this);
});

/**
 * Generate a template given a `src` and `dest`.
 *
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */

export default function generate (name, src, dest, done) {
    const opts = getOptions(name, src);

    // This is a github project, and there is no meta.json or meta.js
    if (opts.status === false) {
        // Directly copy the project to dest.
        ncp.ncp(src, dest, function (err) {
          done(err);
        });
        return {};
    }
    const metalsmith = Metalsmith(path.join(src, 'template'));
    const data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
    });
    opts.helpers && Object.keys(opts.helpers).map(key => {
        Handlebars.registerHelper(key, opts.helpers[key]);
    });

    const helpers = { chalk, logger };

    if (opts.metalsmith && typeof opts.metalsmith.before === 'function') {
        opts.metalsmith.before(metalsmith, opts, helpers);
    }

    metalsmith.use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles(opts.skipInterpolation));

    if (typeof opts.metalsmith === 'function') {
        opts.metalsmith(metalsmith, opts, helpers);
    } else if (opts.metalsmith && typeof opts.metalsmith.after === 'function') {
        opts.metalsmith.after(metalsmith, opts, helpers);
    }

    metalsmith.clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build((err, files) => {
        done(err);
        if (typeof opts.complete === 'function') {
            const helpers = { chalk, logger, files };
            opts.complete(data, helpers);
        } else {
            logMessage(opts.completeMessage, data);
        }
    });

    return data;
}

/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */

function askQuestions (prompts) {
    return (files, metalsmith, done) => {
        ask(prompts, metalsmith.metadata(), done);
    };
}

/**
 * Create a middleware for filtering files.
 *
 * @param {Object} filters
 * @return {Function}
 */

function filterFiles (filters) {
    return (files, metalsmith, done) => {
        filter(files, filters, metalsmith.metadata(), done);
    };
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function renderTemplateFiles (skipInterpolation) {
    skipInterpolation = typeof skipInterpolation === 'string'
    ? [skipInterpolation]
    : skipInterpolation;
    return (files, metalsmith, done) => {
        const keys = Object.keys(files);
        const metalsmithMetadata = metalsmith.metadata();
        async.each(keys, (file, next) => {
      // skipping files with skipInterpolation option
            if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
                return next();
            }
            const str = files[file].contents.toString();
      // do not attempt to render files that do not have mustaches
            if (!/{{([^{}]+)}}/g.test(str)) {
                return next();
            }
            handlebars.render(str, metalsmithMetadata, (err, res) => {
                if (err) {
                    err.message = `[${file}] ${err.message}`;
                    return next(err);
                }
                files[file].contents = new Buffer(res);
                next();
            });
        }, done);
    };
}

/**
 * Display template complete message.
 *
 * @param {String} message
 * @param {Object} data
 */

function logMessage (message, data) {
    if (!message) return;
    handlebars.render(message, data, (err, res) => {
        if (err) {
            console.error('\n   Error when rendering template complete message: ' + err.message.trim());
        } else {
            console.log('\n' + res.split(/\r?\n/g).map(line => '   ' + line).join('\n'));
        }
    });
}
