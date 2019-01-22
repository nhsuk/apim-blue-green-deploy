const chai = require('chai');
const utilities = require('../../../lib/utilities');

const expect = chai.expect;

describe('getIdleIndexName', () => {
  it('it should return \'b\' when passed \'a\'', () => {
    const idleIndexDeployment = utilities.getIdleIndexDeployment('a');
    expect(idleIndexDeployment).to.be.equal('b');
  });
  it('it should return \'b\' when passed \'a\'', () => {
    const idleIndexDeployment = utilities.getIdleIndexDeployment('b');
    expect(idleIndexDeployment).to.be.equal('a');
  });
  it('it should throw error when passed a value which is neither \'a\' nor \'b\'', () => {
    expect(() => { utilities.getIdleIndexDeployment('c'); }).to.throw();
  });
});
