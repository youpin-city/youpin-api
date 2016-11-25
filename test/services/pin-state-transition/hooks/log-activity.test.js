// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;
const spy = require('../../../test_helper').spy;

// App stuff
const logActivity = require('../../../../src/services/pin-state-transition/hooks/log-activity');

// Exit test if NODE_ENV is not equal `test`
assertTestEnv();

describe('Log Activity Hook', () => {
  it('calls "create" method of activity log service with correct log info', () => {
    // Mock logInfo to be written to activity log service
    const logInfo = {
      user: 'Aunt You-pin',
      organization: 'YouPin',
      department: 'Development',
      actionType: 'STATE_TRANSITION',
      action: 'STATE_TRANSITION/VERIFY',
      pin_id: 1234,
      changed_fields: ['status'],
      previous_values: ['unverified'],
      updated_values: ['verified'],
      description: 'Aunt You-pin verified pin 1234',
      timestamp: '2016-11-25',
    };
    const createSpy = spy();
    const mockHook = {
      type: 'after',
      app: {
        service: () => ({
          create: createSpy,
        }),
      },
      params: { },
      result: {},
      data: {
        logInfo,
      },
    };
    const serviceSpy = spy(mockHook.app, 'service');

    // The following call must run mockHook.app.service('/activity_log').create(hook.data.logInfo)
    logActivity()(mockHook);

    expect(serviceSpy).to.have.been.calledWith('/activity_logs');
    expect(createSpy).to.have.been.calledWith(logInfo);
  });
});
