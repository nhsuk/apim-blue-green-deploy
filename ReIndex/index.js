const azureSearchRequest = require('../lib/AzureSearchRequest');

async function reindex(idleIndexName) {
  const searchHostname = process.env['search-hostname'];
  const indexerName = process.env['search-indexer-name'];
  const indexerUrl = `https://${searchHostname}/indexers/${indexerName}`;
  const runResponse = await azureSearchRequest(`${indexerUrl}/run`, 'post');
  return 'reindexing';
}

module.exports = async function (context) {
  const result = await reindex(context.bindings.indexName);
  return result;
};
