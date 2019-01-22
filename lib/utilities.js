function getIdleIndexDeployment(activeDeployment) {
  switch (activeDeployment) {
    case 'a':
      return 'b';
    case 'b':
      return 'a';
    default:
      throw new Error(`Argument Exception: unexpected activeDeployment value (${activeDeployment})`);
  }
}

function getIndexName(index, deployment) {
  return `${index.name}-${index.version}-${deployment}-${index.environment}`;
}

module.exports = {
  getIdleIndexDeployment,
  getIndexName,
}
