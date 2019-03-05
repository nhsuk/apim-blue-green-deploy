const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');
const getIndexNames = require('../../GetIndexNames/index');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('GetIndexNames', () => {
  const apimIndexName = 'service-search-organisations';
  const apimApiVersionId = '2019-01-01';
  beforeEach('set up environment', () => {
    process.env = {
      'apim-api-key': 'key',
      'apim-api-version': apimApiVersionId,
      'apim-host-name': 'hostname',
    };
  });

  afterEach('clean nock', () => {
    nock.cleanAll();
  });

  it('it should return names', async () => {
    nock('https://hostname/')
      .get(/subscriptions/)
      .times(1)
      .query({ 'api-version': apimApiVersionId })
      .reply(200, { properties: { serviceUrl: 'https://hostname/indexes/organisationlookup-2-0-b-dev/docs/' } });

    const context = {
      log: () => { },
    };
    const response = await getIndexNames(context, apimIndexName);
    expect(response).to.not.be.null;
    expect(response.idle).to.equal('organisationlookup-2-0-a-dev');
    expect(response.active).to.equal('organisationlookup-2-0-b-dev');
  });
  it('it should handle 404\'s', async () => {
    nock('https://hostname/')
      .get(/subscriptions/)
      .times(1)
      .query({ 'api-version': apimApiVersionId })
      .reply(404, 'Not Found');

    const context = {
      log: () => { },
    };
    await expect(getIndexNames(context, apimIndexName))
      .to.be.rejectedWith(Error, `Could not get index names for API manager index '${apimIndexName}' (404 - "Not Found")`);
  });
});
