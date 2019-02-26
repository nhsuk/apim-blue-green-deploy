const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');
const getIndexDefinition = require('../../GetIndexDefinition/index');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('GetIndexDefinition', () => {
  const indexName = 'index-1';
  const context = { bindings: { indexName } };

  beforeEach('set up environment', () => {
    process.env = {
      'search-api-admin-key': 'key',
      'search-api-version': '2017-11-11',
      'search-hostname': 'hostname',
    };
  });
  afterEach('clean nock', () => {
    nock.cleanAll();
  });
  describe('index definition get', async () => {
    const indexDefinition = { anotherField: 'value', name: indexName };
    it('should return index definition', async () => {
      nock('https://hostname/')
        .get(/indexes/)
        .times(1)
        .query({ 'api-version': '2017-11-11' })
        .reply(200, indexDefinition);
      const response = await getIndexDefinition(context);
      expect(response).to.not.be.null;
    });
    it('should remove index name from index definition', async () => {
      nock('https://hostname/')
        .get(/indexes/)
        .times(1)
        .query({ 'api-version': '2017-11-11' })
        .reply(200, indexDefinition);
      const response = await getIndexDefinition(context);
      expect(response).to.deep.equal({ anotherField: 'value' });
    });
  });
  describe('error handling', async () => {
    it('should handle HTTP error statuses', async () => {
      nock('https://hostname/')
        .get(/indexes/)
        .times(1)
        .query({ 'api-version': '2017-11-11' })
        .reply(404, 'Not Found');

      await expect(getIndexDefinition(context))
        .to.be.rejectedWith(Error, `Could not get index definition for index '${indexName}' (404 - "Not Found")`);
    });
  });
});
