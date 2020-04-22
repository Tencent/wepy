const log = require('npmlog');

const mylog = {};

const datetime = (date = new Date(), format = 'HH:mm:ss') => {
  let fn = d => {
    return ('0' + d).slice(-2);
  };
  if (date && typeof date === 'string') {
    date = new Date(Date.parse(date));
  }
  const formats = {
    YYYY: date.getFullYear(),
    MM: fn(date.getMonth() + 1),
    DD: fn(date.getDate()),
    HH: fn(date.getHours()),
    mm: fn(date.getMinutes()),
    ss: fn(date.getSeconds())
  };
  return format.replace(/([a-z])\1+/gi, function(a) {
    return formats[a] || a;
  });
};

['info', 'silly', 'verbose', 'http', 'timing', 'notice', 'silent', 'warn', 'error'].forEach(v => {
  mylog[v] = (...args) => {
    log.heading = '[' + datetime() + ']';
    if (args.length === 1) {
      args = [''].concat(args);
    }
    if (log.level !== 'trace') {
      args.forEach(
        (arg, i) =>
          typeof arg === 'object' && arg instanceof Error && arg.stack && arg.message && (args[i] = arg.message)
      );
    }
    log.log.apply(log, [v].concat(args));
  };
});

mylog.level = v => (v ? (log.level = v) : log.level);

exports = module.exports = mylog;
