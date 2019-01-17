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

async function getIndexerName(indexName) {
  const indexersResponse = await azureIndexersSearchRequest('', 'get');
  const indexers = indexersResponse.body.value.filter(i => i.targetIndexName === indexName);
  if (indexers.length !== 1) {
    throw Error(`Expected to find exactly one indexer for index ${indexName} (found ${indexers.length})`);
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
