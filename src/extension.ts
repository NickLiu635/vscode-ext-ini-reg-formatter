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

            const formattedText = formatDocument(document.getText(), 'ini');
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

            const formattedText = formatDocument(document.getText(), 'reg');
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

function formatDocument(text: string, fileType: 'ini' | 'reg'): string {
    const lines = text.split('\n');

    // 去除行首尾空格
    const trimmedLines = lines.map(line => line.trim());

    // 去除多余空行
    // const noExtraBlanks = [];
    // let prevBlank = false;
    // for (const line of trimmedLines) {
    //     const isBlank = line === '';
    //     if (!isBlank || !prevBlank) {
    //         noExtraBlanks.push(line);
    //     }
    //     prevBlank = isBlank;
    // }

    // 分离注释、节和字段/值
    const sections: {
        [key: string]: {
            headerComments: string[],
            entries: {
                value: string,
                comment?: string,
                leadingComments?: string[]
            }[]
        }
    } = {};
    let currentSection: string = "";
    let pendingComments: string[] = []; // 待关联到下一行的注释

    let newSection = (name: string) => {
        if (currentSection && sections[currentSection]) {
            sections[currentSection].entries.sort((a, b) => a.value.localeCompare(b.value));
        }
        currentSection = name;
        sections[currentSection] = { headerComments: pendingComments, entries: [] };
        pendingComments = [];
    }

    newSection(currentSection); // 全局节

    for (const line of trimmedLines) {
        if (line.startsWith(';')) {
            // 单行注释 - 加入待处理注释，将跟随下一行
            // 移除多余空格
            pendingComments.push(line.replace(/^;\s*/, '; '));
            continue;
        } else if (line == '') {
            continue;
        } else if (line.startsWith('[') && line.endsWith(']')) {
            // 新节
            newSection(line);
        } else {
            // 字段或值
            const [keyValue, ...commentParts] = line.split(';');
            commentParts.map(part => part.trim());
            const comment = commentParts.length > 0 ? commentParts.join('; ') : undefined;
            const [key, ...valueParts] = keyValue.split('=');
            const value = valueParts.join('=')
            sections[currentSection].entries.push({
                value: key.trim() + (valueParts.length ? ' = ' + value.trim() : ''),
                comment,
                leadingComments: pendingComments.length > 0 ? [...pendingComments] : undefined
            });
            pendingComments = []; // 清空待处理注释，因为已关联到当前行
        }
    }

    // 对最后一节的字段/值排序
    if (currentSection && sections[currentSection]) {
        sections[currentSection].entries.sort((a, b) => a.value.localeCompare(b.value));
    }

    // 重新组装文档
    const result: string[] = [];

    for (const section in sections) {
        if (sections[section].headerComments.length > 0) {
            result.push(...sections[section].headerComments);
        }
        if (section) {
            result.push(section);
        }
        for (const entry of sections[section].entries) {
            // 输出前置注释
            if (entry.leadingComments && entry.leadingComments.length > 0) {
                result.push(...entry.leadingComments);
            }
            let line = entry.value;
            if (entry.comment) {
                line += ` ; ${entry.comment}`;
            }
            result.push(line);
        }
        if(sections[section].entries.length > 0) {
            result.push(''); // 节后空行
        }
    }

    if (pendingComments.length > 0) {
        result.push(...pendingComments);
        result.push(''); // 文件末尾空行
    }


    return result.join('\n');
}

export function deactivate() { }