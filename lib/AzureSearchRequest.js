const rp = require('request-promise-native');

module.exports = async function azureSearchRequest(searchUrl, method, body) {
  const searchApiVersion = process.env['search-api-version'];
  const searchApiAdminKey = process.env['search-api-admin-key'];
  const headers = {
    'Content-Type': 'application/json',
    'api-key': searchApiAdminKey,
  };
  const url = `${searchUrl}?api-version=${searchApiVersion}`;
  const response = await rp({
    body,
    headers,
    method,
    resolveWithFullResponse: true,
    simple: false,
    url,
  });

  return {
    body: response.body ? JSON.parse(response.body) : null,
    statusCode: response.statusCode,
  };
};

