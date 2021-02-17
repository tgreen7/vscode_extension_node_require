const vscode = require("vscode"); // eslint-disable-line
const _ = require("lodash");
const path = require("path");
const { glob } = require("glob");

let warningShown = false;

function resolveDeps(deps) {
  let packageOptions = [];
  const map = new Map();

  deps.forEach(function (dep) {
    try {
      const reqResolved = require.resolve(dep.fsPath);
      if (require.cache[reqResolved]) delete require.cache[reqResolved];
      const pck = require(dep.fsPath);
      const dirPath = path.dirname(dep.fsPath);
      const dependencies = Object.assign(
        {},
        pck.dependencies || {},
        pck.devDependencies || {}
      );

      const depsArr = Object.keys(dependencies).map((d) => ({
        label: d,
        dirPath,
      }));
      packageOptions = packageOptions.concat(depsArr);

      // handle workspaces
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
    } catch (err) {
      if (!warningShown) {
        vscode.window.showWarningMessage(
          "No package.json file in root folder. Only showing core modules and local files."
        );
        warningShown = true;
      }
    }
  });

  const packageDeps = _.uniqBy(packageOptions, "label");
  const workspaceDeps = Array.from(map.values());
  return { packageDeps, workspaceDeps };
}

module.exports = async function () {
  const deps = await vscode.workspace.findFiles(
    "**/package.json",
    "**/node_modules/**"
  );
  return resolveDeps(deps);
};
