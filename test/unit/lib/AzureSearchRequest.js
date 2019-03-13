const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');
const azureSearchRequest = require('../../../lib/AzureSearchRequest.js');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('AzureSearchRequest', () => {
  afterEach('clean nock', () => {
    nock.cleanAll();
  });
  beforeEach('set up environment', () => {
    process.env = {
      'search-api-admin-key': 'key',
      'search-hostname': 'hostname',
    };
  });

  it('should make correctly set up HTTP request with parameters', async () => {
    const searchApiVersion = '2017-11-11';
    const expectedHeaders = {
      reqheaders: {
        'Content-Type': 'application/json',
        'api-key': 'key',
      },
    };
    const requestBody = { prop1: 'value1' };
    const responseBody = { response: 'ok' };
    nock('https://hostname/', expectedHeaders)
      .get(/path/, {})
      .times(1)
      .query({ 'api-version': searchApiVersion })
      .reply(200, responseBody);
    const response = await azureSearchRequest('path', searchApiVersion, {
      method: 'get',
      requestBody,
    });
    expect(response).to.not.be.null;
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.deep.equal(responseBody);
  });
  it('should make correctly set up HTTP request with defaults', async () => {
    const searchApiVersion = '2017-11-11';
    const expectedHeaders = {
      reqheaders: {
        'Content-Type': 'application/json',
        'api-key': 'key',
      },
    };
    nock('https://hostname/', expectedHeaders)
      .get(/path/, {})
      .times(1)
      .query({ 'api-version': searchApiVersion })
      .reply(200);

    const response = await azureSearchRequest('https://hostname/path', searchApiVersion);
    expect(response).to.not.be.null;
    expect(response.statusCode).to.equal(200);
  });
  it('should throw an exception if searchApiversion parameter is missing', async () => {
    const searchApiVersion = '2017-11-11';
    const expectedHeaders = {
      reqheaders: {
        'Content-Type': 'application/json',
        'api-key': 'key',
      },
    };
    nock('https://hostname/', expectedHeaders)
      .get(/path/, {})
      .times(1)
      .query({ 'api-version': searchApiVersion })
      .reply(200);

    await expect(azureSearchRequest('https://hostname/path'))
      .to.be.rejectedWith(Error, 'searchApiVersion parameter is missing');
  });
});
