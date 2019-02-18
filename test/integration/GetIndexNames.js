const chai = require('chai');
const nock = require('nock');
const localSettings = require('../../local.settings.json');
const getIndexNames = require('../../GetIndexNames/index');

const expect = chai.expect;

describe('GetIndexNames', () => {
  afterEach('clean nock', () => {
    nock.cleanAll();
  });

  it('it should return names', async () => {
    process.env = localSettings.Values;
    nock(`https://${process.env['apim-host-name']}`)
      .get(/subscriptions/)
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(200, { properties: { serviceUrl: 'https://hostname/indexes/organisationlookup-2-0-b-dev/docs/' } });

    const context = {
      log: () => { },
    };
    const response = await getIndexNames(context, 'service-search-organisations');
    expect(response).to.not.be.null;
    expect(response.idle).to.equal('organisationlookup-2-0-a-dev');
    expect(response.active).to.equal('organisationlookup-2-0-b-dev');
  });
});
