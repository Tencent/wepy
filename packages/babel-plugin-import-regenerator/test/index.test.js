const { transformFileSync, transform } = require('@babel/core');
const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const plugin = require('../index');
const expect = require('chai').expect;

describe('babel-plugin-import-regenerator', () => {
  let fixturesDir = join(__dirname, 'fixtures');
  let fixtures = readdirSync(fixturesDir);

  fixtures.forEach(caseName => {
    const actualFile = join(fixturesDir, caseName, 'actual.js');
    const expectedFile = join(fixturesDir, caseName, 'expected.js');

    it(`should work with ${caseName.split('-').join(' ')}`, () => {

      actual = transform(readFileSync(actualFile), {
        presets: [
          'env'
        ],
        plugins: [plugin]
      }).code;

      const expected = readFileSync(expectedFile, 'utf-8');
      expect(actual.trim()).to.equal(expected.trim());
    });
  });
});
