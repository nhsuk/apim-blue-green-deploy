const df = require('durable-functions');

module.exports = async function httpStart(context, req) {
  const functionName = req.params.functionName;
  const client = df.getClient(context);

  const instanceId = await client.startNew(functionName, undefined, req.body);
  context.log(`Starting orchestration with ID = '${instanceId}'.`);
  return client.createCheckStatusResponse(req, instanceId);
};
