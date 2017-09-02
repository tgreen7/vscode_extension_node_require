const vscode = require('vscode')
const path = require('path')
const os = require('os')
const _ = require('lodash')
const detectFileRequireMethod = require('./detectFileRequireMethod')
const constants = require('./constants')
const detectFileQuoteType = require('./detectFileQuoteType')
const detectFileSemi = require('./detectFileSemi')
const commonNames = require('./commonNames')
const caseName = require('./caseName')
const getPosition = require('./getPosition')
const isRequire = require('./isRequire')

module.exports = function(value, insertAtCursor, config) {
  const editor = vscode.window.activeTextEditor
  let relativePath
  let importName
  let isExternal
  if (value.fsPath) {
    // A local file was selected
    isExternal = false
    if (editor.document.fileName === value.fsPath) {
      vscode.window.showErrorMessage('You are trying to require this file.')
      return
    }

    const dirName = path.dirname(editor.document.fileName)
    relativePath = path.relative(dirName, value.fsPath)
    relativePath = relativePath.replace(/\\/g, '/')

    if (relativePath.match(/^index\.(j|t)sx?/)) {
      // We have selected index.js in the same directory as the source file
      importName = path.basename(path.dirname(editor.document.fileName))
      relativePath = `./${relativePath}`
    } else {
      const fileName = path.basename(relativePath).toLowerCase()
      // We have selected a file from another directory
      if (fileName.match(/index\.(j|t)sx?/)) {
        const lengthToRemove =
          '/index.js'.length - (fileName.match(/index\.(j|t)sx/) ? 1 : 0)

        relativePath = relativePath.slice(
          0,
          relativePath.length - lengthToRemove
        )
      }

      const baseName = caseName(path.basename(relativePath).split('.')[0])
      const aliasName = commonNames(baseName, config.aliases)
      importName = aliasName || baseName

      relativePath = relativePath.replace(/\.(j|t)sx?/, '')
    }
  } else {
    // A core module or dependency was selected
    isExternal = true
    relativePath = value.label
    const commonName = commonNames(value.label, config.aliases)
    importName = commonName || caseName(value.label)
  }

  const codeBlock = editor.document.getText().split(os.EOL)
  const lineStart = getPosition(codeBlock, isExternal)
  const cursorPosition = editor.selection.active

  return Promise.resolve(detectFileRequireMethod(codeBlock))
    .then(requireMethod => {
      if (requireMethod !== null) return requireMethod

      return vscode.window
        .showQuickPick(
          [
            { label: 'require', value: constants.TYPE_REQUIRE },
            { label: 'import', value: constants.TYPE_IMPORT }
          ],
          { placeHolder: 'Select import style' }
        )
        .then(style => style.value)
    })
    .then(requireMethod => {
      let script
      const quoteType = detectFileQuoteType(codeBlock) || config.quoteType
      const semi = detectFileSemi(codeBlock) || config.semi ? ';' : ''
      if (requireMethod === constants.TYPE_REQUIRE) {
        script = `const ${importName} = require(${quoteType}${relativePath}${quoteType})${semi}`
      } else {
        script = `import ${importName} from ${quoteType}${relativePath}${quoteType}${semi}`
      }

      return script
    })
    .then(script => {
      return editor.edit(editBuilder => {
        const position = new vscode.Position(lineStart, 0)
        const existingLine = codeBlock[lineStart]
        // if no newline after previous require (eof)
        // add a newline before script
        const newLineBefore = existingLine === undefined ? '\n' : ''
        // add an extra newline after if the next line is not a require statement
        const newLineAfter =
          !_.isEmpty(existingLine) && !isRequire(existingLine) ? '\n' : ''
        const insertText = `${newLineBefore}${script}\n${newLineAfter}`
        if (!codeBlock.some(line => line === script))
          editBuilder.insert(position, insertText)
        if (insertAtCursor) editBuilder.insert(cursorPosition, importName)
      })
    })
}
