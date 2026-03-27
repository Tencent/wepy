const expect = require('chai').expect;
import { getLifeCycle, patchAppLifecycle, patchLifecycle } from '../../../weapp/init';
import { WEAPP_APP_LIFECYCLE } from '../../../shared';

import MockWxAPI from '../../mock/wxapi';

const mockapi = new MockWxAPI();

const allPages = [];
const pageIndex = -1;

describe('Lifecycle', () => {
  before(() => {
    mockapi.mock();

    global.getCurrentPages = function() {
      return allPages;
    };
  });
  after(() => {
    mockapi.unmock();
  });

  it('should add wepy.app life cycles for string', () => {
    const rel = {
      lifecycle: {
        app: 'onSomeNewFeature'
      }
    };
    const lifeCycles = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');
    expect(lifeCycles).to.deep.equal([...WEAPP_APP_LIFECYCLE, 'onSomeNewFeature']);
  });

  it('should add wepy.app life cycles for array', () => {
    const rel = {
      lifecycle: {
        app: ['onSomeNewFeature1', 'onSomeNewFeature2']
      }
    };
    const lifeCycles = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');
    expect(lifeCycles).to.deep.equal([...WEAPP_APP_LIFECYCLE, 'onSomeNewFeature1', 'onSomeNewFeature2']);
  });

  it('should modify wepy.app life cycles for function', () => {
    const rel = {
      lifecycle: {
        app: function(lifecycles) {
          const newLifeCycles = lifecycles.filter(l => l !== 'onError');
          return [...newLifeCycles, 'onSomeNewFeature'];
        }
      }
    };
    const lifeCycles = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');
    expect(lifeCycles).to.deep.equal([...WEAPP_APP_LIFECYCLE.filter(l => l !== 'onError'), 'onSomeNewFeature']);
  });

  it('patchAppLifecycle', () => {
    const runState = {
      onLaunch1: false,
      onLaunch2: false,
      onShow: false
    };
    const appInstance = {};
    const appConfig = {};
    const options = {
      onShow() {
        runState.onShow = true;
      },
      onLaunch: [
        () => {
          runState.onLaunch1 = true;
        },
        () => {
          runState.onLaunch2 = true;
        }
      ]
    };
    const rel = {};

    patchAppLifecycle(appConfig, options, rel);

    expect(appConfig.onLaunch).is.a('function');
    expect(appConfig.onShow).is.a('function');

    expect(appConfig.onError).is.a('undefined');

    appConfig.onLaunch.call(appInstance);

    appConfig.onShow.call(appInstance);

    for (const k in runState) {
      expect(runState[k]).to.be.equal(true);
    }
  });

  it('patchLifecycle componennt', () => {
    const runState = {
      ready: false
    };
    const compInstance = {};
    const output = { methods: {} };
    const options = {
      ready() {
        runState.ready = true;
      }
    };
    const rel = {};

    patchLifecycle(output, options, rel, true);

    expect(output.created).is.a('function');

    output.created.call(compInstance);

    output.ready.call(compInstance);

    expect(runState.ready).to.equal(true);
  });

  it('patchLifecycle page', () => {
    const runState = {
      routed: false,
      testPageRouted: false
    };
    const indexPage = {
      is: 'somepage',
      route: 'pages/index',
      __wxExparserNodeId__: '29d1dad1',
      __wxWebviewId__: 1
    };
    const output = { methods: {} };
    const options = {
      routed(oldRoute, newRoute) {
        expect(oldRoute).to.equal(null);
        expect(newRoute.path).to.equal(indexPage.route);
        runState.routed = true;
      }
    };
    const rel = {};

    patchLifecycle(output, options, rel, false);

    expect(output.created).is.a('function');
    expect(output.attached).is.a('function');

    output.created.call(indexPage);
    output.attached.call(indexPage);

    allPages.push(indexPage);

    output.methods.onShow.call(indexPage);

    expect(runState.routed).to.equal(true);

    const testPage = {
      is: 'testpage',
      route: 'pages/test',
      __wxExparserNodeId__: '29d2dad2',
      __wxWebviewId__: 2
    };
    const testOutput = { methods: {} };
    const testOutputOptions = {
      routed(oldRoute, newRoute) {
        expect(oldRoute.path).to.equal(indexPage.route);
        expect(newRoute.path).to.equal(testPage.route);
        runState.testPageRouted = true;
      }
    };

    patchLifecycle(testOutput, testOutputOptions, rel, false);

    testOutput.created.call(testPage);
    testOutput.attached.call(testPage);

    allPages.push(testPage);

    testOutput.methods.onShow.call(testPage);

    for (const k in runState) {
      expect(runState[k]).to.be.equal(true);
    }
  });
});
