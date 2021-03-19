This module can import or require node modules and local files.

Use the command dialog or the shortcut `Ctrl+Shift+1`. You can also use `Ctrl+Shift+2` to import/require and insert the reference at the current cursor position.

![Require Example](/resources/images/nodeRequire.gif)

For destructuring import use `ctrl+shift+3`. First select module, then select one or more export properties.

![Destructuring Example](https://user-images.githubusercontent.com/15873274/32335474-05351a86-bffe-11e7-932e-0708eae20deb.gif)

## Features

- Require core modules, dependencies / devDependencies or local files.
- New requires will be added to the end of the require block in top of file.
- The style (import vs require) will be auto-detected one a per-file level. It will ask for the first dependency.
- Typical naming substitutions (for example, `lodash` will be named `_` and jQuery will be `$`).
- If the import already exists, it will not add a duplicate.

## Acknowledgements

This module is a fork from [Bitkompagniet Node Require](https://github.com/bitkompagniet/vscode_extension_quick_require), which was itself a fork of [Quick Require](https://github.com/milkmidi/vscode_extension_quick_require). The typical namings were taken from [NodeRequirer](https://github.com/ganemone/NodeRequirer) for Sublime Text.
