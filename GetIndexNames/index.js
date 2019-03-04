const azureApimRequest = require('../lib/AzureApimRequest');
const parseServiceUrl = require('../lib/parseServiceUrl');

module.exports = async function getIndexNames(context, apimApiName) {
  context.log({ apimApiName });
  try {
    const response = await azureApimRequest(apimApiName);

    const activeServiceUrl = response.properties.serviceUrl;
    context.log({ activeServiceUrl });

    return parseServiceUrl(activeServiceUrl);
  } catch (e) {
    throw Error(`Could not get index names for API manager index '${apimApiName}' (${e.message})`);
  }
};
