const azureSearchRequest = require('../lib/AzureSearchRequest');

async function azureIndexesSearchRequest(indexName, method, body) {
  return azureSearchRequest(`indexes/${indexName}`, method, body);
}

async function azureIndexersSearchRequest(indexerName, method, body) {
  return azureSearchRequest(`indexers/${indexerName}`, method, body);
}

async function recreateIndex(indexName, indexDefinition) {
  await azureIndexesSearchRequest(indexName, 'delete');
  await azureIndexesSearchRequest(indexName, 'put', JSON.stringify(indexDefinition));
  return 'created';
}

async function updateIndexerTargetIndex(indexerName, idleIndexName) {
  const indexerResponse = await azureIndexersSearchRequest(indexerName, 'get');
  if (indexerResponse.statusCode === 200) {
    const indexerDefinition = indexerResponse.body;
    indexerDefinition.targetIndexName = idleIndexName;
    delete indexerDefinition.name;
    await azureIndexersSearchRequest(indexerName, 'put', JSON.stringify(indexerDefinition));
  }
  return 'indexer updated';
}

async function getIndexerName(indexNames) {
  // Note: we check against both the active and idle index names in case a previous run failed
  // and left the indexer pointing at the idle index
  const indexersResponse = await azureIndexersSearchRequest('', 'get');
  const indexers = indexersResponse.body.value
    .filter(i => [indexNames.active, indexNames.idle].includes(i.name));
  if (indexers.length !== 1) {
    const errMsg = `Expected to find exactly one indexer for the indexes ${indexNames} (found ${indexers.length})`;
    throw Error(errMsg);
  }
  return indexers[0].name;
}

module.exports = async function reindex(context) {
  const indexNames = context.bindings.parameters.indexNames;
  const indexDefinition = context.bindings.parameters.indexDefinition;
  const indexerName = await getIndexerName(indexNames);
  await recreateIndex(indexNames.idle, indexDefinition);
  await updateIndexerTargetIndex(indexerName, indexNames.idle);
  await azureIndexersSearchRequest(`${indexerName}/run`, 'post');

  return indexerName;
};
