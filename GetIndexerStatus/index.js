const azureSearchRequest = require('../lib/AzureSearchRequest');

async function getIndexerFullStatus() {
  const searchHostname = process.env['search-hostname'];
  const indexerName = process.env['search-indexer-name'];
  const indexerUrl = `https://${searchHostname}/indexers/${indexerName}`;
  return azureSearchRequest(`${indexerUrl}/status`, 'get');
}

module.exports = async function getIndexerStatus(context) {
  const response = await getIndexerFullStatus(context.bindings.indexName);
  return response.body.lastResult.status;
};
