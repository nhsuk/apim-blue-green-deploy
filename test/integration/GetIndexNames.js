const chai = require('chai');
const nock = require('nock');
const errors = require('request-promise-native/errors');
const chaiAsPromised = require('chai-as-promised');
const localSettings = require('../../local.settings.json');
const getIndexNames = require('../../GetIndexNames/index');

const expect = chai.expect;
chai.use(chaiAsPromised);

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
  it('it should handle 404\'s', async () => {
    process.env = localSettings.Values;
    nock(`https://${process.env['apim-host-name']}`)
      .get(/subscriptions/)
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(404, 'Not Found');

    const context = {
      log: () => { },
    };
    await expect(getIndexNames(context, 'service-search-organisations'))
      .to.be.rejectedWith(errors.StatusCodeError, '404 - "Not Found"');
  });
});
