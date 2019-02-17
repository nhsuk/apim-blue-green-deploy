const moment = require('moment');
const chai = require('chai');
const blueGreenDeploymentOrchestrator = require('../../BlueGreenDeploymentOrchestrator');
const classes = require('../../node_modules/durable-functions/lib/src/classes.js');

const expect = chai.expect;

const OrchestratorStartedEvent = classes.OrchestratorStartedEvent;
const ExecutionStartedEvent = classes.ExecutionStartedEvent;
const DurableOrchestrationBindingInfo = classes.DurableOrchestrationBindingInfo;
const OrchestratorState = classes.OrchestratorState;
const CallActivityAction = classes.CallActivityAction;

const MockContextClass = (function f() {
  function MockContext(bindings, df, doneValue) {
    this.bindings = bindings;
    this.df = df;
    this.doneValue = doneValue;
  }
  MockContext.prototype.log = () => { };
  MockContext.prototype.done = function done(err, result) {
    if (err) {
      throw new Error(err);
    } else {
      this.doneValue = result;
    }
  };
  return MockContext;
}());

const GetOrchestratorStart = function GetOrchestratorStart(name, firstTimestamp, input) {
  return [
    new OrchestratorStartedEvent({
      eventId: -1,
      isPlayed: false,
      timestamp: firstTimestamp,
    }),
    new ExecutionStartedEvent({
      eventId: -1,
      input: JSON.stringify(input),
      isPlayed: false,
      name,
      timestamp: moment(firstTimestamp).add(5, 'ms').toDate(),
    }),
  ];
};

describe('BlueGreenDeploymentOrchestrator', () => {
  it('it should start GetIndexNames activity with correct parameter', () => {
    const input = { apimApiName: 'api' };
    const binding = {
      context: new DurableOrchestrationBindingInfo(
        GetOrchestratorStart('BlueGreenDeploymentOrchestrator', moment.utc().toDate()),
        input
      ),
    };
    const mockContext = new MockContextClass(binding);
    blueGreenDeploymentOrchestrator(mockContext);
    expect(mockContext.doneValue).to.be.deep.equal(new OrchestratorState({
      actions: [
        [new CallActivityAction('GetIndexNames', 'api')],
      ],
      isDone: false,
    }));
  });
});
