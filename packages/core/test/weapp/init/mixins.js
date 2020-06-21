import { patchMixins } from '../../../weapp/init/mixins';

const expect = require('chai').expect;

describe('weapp mixins strategy', function() {
  it('Merge Strategy', () => {
    const mixinData = { a: 2, b: 3 };
    const optData = { a: 1 };
    const mixins = { data: mixinData };
    let option = { data: optData };

    patchMixins({}, option, mixins);

    expect(option.data).to.deep.equal({ a: 1, b: 3 });
  });

  it('Lifecycle Strategy', () => {
    const optOnLaunch = () => {};
    const mixinOnLaunch = () => {};
    const mixins = { onLaunch: mixinOnLaunch };
    const option = { onLaunch: optOnLaunch };

    patchMixins({}, option, mixins);

    expect(option.onLaunch).to.deep.equal([mixinOnLaunch, optOnLaunch]);
  });
});
