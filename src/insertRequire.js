const vscode = require("vscode");
const path = require("path");
const os = require("os");
const _ = require("lodash");
const caseName = require("./caseName");
const commonNames = require("./commonNames");
const constants = require("./constants");
const detectFileQuoteType = require("./detectFileQuoteType");
const detectFileRequireMethod = require("./detectFileRequireMethod");
const detectFileSemi = require("./detectFileSemi");
const getPosition = require("./getPosition");
const isRequire = require("./isRequire");

/**
 * Inserts the require at the appropriate position
 *
 * @param {*} value - module or file to require
 * @param {*} insertAtCursor - whether to insert the imported name at cursor
 * @param {*} config - user config options
 * @param {*} importAll - whether to use import * as syntax
 * @returns
 */
module.exports = async function (value, insertAtCursor, config, importAll) {
  const convertCase = (filename) =>
    caseName(filename, config.preserveAcronymCase);
  const editor = vscode.window.activeTextEditor;
  let relativePath;
  let importName;
  let isExternal;
  if (value.fsPath) {
    // A local file was selected
    isExternal = false;

    const dirName = path.dirname(editor.document.fileName);
    relativePath = path.relative(dirName, value.fsPath);
    relativePath = relativePath.replace(/\\/g, "/");

    if (relativePath.match(/^index\.m?(j|t)sx?/)) {
      // We have selected index.js in the same directory as the source file
      importName = path.basename(path.dirname(editor.document.fileName));
      relativePath = `./${relativePath}`;
    } else {
      // We have selected a file from another directory
      const fileName = path.basename(relativePath).toLowerCase();
      // if it is an index file remove the /index.js portion
      let filePathForImportName = relativePath;
      if (fileName.match(/index\.m?(j|t)sx?/)) {
        const lengthToRemove =
          "/index.js".length - (fileName.match(/\..*x/) ? 1 : 0);

        filePathForImportName = filePathForImportName.slice(
          0,
          filePathForImportName.length - lengthToRemove
        );
        if (!config.keepFileExtension) {
          relativePath = filePathForImportName;
        }
      }

      const baseName = convertCase(
        path.basename(filePathForImportName).split(".")[0]
      );
      const aliasName = commonNames(baseName, config.aliases);
      importName = aliasName || baseName;
      // selected a path in the same directory as current file
      if (relativePath.indexOf("../") === -1) {
        relativePath = `./${relativePath}`;
      }
    }
    // get rid of file extension
    if (!config.keepFileExtension) {
      relativePath = relativePath.replace(/\.m?(j|t)sx?$/, "");
    }
  } else {
    // A core module or dependency was selected
    isExternal = true;
    relativePath = value.label;
    const commonName = commonNames(value.label, config.aliases);
    importName = commonName || convertCase(value.label);
  }
  const fileString = editor.document.getText();
  const codeBlock = fileString.split(os.EOL);
  const lineStart = config.insertAtCursor
    ? null
    : getPosition(codeBlock, isExternal);
  const cursorPosition = editor.selection.active;
  let requireMethod;
  if (importAll) {
    requireMethod = constants.TYPE_IMPORT;
  } else {
    requireMethod =
      detectFileRequireMethod(codeBlock) || config.defaultRequireMethod;
  }
  if (!requireMethod) {
    const style = await vscode.window.showQuickPick(
      [
        { label: "require", value: constants.TYPE_REQUIRE },
        { label: "import", value: constants.TYPE_IMPORT },
      ],
      { placeHolder: "Select import style" }
    );
    requireMethod = style.value;
  }
  const quoteType =
    detectFileQuoteType(codeBlock) || (config.singleQuote ? "'" : '"');
  const semi = detectFileSemi(codeBlock) || (config.semi ? ";" : "");
  const pathWithQuotes = `${quoteType}${relativePath}${quoteType}`;

  if (value.exportVars) {
    const exportVarsToUse = [];
    const fileStringNoNewlines = fileString.replace(/(\r\n|\n|\r)/gm, " ");
    // remove exports that have already been imported
    value.exportVars.forEach((exportVar) => {
      const alreadyImportedRegex = new RegExp(`${exportVar}.*${relativePath}`);
      if (!fileStringNoNewlines.match(alreadyImportedRegex)) {
        exportVarsToUse.push(exportVar);
      }
    });
    if (!exportVarsToUse.length) return;
    importName = `{ ${exportVarsToUse.join(", ")} }`;
  } else if (importAll) {
    importName = `* as ${importName}`;
  }

  const script =
    requireMethod === constants.TYPE_REQUIRE
      ? `const ${importName} = require(${pathWithQuotes})${semi}`
      : `import ${importName} from ${pathWithQuotes}${semi}`;

  return editor.edit((editBuilder) => {
    const position = config.insertAtCursor
      ? cursorPosition
      : new vscode.Position(lineStart, 0);
    const existingLine = codeBlock[lineStart];
    // if no newline after previous require (eof)
    // add a newline before script
    const newLineBefore = existingLine === undefined ? "\n" : "";
    // add an extra newline after if the next line is not a require statement
    const newLineAfter =
      !_.isEmpty(existingLine) && !isRequire(existingLine) ? "\n" : "";
    const insertText = config.insertAtCursor
      ? script
      : `${newLineBefore}${script}\n${newLineAfter}`;
    if (!codeBlock.some((line) => line === script))
      editBuilder.insert(position, insertText);
    if (insertAtCursor) editBuilder.insert(cursorPosition, importName);
  });
};
