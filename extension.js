const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('smart-logger.insertLog', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // Нет открытого редактора
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showInformationMessage('Пожалуйста, выделите переменную для логирования!');
            return;
        }

        const languageId = editor.document.languageId;
        let logTemplate = '';

        // Шаблоны логов для разных языков
        switch (languageId) {
            case 'python':
                logTemplate = `print(f"[DEBUG] ${text}: {${text}}")`;
                break;
            case 'javascript':
            case 'typescript':
            case 'javascriptreact':
            case 'typescriptreact':
                logTemplate = `console.log("[DEBUG] ${text}:", ${text});`;
                break;
            case 'java':
            case 'cpp':
            case 'csharp':
                logTemplate = `std::cout << "[DEBUG] " << ${text} << std::endl;`; // Для C++ по умолчанию
                if (languageId === 'java') {
                    logTemplate = `System.out.println("[DEBUG] " + ${text});`;
                } else if (languageId === 'csharp') {
                    logTemplate = `Console.WriteLine($"[DEBUG] ${text}: {${text}}");`;
                }
                break;
            default:
                // Универсальный шаблон по умолчанию
                logTemplate = `[DEBUG] ${text}: ${text}`;
                break;
        }

        // Определяем текущую строку, чтобы вставить лог на следующей строке с тем же отступом
        const currentLine = editor.document.lineAt(selection.end.line);
        const lineEnd = currentLine.range.end;
        const indentation = currentLine.text.match(/^\s*/)[0];

        editor.edit(editBuilder => {
            // Вставляем перенос строки и шаблон с отступом на новой строке
            editBuilder.insert(lineEnd, `\n${indentation}${logTemplate}`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;