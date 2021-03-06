const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');
const reindex = require('../../ReIndex/index');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('ReIndex', () => {
  const indexName = 'index-1';
  const indexerName = 'indexer-1';
  const searchApiVersion = '2017-11-11';
  const indexDefinition = { anotherField: 'value', name: indexName };
  const context = {
    bindings: {
      parameters: {
        indexDefinition,
        indexName,
        indexerName,
        searchApiVersion,
      },
    },
  };

  beforeEach('set up environment', () => {
    process.env = {
      'search-api-admin-key': 'key',
      'search-hostname': 'hostname',
    };
  });
  afterEach('clean nock', () => {
    nock.cleanAll();
  });
  describe('ReIndex', async () => {
    it('should run a reindex', async () => {
      nock('https://hostname/')
        .delete(new RegExp(`indexes/${indexName}`))
        .times(1)
        .query({ 'api-version': searchApiVersion })
        .reply(200);
      nock('https://hostname/')
        .put(new RegExp(`indexes/${indexName}`), indexDefinition)
        .times(1)
        .query({ 'api-version': searchApiVersion })
        .reply(200);
      nock('https://hostname/')
        .post(new RegExp(`indexers/${indexerName}/reset`))
        .times(1)
        .query({ 'api-version': searchApiVersion })
        .reply(200);
      nock('https://hostname/')
        .post(new RegExp(`indexers/${indexerName}/run`))
        .times(1)
        .query({ 'api-version': searchApiVersion })
        .reply(200);
      const response = await reindex(context);
      expect(response).to.not.be.null;
    });
  });
  describe('error handling', async () => {
    it('should handle HTTP error statuses', async () => {
      nock('https://hostname/')
        .delete(/indexes/)
        .times(1)
        .query({ 'api-version': searchApiVersion })
        .reply(500, 'Internal server error');

      await expect(reindex(context))
        .to.be.rejectedWith(Error, `Could not run indexer '${indexerName}' (500 - "Internal server error")`);
    });
  });
});
