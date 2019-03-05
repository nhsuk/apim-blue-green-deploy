const chai = require('chai');
const utils = require('../../../lib/SearchApiVersionUtils');

const expect = chai.expect;

describe('SearchApiVersionUtils', () => {
  describe('isSupportedApiVersion', () => {
    it('should handle supported versions', () => {
      expect(utils.isSupportedApiVersion('2017-11-11')).to.be.true;
    });
    it('should handle unsupported versions', () => {
      expect(utils.isSupportedApiVersion('2017-01-01')).to.be.false;
    });
  });
  describe('default version', () => {
    it('should return the default versions', () => {
      expect(utils.getDefault()).to.equal('2017-11-11');
    });
  });
});
