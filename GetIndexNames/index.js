const azureApimRequest = require('../lib/AzureApimRequest');
const parseServiceUrl = require('../lib/parseServiceUrl');

module.exports = async function getIndexNames(context, apimApiName) {
  context.log({ apimApiName });
  const response = await azureApimRequest(apimApiName);

  const activeServiceUrl = response.properties.serviceUrl;
  context.log({ activeServiceUrl });

  return parseServiceUrl(activeServiceUrl);
};
