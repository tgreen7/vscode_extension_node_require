const assert = require("assert");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
// const myExtension = require('../extension');
// const helper = require("./helper");

suite("Extension Test Suite", function () {
  this.timeout(20000);
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test("first test", async () => {
    // const document = helper.openFile("uniqueTextTest\nSecond line");

    await vscode.commands.executeCommand("node_require.require");
    vscode.TextEdit.insert(new vscode.Position(0, 0), "hey");
    vscode.commands.executeCommand("default:type", "Heya heya");
    // const text = vscode.window.activeTextEditor.document.getText();
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 10000);
    });
  });
});
