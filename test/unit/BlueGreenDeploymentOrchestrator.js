const chai = require('chai');
const moment = require('moment');
const sinon = require('sinon');
const blueGreenDeploymentGeneratorFunction = require('../../BlueGreenDeploymentOrchestrator/generator-function');

const expect = chai.expect;

describe('BlueGreenDeploymentOrchestrator', () => {
  it('happy path should return \'done\'', () => {
    const indexNames = { active: 'index-1', idle: 'index-2' };
    const apimIndexName = 'api';
    const input = { apimApiName: apimIndexName };
    const stubCallActivity = sinon.stub();
    stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
    stubCallActivity.withArgs('GetIndexerStatus')
      .onFirstCall().returns('success')
      .onSecondCall()
      .returns('inProgress')
      .onThirdCall()
      .returns('success');
    const stubCreateTimer = sinon.stub();

    const context = {
      df: {
        callActivity: stubCallActivity,
        createTimer: stubCreateTimer,
        currentUtcDateTime: moment(),
        getInput: sinon.fake.returns(input),
      },
      log: (e) => { console.log(e); },
    };

    const generator = blueGreenDeploymentGeneratorFunction(context);

    let result = generator.next();
    while (!result.done) {
      result = generator.next(result.value);
    }
    expect(result.value).to.equal('done');
  });
});
