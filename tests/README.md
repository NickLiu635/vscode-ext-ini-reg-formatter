# Test Cases

This folder contains test cases for the INI/REG Formatter extension.

## Test Files

### INI Files
- `example.ini` - Basic INI file with sections, keys, values, and comments
- `complex.ini` - More complex INI file with various formatting issues
- `comments-only.ini` - INI file containing only comments (edge case)
- `comments-follow.ini` - Demonstrates comment following behavior (comments attach to the next non-comment line)
- `standalone-comments.ini` - Demonstrates standalone comments that remain at section start

### REG Files
- `example.reg` - Basic Windows Registry file with various value types
- `complex.reg` - Complex REG file with different data types (string, dword, binary, etc.)
- `minimal.reg` - Minimal REG file with empty sections and comments
- `comments-follow.reg` - Demonstrates comment following behavior in REG files
- `standalone-comments.reg` - Demonstrates standalone comments that remain at section start in REG files

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