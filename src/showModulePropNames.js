const vscode = require("vscode");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const insertRequire = require("./insertRequire");
const EXPORT_REGEX = /export\s*(?:function|class|const|let|var)?\s*(?!default)(\w+|\{[^{]+\})/g;
const NEXT_LEVEL_EXPORT_REGEX = /export +\* +from\s*["'](.*)["']/g;

function getPackageField(moduleDirPath, field) {
  const pathToPackageJson = path.join(moduleDirPath, "package.json");

  if (!fs.existsSync(moduleDirPath)) {
    vscode.window.showErrorMessage(
      "Module is defined in dependencies but not installed"
    );
    return;
  }

  const json = fs.readFileSync(pathToPackageJson, "utf-8");
  const parsedJson = JSON.parse(json);

  if (parsedJson[field]) {
    return parsedJson[field];
  } else if (fs.existsSync(path.join(moduleDirPath, "index.js"))) {
    return "index.js";
  }
}

function getMatchExportNames(fileString, modulePath) {
  let resultNames = [];
  fileString.replace(EXPORT_REGEX, (_, group) => {
    let exportObj;
    if (group.startsWith("{")) {
      exportObj = group.replace(/[\s\n\t{}]/g, "").split(",");

      return exportObj.forEach((i) =>
        resultNames.push(i.replace("defaultas", ""))
      );
    }

    resultNames.push(group);
  });
  resultNames = _.remove(resultNames, (n) => !n.startsWith("_"));

  fileString.replace(NEXT_LEVEL_EXPORT_REGEX, (_, group) => {
    // get full path
    let filePath = path.join(path.dirname(modulePath), group);
    // add an extension to the file path
    if (!path.extname(filePath)) {
      filePath = filePath + path.extname(modulePath);
    }
    resultNames = resultNames.concat(
      getModuleExportNames({ fsPath: filePath })
    );
  });

  return resultNames;
}

function getModuleExportNames({ fsPath, label, description, dirPath }) {
  let modulePath;
  if (description === "module") {
    modulePath = path.join(dirPath, "node_modules", label);
    const packageFullPath = getPackageField(modulePath, "main");

    if (packageFullPath === undefined) return;

    modulePath = path.join(modulePath, packageFullPath);
  } else {
    modulePath = fsPath || label;
  }

  try {
    const obj = require(modulePath);
    if (typeof obj === "function" || (obj.__esModule && obj.default)) {
      vscode.window.showInformationMessage("Module is function");
      return;
    }

    return _.remove(Object.keys(obj), (n) => !n.startsWith("_"));
  } catch (error) {
    // error if es6 module
  }

  const fileStr = fs.readFileSync(modulePath, "utf-8");
  return getMatchExportNames(fileStr, modulePath);
}

module.exports = function (value, insertAtCursor, config) {
  if (value.fsPath && !/\.(js|jsx|ts|tsx)$/.test(value.fsPath)) {
    vscode.window.showErrorMessage(
      "Node dustructuring import does not support this extension file"
    );
    return;
  }

  const exportVars = getModuleExportNames(value);
  let selectedVars = [];

  const insert = () => {
    value.exportVars = selectedVars;
    insertRequire(value, insertAtCursor, config);
  };

  if (!exportVars) return;
  if (exportVars.length === 1) {
    selectedVars = exportVars;
    return insert();
  }

  exportVars.unshift({
    label: "------ Select One or More Options ------",
    finish: true,
  });

  const showModuleProps = () => {
    if (selectedVars.length === 1) {
      exportVars[0].label = "------ Finish Selecting ------";
    }

    const remainingVars = _.difference(exportVars, selectedVars);

    if (exportVars.length - 1 === selectedVars.length) {
      return insert();
    }

    vscode.window
      .showQuickPick(remainingVars, {
        placeHolder: "Select props",
      })
      .then((exportVarName) => {
        if (!exportVarName) return;

        if (exportVarName.finish) {
          if (!selectedVars.length) return;
          return insert();
        }

        selectedVars.push(exportVarName);
        showModuleProps();
      });
  };

  if (exportVars.length === 1) {
    vscode.window.showInformationMessage(
      "Module does not contains export properties"
    );
    return;
  }

  showModuleProps();
};
