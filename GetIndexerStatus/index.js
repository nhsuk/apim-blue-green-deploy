const azureSearchRequest = require('../lib/AzureSearchRequest');

async function getIndexerStatus() {
  const searchHostname = process.env['search-hostname'];
  const indexerName = process.env['search-indexer-name'];
  const indexerUrl = `https://${searchHostname}/indexers/${indexerName}`;
  return await azureSearchRequest(`${indexerUrl}/status`, 'get');
}

module.exports = async function (context) {
  const response = await getIndexerStatus(context.bindings.indexName);
  return response.body.lastResult.status;
};
