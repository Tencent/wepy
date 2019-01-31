const execa = require('execa');

// check if the work tree is clean
module.exports = function isWorkTreeClean () {

  return execa('git', ['status', '-s']).then(rst => {
    let output = rst.stderr || rst.stdout;
    if (rst.stderr) {
      throw new Error(rst.stderr);
    } else if (rst.stdout) {
      throw new Error('Work tree is not clean, check "git status"');
    }
    return true;
  });
}
