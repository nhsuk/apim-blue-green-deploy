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
  describe('happy path', () => {
    it('should return \'done\'', () => {
      const indexNames = { active: 'index-1', idle: 'index-2' };
      const indexerName = 'index-2';
      const searchApiVersion = '2017-11-11';
      const apimApiName = 'api';
      const input = { apimApiName, searchApiVersion };
      const searchParameters = { indexerName, searchApiVersion };
      const stubCallActivity = sinon.stub();
      stubCallActivity.withArgs('GetIndexNames', apimApiName).returns(indexNames);
      stubCallActivity
        .withArgs('GetIndexerStatus', searchParameters)
        .returns(indexNames);
      stubCallActivity.withArgs('GetIndexerLastRunStatus', searchParameters)
        .onFirstCall().returns('success')
        .onSecondCall()
        .returns('inProgress')
        .onThirdCall()
        .returns('success');
      stubCallActivity
        .withArgs('GetIndexDefinition', { indexName: indexNames.active, searchApiVersion })
        .returns({});
      stubCallActivity
        .withArgs('ReIndex', {
          indexDefinition: {},
          indexName: indexNames.idle,
          indexerName: indexNames.idle,
          searchApiVersion,
        })
        .returns();
      stubCallActivity
        .withArgs('SwitchAliasedIndex', { apimApiName, idleIndexName: indexNames.idle })
        .returns();
      // Makes stub act like a mock to check all CallActivity calls are stubbed with
      // appropriate args
      stubCallActivity.throwsArg(0);

      const context = {
        df: {
          callActivity: stubCallActivity,
          createTimer: sinon.fake(),
          currentUtcDateTime: moment(),
          getInput: sinon.fake.returns(input),
        },
        log: sinon.fake(),
      };

      const generator = blueGreenDeploymentGeneratorFunction(context);

      const result = iterateGenerator(generator);
      expect(result.value).to.equal('done');
    });
  });
  describe('error handling', () => {
    it('missing mandatory \'apimApiName\' parameter', async () => {
      const searchApiVersion = '2017-11-11';
      const context = {
        df: {
          callActivity: sinon.stub(),
          getInput: sinon.stub().returns({ searchApiVersion }),
        },
        log: sinon.fake(),
      };
      const generator = blueGreenDeploymentGeneratorFunction(context);

      await expect(() => { iterateGenerator(generator); }).to.throw('mandatory parameter \'apimApiName\' missing');
    });
    it('invalid \'searchApiVersion\' parameter', async () => {
      const searchApiVersion = 'invalid version';
      const context = {
        df: {
          callActivity: sinon.stub(),
          getInput: sinon.stub().returns({
            apimApiName: 'index-1',
            searchApiVersion,
          }),
        },
        log: sinon.fake(),
      };
      const generator = blueGreenDeploymentGeneratorFunction(context);

      await expect(() => { iterateGenerator(generator); }).to.throw('The API version \'invalid version\' can not be handled.');
    });

    it('indexer currently indexing should throw exception', () => {
      const indexNames = { active: 'index-1', idle: 'index-2' };
      const apimIndexName = 'api';
      const input = { apimApiName: apimIndexName };
      const stubCallActivity = sinon.stub();
      stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
      stubCallActivity.withArgs('GetIndexerLastRunStatus').returns('inProgress');

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
    it('indexer in error should throw exception', () => {
      const indexNames = { active: 'index-1', idle: 'index-2' };
      const apimIndexName = 'api';
      const input = { apimApiName: apimIndexName };
      const stubCallActivity = sinon.stub();
      stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
      stubCallActivity.withArgs('GetIndexerStatus').returns('error');
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

      expect(() => { iterateGenerator(generator); }).to.throw(`indexer ${indexNames.idle} returned an error status`);
    });
    it('indexer failure should throw exception', () => {
      const indexNames = { active: 'index-1', idle: 'index-2' };
      const apimIndexName = 'api';
      const input = { apimApiName: apimIndexName };
      const stubCallActivity = sinon.stub();
      stubCallActivity.withArgs('GetIndexNames').returns(indexNames);
      stubCallActivity.withArgs('GetIndexerLastRunStatus').returns('persistentFailure');
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
  });
});
