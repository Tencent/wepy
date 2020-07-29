const path = require('path');
const { exec } = require('child_process');
const expect = require('chai').expect;

describe('plugin-define integration', function() {
  it('should be full build', function(done) {
    this.timeout(10000);

    let wepyPath = path.resolve(process.cwd(), '../cli/bin/wepy.js');

    exec(`cd test/fixtures && node ${wepyPath} build`, function(error) {
      if (error) {
        throw error;
      }

      expect(require('./fixtures/weapp/app.js')).to.deep.equal(require('./fixtures/expected/app.js'));
      done();
    });
  });
});
