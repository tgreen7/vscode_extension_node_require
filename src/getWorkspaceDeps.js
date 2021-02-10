const vscode = require("vscode"); // eslint-disable-line
const path = require("path");
const glob = require("glob");

let warningShown = false;

function resolveDeps(deps) {
  const map = new Map();

  deps.forEach(function (dep) {
    try {
      const reqResolved = require.resolve(dep.fsPath);
      if (require.cache[reqResolved]) delete require.cache[reqResolved];
      const pck = require(dep.fsPath); // eslint-disable-line import/no-dynamic-require, global-require
      const dirPath = path.dirname(dep.fsPath);
      const workspaces = pck.workspaces || [];

      workspaces.forEach((d) => {
        const basePath = path.resolve(`${dirPath}/${d}`);
        const matches = glob.sync(basePath, { silent: true });
        return matches.forEach((dirPath) => {
          const { name } = require(`${dirPath}/package.json`);
          map.set(name, {
            label: name,
            dirPath,
          });
        });
      });
    } catch {
      if (!warningShown) {
        vscode.window.showWarningMessage(
          "No package.json file in workspace folder. Only showing core modules and local files."
        );
        warningShown = true;
      }
    }
  });

  return Array.from(map.values());
}

module.exports = async function () {
  const deps = await vscode.workspace.findFiles(
    "**/package.json",
    "**/node_modules/**"
  );
  return resolveDeps(deps);
};
