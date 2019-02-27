const chai = require('chai');
const moment = require('moment');
const sinon = require('sinon');
const blueGreenDeploymentGeneratorFunction = require('../../BlueGreenDeploymentOrchestrator/generator-function');

const expect = chai.expect;

function iterateGenerator(generator) {
  let result = generator.next();
  while (!result.done) {
    result = generator.next(result.value);
  }
  return result;
}

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
      log: () => { },
    };

    const generator = blueGreenDeploymentGeneratorFunction(context);

    const result = iterateGenerator(generator);
    expect(result.value).to.equal('done');
  });
  it('indexer currently indexing should throw exception', () => {
    const indexNames = { active: 'index-1', idle: 'index-2' };
    const apimIndexName = 'api';
    const input = { apimApiName: apimIndexName };
    const stubCallActivity = sinon.stub();
    stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
    stubCallActivity.withArgs('GetIndexerStatus').returns('inProgress');

    const context = {
      df: {
        callActivity: stubCallActivity,
        getInput: sinon.fake.returns(input),
      },
      log: () => { },
    };

    const generator = blueGreenDeploymentGeneratorFunction(context);

    expect(() => { iterateGenerator(generator); }).to.throw('indexer index-2 is currently running');
  });
  it('indexer failure should throw exception', () => {
    const indexNames = { active: 'index-1', idle: 'index-2' };
    const apimIndexName = 'api';
    const input = { apimApiName: apimIndexName };
    const stubCallActivity = sinon.stub();
    stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
    stubCallActivity.withArgs('GetIndexerStatus').returns('persistentFailure');
    const stubCreateTimer = sinon.stub();

    const context = {
      df: {
        callActivity: stubCallActivity,
        createTimer: stubCreateTimer,
        currentUtcDateTime: moment(),
        getInput: sinon.fake.returns(input),
      },
      log: () => { },
    };

    const generator = blueGreenDeploymentGeneratorFunction(context);

    expect(() => { iterateGenerator(generator); }).to.throw('reindexing of index-2 failed with status persistentFailure');
  });
  it('failure to complete indexing in time should throw exception', () => {
    const indexNames = { active: 'index-1', idle: 'index-2' };
    const apimApiName = 'api';
    const input = { apimApiName };
    const stubCallActivity = sinon.stub();
    stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
    stubCallActivity.withArgs('GetIndexerStatus').onFirstCall().returns('success');
    stubCallActivity.withArgs('GetIndexerStatus').returns('inProgress');
    const stubCreateTimer = sinon.stub();

    const df = {
      callActivity: stubCallActivity,
      createTimer: stubCreateTimer,
      currentUtcDateTime: undefined,
      getInput: sinon.fake.returns(input),
    };

    let momentCount = 0;

    // stub to move time along
    sinon.stub(df, 'currentUtcDateTime').get(() => {
      momentCount += 1;
      return moment().add(60 * momentCount, 's');
    });

    const context = {
      df,
      log: () => { },
    };

    const generator = blueGreenDeploymentGeneratorFunction(context);

    expect(() => { iterateGenerator(generator); }).to.throw('reindexing timed out for index-2');
  });
});
