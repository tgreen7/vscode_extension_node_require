# 1.10.1

- FIXED: will insert multiple require statements in a single edit action. This is faster and can be undone with one cmd+z 

# 1.10.0

- ADDED: support for importing multiple files using match pattern (https://github.com/tgreen7/vscode_extension_node_require/issues/15)

# 1.9.1

- FIXED: incorrect position with multi-line require (https://github.com/tgreen7/vscode_extension_node_require/issues/17)

# 1.9.0

- ADDED: support for npm workspaces (https://github.com/tgreen7/vscode_extension_node_require/issues/19)

# 1.5.0

- ADDED: option to keep file extension (keepFileExtension)

# 1.2.10

- FIXED: places external import before local destructured imports.

# 1.2.8

- ADDED: option to insert the require statement at cursor (insertAtCursor).

# 1.2.4

- ADDED: destructuring import now goes deeper. Will get named exports from files exported
  from selected file.

# 1.2.0

- ADDED: destructuring import command to require named exports from files.

# 1.1.3

- FIXED: add a newline before if insert position is at end of file.

# 1.1.2

- ADDED: quote type config and quote type autodetection.
- ADDED: semicolon autodetection.

# 1.1.0

- ADDED: ability to require multiple modules/files with a single command.

# 1.8.0

- ADDED: support for .ts/.tsx file types.

# 1.0.5

- ADDED: config option for semicolon.
- FIXED: position when a block comment is at the top of a file.

# 1.0.0

- forked repository.
- FIXED: position when a named import is present in the file.

# 0.7.0

- Absolute imports are inserted before relative imports (by **@nickyhajal**).
- Allow aliases for local imports (by **@nickyhajal**).

# 0.6.2

- FIX: Skip 'use strict' before inserting the require (thx to **@jhnns**).

# 0.6.1

- FIX: requiring index.js from same directory as source file produced invalid result.
- FIX: failed silently when there was no package.json in the root folder.

# 0.6.0

- FEATURE: Make the import aliases configurable.

# 0.5.1

- FIX: missing activation event.

# 0.5.0

- Make a command for requiring/importing **and** insert the reference at the cursor position.
- FIX: namespace consistency.

# 0.4.0

- Search deep inside node modules (limited to those that are specified in dependencies). **Disabled** per default.
- Improve the info given about each file.
- FIX: if trying to require the current file, show a warning instead of creating a broken reference.

# 0.3.2

- FIX: an issue where it would put the import line below other code.

# 0.3.1

- Import vs require is now auto-detected using the first occurence in the file. When there are no occurences, it will ask.
- If there is no line-break between the dependencies and the following code, one will be inserted.

# 0.2.3

- Changed logo

# 0.2.2

- Display module prominently, and move path to description
- Change the order of deps, and sort package / core modules
