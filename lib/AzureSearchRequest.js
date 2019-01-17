const rp = require('request-promise-native');

module.exports = async function (searchUrl, method, body) {
  const searchApiVersion = process.env['search-api-version'];
  const searchApiAdminKey = process.env['search-api-admin-key'];
  const headers = {
    'Content-Type': 'application/json',
    'api-key': searchApiAdminKey,
  };
  url = `${searchUrl}?api-version=${searchApiVersion}`;
  const response = await rp({
    body,
    headers,
    method,
    url,
    simple: false,
    resolveWithFullResponse: true,
  });

  return {
    statusCode: response.statusCode,
    body: response.body ? JSON.parse(response.body) : null,
  };
};

