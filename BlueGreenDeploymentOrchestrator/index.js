const df = require('durable-functions');
const generatorFunction = require('./generator-function');

module.exports = df.orchestrator(generatorFunction);
