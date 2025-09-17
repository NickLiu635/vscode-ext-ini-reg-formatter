# INI/REG Formatter

A VSCode extension that formats INI and Windows Registry (.reg) files by:
- Trimming leading and trailing whitespace from lines
- Removing extra blank lines
- Sorting fields/values within sections alphabetically

## Features

- Automatic formatting on save (if configured)
- Manual formatting via command palette
- Supports .ini, .cfg, .conf, and .reg file extensions
- Handles both INI format (key=value) and Registry format ("name"="value")

## Usage

1. Open an INI or REG file in VSCode
2. Use `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette
3. Type "Format Document" and select it
4. Alternatively, configure VSCode to format on save for these file types

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press `F5` to launch the extension development host
5. Test the extension in the new window

## Testing

Test cases are available in the `tests/` folder. The folder contains various INI and REG files with different formatting scenarios:

- `example.ini` & `example.reg` - Basic test cases
- `complex.ini` & `complex.reg` - More complex formatting scenarios
- `comments-only.ini` & `minimal.reg` - Edge cases with comments and empty sections

To test:
1. Open any test file in VSCode
2. Run "Format Document" command
3. Verify formatting results

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.