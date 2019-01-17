const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function getIndexerStatus(context) {
  const indexerUrl = context.bindings.indexerUrl;
  const response = await azureSearchRequest(`${indexerUrl}/status`, 'get');
  return response.body.lastResult.status;
};
