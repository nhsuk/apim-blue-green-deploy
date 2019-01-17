const rp = require('request-promise-native');
const azureSearchUrl = require('./AzureSearchUrl');

module.exports = async function azureSearchRequest(searchUrl, method, body) {
  const searchApiVersion = process.env['search-api-version'];
  const searchApiAdminKey = process.env['search-api-admin-key'];
  const headers = {
    'Content-Type': 'application/json',
    'api-key': searchApiAdminKey,
  };
  const baseUrl = azureSearchUrl(searchUrl);
  const url = `${baseUrl}?api-version=${searchApiVersion}`;
  // console.log(url);
  const response = await rp({
    body,
    headers,
    method,
    resolveWithFullResponse: true,
    simple: false,
    url,
  });
  // console.log(response.body);

  return {
    body: response.body ? JSON.parse(response.body) : null,
    statusCode: response.statusCode,
  };
};

