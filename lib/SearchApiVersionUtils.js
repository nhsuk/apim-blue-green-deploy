const supportedVersions = {
  alternatives: ['2017-11-11-Preview'],
  default: '2017-11-11',
};

function getDefault() {
  return supportedVersions.default;
}

function isSupportedApiVersion(version) {
  return (
    version === supportedVersions.default
    || supportedVersions.alternatives.includes(version)
  );
}

module.exports = {
  getDefault,
  isSupportedApiVersion,
};
