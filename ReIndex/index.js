const azureSearchRequest = require('../lib/AzureSearchRequest');

async function copyIndexDefinition(sourceIndexUrl, targetIndexUrl) {
  const sourceIndexResponse = await azureSearchRequest(sourceIndexUrl, 'get');
  if (sourceIndexResponse.statusCode === 200) {
    const sourceIndexDefinition = sourceIndexResponse.body;
    delete sourceIndexDefinition.name;
    await azureSearchRequest(targetIndexUrl, 'delete');
    await azureSearchRequest(targetIndexUrl, 'put', JSON.stringify(sourceIndexDefinition));
  }
  return 'created';
}

async function updateIndexerTargetIndex(idleIndexName) {
  const searchHostname = process.env['search-hostname'];
  const indexerName = process.env['search-indexer-name'];
  const indexerUrl = `https://${searchHostname}/indexers/${indexerName}`;
  const indexerResponse = await azureSearchRequest(indexerUrl, 'get');
  if (indexerResponse.statusCode === 200) {
    const indexerDefinition = indexerResponse.body;
    indexerDefinition.targetIndexName = idleIndexName;
    delete indexerDefinition.name;
    await azureSearchRequest(indexerUrl, 'put', JSON.stringify(indexerDefinition));
  }
}

async function getIndexerUrl() {
  const searchHostname = process.env['search-hostname'];
  const indexerName = process.env['search-indexer-name'];
  return `https://${searchHostname}/indexers/${indexerName}`;
}

module.exports = async function reindex(context) {
  const indexingDetails = context.bindings.indexingDetails;
  const indexerUrl = await getIndexerUrl();
  await copyIndexDefinition(indexingDetails.active.url, indexingDetails.idle.url);
  await updateIndexerTargetIndex(indexingDetails.idle.name);
  await azureSearchRequest(`${indexerUrl}/run`, 'post');

  return indexerUrl;
};
