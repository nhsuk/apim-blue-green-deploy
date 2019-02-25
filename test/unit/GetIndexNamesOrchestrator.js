const chai = require('chai');
const getIndexNamesGeneratorFunction = require('../../GetIndexNamesOrchestrator/generator-function');

const expect = chai.expect;

describe('GetIndexNamesGeneratorFunction', () => {
  it('should return expected index names', () => {
    const indexNames = { active: 'index-1', idle: 'index-2' };
    const input = { apimApiName: 'api' };
    const context = {
      df: {
        callActivity: () => indexNames,
        getInput: () => input,
      },
      log: () => {},
    };

    const returnValue = getIndexNamesGeneratorFunction(context).next();

    expect(returnValue.value).to.equal(indexNames);
  });
  it('should handle scenario when names can not be retrieved', () => {
    const input = { apimApiName: 'api' };
    const context = {
      df: {
        callActivity: () => { throw Error('callActivity Error'); },
        getInput: () => input,
      },
      log: () => {},
    };

    expect(() => getIndexNamesGeneratorFunction(context).next()).to.throw('callActivity Error');
  });
});
