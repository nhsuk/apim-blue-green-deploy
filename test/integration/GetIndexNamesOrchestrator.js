const chai = require('chai');
const moment = require('moment');
const classes = require('../../node_modules/durable-functions/lib/src/classes.js');

const DurableOrchestrationBindingInfo = classes.DurableOrchestrationBindingInfo;
const OrchestratorStartedEvent = classes.OrchestratorStartedEvent;
const ExecutionStartedEvent = classes.ExecutionStartedEvent;
const OrchestratorState = classes.OrchestratorState;
const CallActivityAction = classes.CallActivityAction;

const getIndexNamesOrchestrator = require('../../GetIndexNamesOrchestrator/index');

const expect = chai.expect;

const MockContextClass = (function f() {
  function MockContext(bindings, df, doneValue) {
    this.bindings = bindings;
    this.df = df;
    this.doneValue = doneValue;
  }
  MockContext.prototype.log = () => {};
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

describe('GetIndexNamesOrchestrator', () => {
  it('it should start GetIndexNames activity with correct parameter', async () => {
    const input = { apimApiName: 'api' };
    const binding = {
      context: new DurableOrchestrationBindingInfo(
        GetOrchestratorStart('GetIndexNamesOrchestrator', moment.utc().toDate(), input),
        input
      ),
    };

    const mockContext = new MockContextClass(binding);

    getIndexNamesOrchestrator(mockContext);

    expect(mockContext.doneValue).to.be.deep.equal(new OrchestratorState({
      actions: [
        [new CallActivityAction('GetIndexNames', 'api')],
      ],
      isDone: false,
    }));
  });
});
