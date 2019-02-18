function getIdleIndexDeployment(activeDeployment) {
  switch (activeDeployment) {
    case 'a':
      return 'b';
    case 'b':
      return 'a';
    default:
      throw new Error(`Argument Exception: unexpected activeDeployment value (${activeDeployment})`);
  }
}

function getIndexName(index, deployment) {
  return `${index.name}-${index.version}-${deployment}-${index.environment}`;
}

function parseServiceUrl(activeServiceUrl) {
  const urlRegex = /https:\/\/.*\/indexes\/(.*)\/docs\/$/;
  const indexNameRegex = /(.*)-([0-9]+-[0-9]+)-(a|b)-(dev|int|stag|prod)/;

  const urlMatches = activeServiceUrl.match(urlRegex);
  if (!urlMatches) {
    throw new Error(`Can not identify the index name from the URL ${activeServiceUrl}`);
  }

  const indexName = urlMatches[1];
  const indexNameMatches = indexName.match(indexNameRegex);
  if (!indexNameMatches) {
    throw new Error(`Can not identify the index name components from the name ${indexName}`);
  }

  const indexingDetails = {
    activeDeployment: indexNameMatches[3],
    environment: indexNameMatches[4],
    name: indexNameMatches[1],
    version: indexNameMatches[2],
  };

  indexingDetails.idleDeployment = getIdleIndexDeployment(indexingDetails.activeDeployment);

  return {
    active: getIndexName(indexingDetails, indexingDetails.activeDeployment),
    idle: getIndexName(indexingDetails, indexingDetails.idleDeployment),
  };
}

module.exports = parseServiceUrl;
