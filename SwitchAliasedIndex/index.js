const azureApimRequest = require('../lib/AzureApimRequest');
const azureSearchUrl = require('../lib/AzureSearchUrl');

async function getApimApiDefinition(apimApiName) {
  try {
    return await azureApimRequest(apimApiName);
  } catch (e) {
    throw Error(`Could not get API Manager API definition for '${apimApiName}' (${e.message})`);
  }
}

async function postApimApiDefinition(apimApiName, apiDefinition) {
  try {
    await azureApimRequest(apimApiName, 'put', JSON.stringify(apiDefinition));
  } catch (e) {
    throw Error(`Could not update the API Manager API definition for '${apimApiName}' (${e.message})`);
  }
}

module.exports = async function switchAliasedIndex(context) {
  const apimApiName = context.bindings.parameters.apimApiName;
  const idleIndexName = context.bindings.parameters.idleIndexName;
  const apiDefinition = await getApimApiDefinition(apimApiName);
  const serviceUrl = azureSearchUrl(`indexes/${idleIndexName}/docs/`);
  apiDefinition.properties.serviceUrl = serviceUrl;
  await postApimApiDefinition(apimApiName, apiDefinition);
};
