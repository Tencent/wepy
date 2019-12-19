const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const node = require('enhanced-resolve/lib/node');
const NodeJsInputFileSystem = require('enhanced-resolve/lib/NodeJsInputFileSystem');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

exports = module.exports = class Resolver {
  constructor(options) {
    this._options = options;
    this.inputFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000);
  }

  wrapper(context) {
    let fnBak = context.resolve;

    context.resolve = function(...args) {
      return new Promise((resolve, reject) => {
        args.push(function(err, filepath, meta) {
          if (err) {
            reject(err);
          } else {
            resolve({ path: filepath, meta: meta });
          }
        });
        fnBak.apply(context, args);
      });
    };

    return context;
  }

  create(options = {}) {
    const context = ResolverFactory.createResolver(
      Object.assign(
        {
          fileSystem: this.inputFileSystem
        },
        this._options,
        options
      )
    );

    return this.wrapper(context);
  }

  createSync(options = {}) {
    const context = node.create.sync(
      Object.assign(
        {
          fileSystem: this.inputFileSystem
        },
        this._options,
        options
      )
    );

    return context;
  }
};
