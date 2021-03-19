const vscode = require("vscode");

async function doc(content, language) {
  return await vscode.workspace.openTextDocument({
    language,
    content,
  });
}

async function openFile(content) {
  const document = doc(content);
  vscode.window.showTextDocument(await document);
  return document;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function changeConfig(settings) {
  const assistant = vscode.workspace.getConfiguration();
  await assistant.update(
    "assistant",
    settings,
    vscode.ConfigurationTarget.Global
  );
}

async function clearConfig() {
  await changeConfig({
    rules: [],
  });
}

module.exports = {
  doc,
  openFile,
  sleep,
  changeConfig,
  clearConfig,
};
