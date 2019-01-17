const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function getIndexerStatus(context) {
  const indexerName = context.bindings.indexerName;
  const response = await azureSearchRequest(`indexers/${indexerName}/status`, 'get');
  return response.body.lastResult.status;
};
