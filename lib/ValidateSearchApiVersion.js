const supportedVersions = {
  alternatives: ['2019-05-06', '2017-11-11-Preview'],
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

function validateSearchApiVersion(version) {
  const searchApiVersion = version || getDefault();
  if (!isSupportedApiVersion(searchApiVersion)) {
    throw Error(`The API version '${searchApiVersion}' can not be handled.`);
  }
  return searchApiVersion;
}

module.exports = validateSearchApiVersion;
