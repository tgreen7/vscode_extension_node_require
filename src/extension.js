const vscode = require("vscode");
const path = require("path");
const _ = require("lodash");
const insertRequire = require("./insertRequire");
const getProjectFiles = require("./getProjectFiles");
const getCoreModules = require("./getCoreModules");
const getPackageDeps = require("./getPackageDeps");
const showModulePropNames = require("./showModulePropNames");
const { glob } = require("glob");

async function getQuickPickItems({ config, multiple }) {
  const [
    { packageDeps = [], workspaceDeps = [] },
    projectFiles = [],
  ] = await Promise.all([getPackageDeps(), getProjectFiles(config)]);

  const editor = vscode.window.activeTextEditor;

  if (!editor) return;
  const items = [];

  packageDeps.sort().forEach((dep) => {
    items.push({
      label: dep.label,
      description: "module",
      fsPath: null,
      dirPath: dep.dirPath,
    });
  });

  workspaceDeps.sort().forEach((dep) => {
    items.push({
      label: dep.label,
      description: "workspace module",
      fsPath: null,
      dirPath: dep.dirPath,
    });
  });

  getCoreModules().forEach((dep) => {
    items.push({
      label: dep,
      description: "core module",
      fsPath: null,
    });
  });

  projectFiles.forEach((dep) => {
    const rootRelative = dep.fsPath
      .replace(vscode.workspace.rootPath, "")
      .replace(/\\/g, "/");

    const label = path.basename(dep.path).match(/^index\./)
      ? // if it is an index.js file we need to preserve the folder name for context
        `${path.basename(path.dirname(dep.path))}/${path.basename(dep.path)}`
      : path.basename(dep.path);

    // don't allow requiring of the file being edited
    if (editor.document.fileName === dep.fsPath) return;
    items.push({
      label,
      detail: rootRelative,
      description: "project file",
      fsPath: dep.fsPath,
    });
  });

  if (multiple) {
    items.unshift({
      label: "------ Finish Selecting ------",
      finish: true,
    });
  }
  return items;
}

function activate(context) {
  const config = vscode.workspace.getConfiguration("node_require");

  async function startPick({
    insertAtCursor = false,
    multiple = false,
    destructuring = false,
    importAll = false,
  } = {}) {
    let items = await getQuickPickItems({ config, multiple });
    const multiValuesCollect = [];

    const showSelectionWindow = () => {
      const quickPick = vscode.window.createQuickPick({
        placeHolder: "Select dependency",
        matchOnDescription: true,
        matchOnDetail: true,
      });
      quickPick.items = items;
      quickPick.placeholder = "Select dependency";
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;
      quickPick.onDidChangeSelection((selection) => {
        try {
          const userTypedString = quickPick.value;
          let value = selection && selection[0];
          if (!value && !multiple) {
            quickPick.hide();
          } else {
            // don't try to match glob multiple selection if destructuring
            if (!destructuring && userTypedString) {
              const hasMagic = glob.hasMagic(userTypedString);
              if (hasMagic) {
                const nanomatch = require("nanomatch");
                const matchingItems = items.filter((item) => {
                  const matchOnPath =
                    item.fsPath &&
                    nanomatch.contains(
                      item.fsPath.toLowerCase(),
                      userTypedString.toLowerCase()
                    );
                  const matchOnLabel =
                    item.label &&
                    nanomatch.contains(
                      item.label.toLowerCase(),
                      userTypedString.toLowerCase()
                    );
                  return matchOnPath || matchOnLabel;
                });
                if (matchingItems.length) {
                  value = matchingItems;
                }
              }
            }
            if (multiple) {
              if (value) {
                if (value.finish) {
                  quickPick.hide();
                  insertRequire(
                    multiValuesCollect,
                    insertAtCursor,
                    config,
                    importAll
                  );
                }
                if (Array.isArray(value)) {
                  multiValuesCollect.push(...value);
                } else {
                  multiValuesCollect.push(value);
                }
                items = _.difference(items, multiValuesCollect);
                quickPick.items = items;
              }
            } else if (destructuring) {
              quickPick.hide();
              showModulePropNames(value, insertAtCursor, config);
            } else {
              quickPick.hide();
              insertRequire(value, insertAtCursor, config, importAll);
            }
          }
        } catch (error) {
          console.error("error:", error);
          vscode.window.showErrorMessage("Error performing require");
        }
      });
      quickPick.onDidHide(() => {
        quickPick.dispose();
      });
      quickPick.show();
    };

    showSelectionWindow();
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("node_require.require", () => {
      startPick();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("node_require.requireAndInsert", () => {
      startPick({ insertAtCursor: true });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("node_require.requireMultiple", () => {
      startPick({ multiple: true });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("node_require.destructuringImport", () => {
      startPick({ destructuring: true });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("node_require.importAll", () => {
      startPick({ importAll: true });
    })
  );
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;
