const vscode = require("vscode");
const path = require("path");
const Promise = require("bluebird");
const _ = require("lodash");
const insertRequire = require("./insertRequire");
const getProjectFiles = require("./getProjectFiles");
const getCoreModules = require("./getCoreModules");
const getPackageDeps = require("./getPackageDeps");
const showModulePropNames = require("./showModulePropNames");

function activate(context) {
  const config = vscode.workspace.getConfiguration("node_require");

  const startPick = function({
    insertAtCursor = false,
    multiple = false,
    destructuring = false,
    importAll = false
  } = {}) {
    Promise.join(getPackageDeps(), getProjectFiles(config)).then(
      ([packageDepsArray = [], projectFiles = []]) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const items = [];
        packageDepsArray.sort().forEach(dep => {
          items.push({
            label: dep.label,
            description: "module",
            fsPath: null,
            dirPath: dep.dirPath
          });
        });

        getCoreModules().forEach(dep => {
          items.push({
            label: dep,
            description: "core module",
            fsPath: null
          });
        });

        projectFiles.forEach(dep => {
          const rootRelative = dep.fsPath
            .replace(vscode.workspace.rootPath, "")
            .replace(/\\/g, "/");

          const label = path.basename(dep.path).match(/^index\./)
            ? // if it is an index.js file we need to preserve the folder name for context
              `${path.basename(path.dirname(dep.path))}/${path.basename(
                dep.path
              )}`
            : path.basename(dep.path);

          // don't allow requiring of the file being edited
          if (editor.document.fileName === dep.fsPath) return;
          items.push({
            label,
            detail: rootRelative,
            description: "project file",
            fsPath: dep.fsPath
          });
        });

        if (multiple) {
          items.unshift({
            label: "------ Finish Selecting ------",
            finish: true
          });
        }

        const values = [];
        const finalizeMultiple = () => {
          Promise.mapSeries(values, value => {
            return insertRequire(value, insertAtCursor, config);
          });
        };

        const showSelectionWindow = items => {
          vscode.window
            .showQuickPick(items, {
              placeHolder: "Select dependency",
              matchOnDescription: true,
              matchOnDetail: true
            })
            .then(value => {
              if (!value) return;
              if (multiple) {
                if (value.finish) return finalizeMultiple();
                values.push(value);
                items = _.difference(items, values);
                showSelectionWindow(items);
              } else if (destructuring) {
                showModulePropNames(value, insertAtCursor, config);
              } else {
                insertRequire(value, insertAtCursor, config, importAll);
              }
            });
        };

        showSelectionWindow(items);
      }
    );
  };

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
