import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // 注册INI文件格式化程序
    vscode.languages.registerDocumentFormattingEditProvider('ini', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const edits: vscode.TextEdit[] = [];
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            const formattedText = formatIniDocument(document.getText());
            edits.push(vscode.TextEdit.replace(fullRange, formattedText));

            return edits;
        }
    });

    // 注册REG文件格式化程序
    vscode.languages.registerDocumentFormattingEditProvider('reg', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const edits: vscode.TextEdit[] = [];
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            const formattedText = formatRegDocument(document.getText());
            edits.push(vscode.TextEdit.replace(fullRange, formattedText));

            return edits;
        }
    });

    // 注册命令
    const formatCommand = vscode.commands.registerCommand('ini-reg-formatter.formatDocument', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && (editor.document.languageId === 'ini' || editor.document.languageId === 'reg')) {
            vscode.commands.executeCommand('editor.action.formatDocument');
        }
    });

    context.subscriptions.push(formatCommand);
}

function formatIniDocument(text: string): string {
    const lines = text.split('\n');

    // 去除行首尾空格
    const trimmedLines = lines.map(line => line.trim());

    // 去除多余空行
    const noExtraBlanks = [];
    let prevBlank = false;
    for (const line of trimmedLines) {
        const isBlank = line === '';
        if (!isBlank || !prevBlank) {
            noExtraBlanks.push(line);
        }
        prevBlank = isBlank;
    }

    // 分离注释和字段
    const sections: { [key: string]: { comments: string[], fields: { key: string, value: string, comment?: string }[] } } = {};
    let currentSection = '';
    let currentComments: string[] = [];

    for (const line of noExtraBlanks) {
        if (line.startsWith('[') && line.endsWith(']')) {
            // 新节
            if (currentSection) {
                // 对上一节的字段排序
                sections[currentSection].fields.sort((a, b) => a.key.localeCompare(b.key));
            }
            currentSection = line;
            sections[currentSection] = { comments: currentComments, fields: [] };
            currentComments = [];
        } else if (line.includes('=')) {
            // 字段
            const [keyValue, ...commentParts] = line.split(';');
            const comment = commentParts.length > 0 ? ';' + commentParts.join(';') : undefined;
            const [key, ...valueParts] = keyValue.split('=');
            const value = valueParts.join('=');
            sections[currentSection].fields.push({
                key: key.trim(),
                value: value.trim(),
                comment
            });
        } else if (line.startsWith(';') || line === '') {
            // 注释或空行
            currentComments.push(line);
        } else {
            // 其他行，保持原样
            if (!sections[currentSection]) {
                sections[currentSection] = { comments: [], fields: [] };
            }
            sections[currentSection].comments.push(line);
        }
    }

    // 对最后一节的字段排序
    if (currentSection && sections[currentSection]) {
        sections[currentSection].fields.sort((a, b) => a.key.localeCompare(b.key));
    }

    // 重新组装文档
    const result: string[] = [];
    for (const section in sections) {
        if (sections[section].comments.length > 0) {
            result.push(...sections[section].comments);
        }
        if (section) {
            result.push(section);
        }
        for (const field of sections[section].fields) {
            let line = `${field.key}=${field.value}`;
            if (field.comment) {
                line += ` ${field.comment}`;
            }
            result.push(line);
        }
        result.push(''); // 节后空行
    }

    // 去除末尾多余空行
    while (result.length > 0 && result[result.length - 1] === '') {
        result.pop();
    }

    return result.join('\n');
}

function formatRegDocument(text: string): string {
    const lines = text.split('\n');

    // 去除行首尾空格
    const trimmedLines = lines.map(line => line.trim());

    // 去除多余空行
    const noExtraBlanks = [];
    let prevBlank = false;
    for (const line of trimmedLines) {
        const isBlank = line === '';
        if (!isBlank || !prevBlank) {
            noExtraBlanks.push(line);
        }
        prevBlank = isBlank;
    }

    // 分离注释、节和值
    const sections: { [key: string]: { comments: string[], values: { name: string, value: string, comment?: string }[] } } = {};
    let currentSection = '';
    let currentComments: string[] = [];
    let header = '';

    for (const line of noExtraBlanks) {
        if (line.startsWith('Windows Registry Editor Version')) {
            // 注册表文件头
            header = line;
        } else if (line.startsWith('[') && line.endsWith(']')) {
            // 新节
            if (currentSection) {
                // 对上一节的值排序
                sections[currentSection].values.sort((a, b) => a.name.localeCompare(b.name));
            }
            currentSection = line;
            sections[currentSection] = { comments: currentComments, values: [] };
            currentComments = [];
        } else if (line.includes('=') && !line.startsWith(';')) {
            // 注册表值
            const [nameValue, ...commentParts] = line.split(';');
            const comment = commentParts.length > 0 ? ';' + commentParts.join(';') : undefined;
            const [name, ...valueParts] = nameValue.split('=');
            const value = valueParts.join('=');
            sections[currentSection].values.push({
                name: name.trim(),
                value: value.trim(),
                comment
            });
        } else if (line.startsWith(';') || line === '') {
            // 注释或空行
            currentComments.push(line);
        } else {
            // 其他行，保持原样
            if (!sections[currentSection]) {
                sections[currentSection] = { comments: [], values: [] };
            }
            sections[currentSection].comments.push(line);
        }
    }

    // 对最后一节的值排序
    if (currentSection && sections[currentSection]) {
        sections[currentSection].values.sort((a, b) => a.name.localeCompare(b.name));
    }

    // 重新组装文档
    const result: string[] = [];
    if (header) {
        result.push(header);
        result.push(''); // 头后空行
    }

    for (const section in sections) {
        if (sections[section].comments.length > 0) {
            result.push(...sections[section].comments);
        }
        if (section) {
            result.push(section);
        }
        for (const value of sections[section].values) {
            let line = `${value.name}=${value.value}`;
            if (value.comment) {
                line += ` ${value.comment}`;
            }
            result.push(line);
        }
        result.push(''); // 节后空行
    }

    // 去除末尾多余空行
    while (result.length > 0 && result[result.length - 1] === '') {
        result.pop();
    }

    return result.join('\n');
}

export function deactivate() {}