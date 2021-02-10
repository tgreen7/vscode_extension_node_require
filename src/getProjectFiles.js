const vscode = require("vscode"); // eslint-disable-line

module.exports = async function (config) {
  const includePattern = `**/*.{${config.include.toString()}}`;
  const excludePattern = `**/{${config.exclude.toString()}}`;
  const projectFiles = await vscode.workspace.findFiles(
    includePattern,
    excludePattern
  );
  return projectFiles;
};
