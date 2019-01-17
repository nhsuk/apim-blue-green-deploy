const azureSearchRequest = require('../lib/AzureSearchRequest');

async function azureIndexesSearchRequest(indexName, method, body) {
  return azureSearchRequest(`indexes/${indexName}`, method, body);
}

async function azureIndexersSearchRequest(indexerName, method, body) {
  return azureSearchRequest(`indexers/${indexerName}`, method, body);
}

async function copyIndexDefinition(sourceIndexName, targetIndexName) {
  const sourceIndexResponse = await azureIndexesSearchRequest(sourceIndexName, 'get');
  if (sourceIndexResponse.statusCode === 200) {
    const sourceIndexDefinition = sourceIndexResponse.body;
    delete sourceIndexDefinition.name;
    await azureIndexesSearchRequest(targetIndexName, 'delete');
    await azureIndexesSearchRequest(targetIndexName, 'put', JSON.stringify(sourceIndexDefinition));
  }
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
  const indexNames = context.bindings.indexNames;
  const indexerName = await getIndexerName(indexNames.active);
  await copyIndexDefinition(indexNames.active, indexNames.idle);
  await updateIndexerTargetIndex(indexerName, indexNames.idle);
  await azureIndexersSearchRequest(`${indexerName}/run`, 'post');

  return indexerName;
};
