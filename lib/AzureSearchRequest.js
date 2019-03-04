const rp = require('request-promise-native');
const azureSearchUrl = require('./AzureSearchUrl');

module.exports = async function azureSearchRequest(searchUrl, method = 'get', body = '{}', searchApiVersion = process.env['search-api-version']) {
  const searchApiAdminKey = process.env['search-api-admin-key'];
  const headers = {
    'Content-Type': 'application/json',
    'api-key': searchApiAdminKey,
  };
  const baseUrl = azureSearchUrl(searchUrl);
  const url = `${baseUrl}?api-version=${searchApiVersion}`;
  const response = await rp({
    body,
    headers,
    method,
    resolveWithFullResponse: true,
    url,
  });

  return {
    body: response.body ? JSON.parse(response.body) : null,
    statusCode: response.statusCode,
  };
};
