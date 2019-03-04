const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');
const switchAliasedIndex = require('../../SwitchAliasedIndex/index');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('GetIndexDefinition', () => {
  const apimApiName = 'apim-api-1';
  const activeIndexName = 'index-1';
  const idleIndexName = 'index-2';
  const context = {
    bindings: {
      parameters: {
        apimApiName,
        idleIndexName,
      },
    },
    log: () => {},
  };
  let regex;

  beforeEach('set up environment', () => {
    process.env = {
      'apim-api-key': 'key',
      'apim-api-version': '2019-01-01',
      'apim-host-name': 'hostname',
      'apim-resource-group': 'resource-group-1',
      'apim-subscription': 'subscription-1',
      'search-hostname': 'hostname',
    };
    regex = new RegExp(`subscriptions/${process.env['apim-subscription']}/resourceGroups/${process.env['apim-resource-group']}/.*/apis/${apimApiName}`);
  });

  afterEach('clean nock', () => {
    nock.cleanAll();
  });

  it('it should switch the service URL for the API Manager API ', async () => {
    nock('https://hostname/')
      .get(regex)
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(200, { properties: { serviceUrl: `https://hostname/indexes/${activeIndexName}/docs/` } });

    const scope = nock('https://hostname/')
      .put(regex, { properties: { serviceUrl: `https://hostname/indexes/${idleIndexName}/docs/` } })
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(200, {});

    const response = await switchAliasedIndex(context);
    expect(response).to.not.be.null;
    scope.done();
  });
  it('should handle HTTP errors when retrieving the API definition', async () => {
    nock('https://hostname/')
      .get(regex)
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(404, 'Not Found');

    await expect(switchAliasedIndex(context))
      .to.be.rejectedWith(Error, `Could not get API Manager API definition for '${apimApiName}' (404 - "Not Found")`);
  });
  it('should handle HTTP errors when putting the updated API definition', async () => {
    nock('https://hostname/')
      .get(regex)
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(200, { properties: { serviceUrl: `https://hostname/indexes/${activeIndexName}/docs/` } });

    nock('https://hostname/')
      .put(regex)
      .times(1)
      .query({ 'api-version': '2019-01-01' })
      .reply(500, 'Internal Server Error');

    await expect(switchAliasedIndex(context))
      .to.be.rejectedWith(Error, `Could not update the API Manager API definition for '${apimApiName}' (500 - "Internal Server Error")`);
  });
});
