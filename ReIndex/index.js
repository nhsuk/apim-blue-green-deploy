const azureSearchRequest = require('../lib/AzureSearchRequest');

module.exports = async function reindex() {
  const searchHostname = process.env['search-hostname'];
  const indexerName = process.env['search-indexer-name'];
  const indexerUrl = `https://${searchHostname}/indexers/${indexerName}`;
  await azureSearchRequest(`${indexerUrl}/run`, 'post');
  return 'reindexing';
};
