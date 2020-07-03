const expect = require('chai').expect;
import { getLifeCycle } from '../../../weapp/init';
import { WEAPP_APP_LIFECYCLE } from '../../../shared';

describe('weapp life cycles', () => {
  it('should add wepy.app life cycles for string', () => {
    const rel = {
      lifecycle: {
        app: 'onSomeNewFeature'
      }
    };
    const lifeCycles = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');
    expect(lifeCycles).to.deep.equal([
      ...WEAPP_APP_LIFECYCLE,
      'onSomeNewFeature'
    ]);
  });

  it('should add wepy.app life cycles for array', () => {
    const rel = {
      lifecycle: {
        app: ['onSomeNewFeature1', 'onSomeNewFeature2']
      }
    };
    const lifeCycles = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');
    expect(lifeCycles).to.deep.equal([
      ...WEAPP_APP_LIFECYCLE,
      'onSomeNewFeature1',
      'onSomeNewFeature2'
    ]);
  });

  it('should modify wepy.app life cycles for function', () => {
    const rel = {
      lifecycle: {
        app: function (lifecycles) {
          const newLifeCycles = lifecycles.filter(l => l !== 'onError');
          return [...newLifeCycles, 'onSomeNewFeature'];
        }
      }
    };
    const lifeCycles = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');
    expect(lifeCycles).to.deep.equal([
      ...WEAPP_APP_LIFECYCLE.filter(l => l !== 'onError'),
      'onSomeNewFeature'
    ]);
  });
});
