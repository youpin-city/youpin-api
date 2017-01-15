// Test helper functions
const assertTestEnv = require('../../../test_helper').assertTestEnv;
const expect = require('../../../test_helper').expect;
const spy = require('../../../test_helper').spy;

// App stuff
const logActivity = require('../../../../src/utils/hooks/log-activity');

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
      action: 'STATE_TRANSITION/ASSIGNED',
      pin_id: 1234,
      changed_fields: ['status', 'assigned_department'],
      previous_values: ['pending', null],
      updated_values: ['assigned', '57933111556362511181bbb1'],
      description: 'Aunt You-pin assigned pin 1234 to department 57933111556362511181bbb1',
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
