const azureApimRequest = require('../lib/AzureApimRequest');

async function getIndexingDetails() {
  function getIndexName(index, deployment) {
    return `${index.name}-${index.version}-${deployment}-${index.environment}`;
  }

  function getIndexUrl(index, deployment) {
    const indexName = getIndexName(index, deployment);
    return `${index.baseUrl}${indexName}${index.trailingPath}`;
  }

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

  const response = await azureApimRequest();

  const activeServiceUrl = response.properties.serviceUrl;

  const urlRegex = /(https:\/\/.*\/indexes\/)(.*)(\/docs\/)/;
  const indexNameRegex = /(.*)-([0-9]+-[0-9]+)-(a|b)-(dev|int|prod)/;

  const indexName = activeServiceUrl.match(urlRegex)[2];

  const indexingDetails = {
    activeDeployment: indexName.match(indexNameRegex)[3],
    baseUrl: activeServiceUrl.match(urlRegex)[1],
    environment: indexName.match(indexNameRegex)[4],
    name: indexName.match(indexNameRegex)[1],
    trailingPath: activeServiceUrl.match(urlRegex)[3],
    version: indexName.match(indexNameRegex)[2],
  };

  indexingDetails.idleDeployment = getIdleIndexDeployment(indexingDetails.activeDeployment);

  return {
    active: {
      name: getIndexName(indexingDetails, indexingDetails.activeDeployment),
      url: getIndexUrl(indexingDetails, indexingDetails.activeDeployment),
    },
    idle: {
      name: getIndexName(indexingDetails, indexingDetails.idleDeployment),
      url: getIndexUrl(indexingDetails, indexingDetails.idleDeployment),
    },
  };
}

module.exports = getIndexingDetails;
