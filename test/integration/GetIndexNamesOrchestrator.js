const moment = require('moment');
const chai = require('chai');
const getIndexNamesOrchestrator = require('../../GetIndexNamesOrchestrator');
const classes = require('../../node_modules/durable-functions/lib/src/classes.js');

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
    new classes.OrchestratorStartedEvent({
      eventId: -1,
      isPlayed: false,
      timestamp: firstTimestamp,
    }),
    new classes.ExecutionStartedEvent({
      eventId: -1,
      input: JSON.stringify(input),
      isPlayed: false,
      name,
      timestamp: moment(firstTimestamp).add(5, 'ms').toDate(),
    }),
  ];
};

describe('GetIndexNamesOrchestrator', () => {
  it('it should call correct activity', () => {
    const orchestrator = getIndexNamesOrchestrator;
    const mockContext = new MockContextClass({
      context: new classes.DurableOrchestrationBindingInfo(
        GetOrchestratorStart('GetIndexNames', moment.utc().toDate())
      ),
    });
    orchestrator(mockContext);
    expect(mockContext.doneValue).to.be.deep.equal(new classes.OrchestratorState({
      actions: [
        [new classes.CallActivityAction('GetIndexNames')],
      ],
      isDone: false,
    }));
  });
});
