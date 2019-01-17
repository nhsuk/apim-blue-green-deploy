const azureApimRequest = require('../lib/AzureApimRequest');
const azureSearchUrl = require('../lib/AzureSearchUrl');

module.exports = async function switchAliasedIndex(context) {
  const apimApiName = context.bindings.parameters.apimApiName;
  const idleIndexName = context.bindings.parameters.idleIndexName;
  const apiDefinition = await azureApimRequest(apimApiName);
  const serviceUrl = azureSearchUrl(`indexes/${idleIndexName}/docs/`);
  context.log({ serviceUrl });
  apiDefinition.properties.serviceUrl = serviceUrl;
  const response = await azureApimRequest(apimApiName, 'put', JSON.stringify(apiDefinition));
  context.log({ response });
  return 'switched';
};
