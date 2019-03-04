const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');
const getIndexerStatus = require('../../GetIndexerLastRunStatus/index');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('GetIndexerLastRunStatus', () => {
  const indexerName = 'indexer-1';
  const context = { bindings: { indexerName } };
  afterEach('clean nock', () => {
    nock.cleanAll();
  });
  beforeEach('set up environment', () => {
    process.env = {
      'search-api-admin-key': 'key',
      'search-api-version': '2017-11-11',
      'search-hostname': 'hostname',
    };
  });

  it('should return last run indexer status', async () => {
    nock('https://hostname/')
      .get(/indexers/)
      .times(1)
      .query({ 'api-version': '2017-11-11' })
      .reply(200, {
        lastResult: { status: 'aStatus' },
        status: 'running',
      });

    const response = await getIndexerStatus(context);
    expect(response).to.not.be.null;
    expect(response).to.equal('aStatus');
  });
  it('should handle HTTP error statuses', async () => {
    nock('https://hostname/')
      .get(/indexers/)
      .times(1)
      .query({ 'api-version': '2017-11-11' })
      .reply(404, 'Not Found');

    await expect(getIndexerStatus(context))
      .to.be.rejectedWith(Error, `Could not get last run status for indexer '${indexerName}' (404 - "Not Found")`);
  });
});
