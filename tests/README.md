# Test Cases

This folder contains test cases for the INI/REG Formatter extension.

## Test Files

### INI Files
- `example.ini` - Basic INI file with sections, keys, values, and comments
- `complex.ini` - More complex INI file with various formatting issues
- `comments-only.ini` - INI file containing only comments (edge case)

### REG Files
- `example.reg` - Basic Windows Registry file with various value types
- `complex.reg` - Complex REG file with different data types (string, dword, binary, etc.)
- `minimal.reg` - Minimal REG file with empty sections and comments

## Testing

To test the formatter:
1. Open any of these files in VSCode
2. Run the "Format Document" command from the command palette
3. Verify that:
   - Leading/trailing whitespace is removed
   - Extra blank lines are removed
   - Keys/values are sorted alphabetically within each section
   - Comments are preserved
   - File structure remains valid