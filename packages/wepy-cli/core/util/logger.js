const log = require('npmlog');

const mylog = {};

const datetime = (date = new Date(), format = 'HH:mm:ss') => {
  let fn = (d) => {
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
  return format.replace(/([a-z])\1+/ig, function (a) {
    return formats[a] || a;
  });
};

['info', 'silly', 'verbose', 'http', 'warn', 'error'].forEach(v => {
  mylog[v] = (...args) => {
    log.heading = '[' + datetime() + ']';
    if (args.length === 1) {
      args = [''].concat(args);
    }
    log.log.apply(log, [v].concat(args));
  };
});

mylog.level = (v) => {
  log.level = v;
};

exports = module.exports = mylog;

