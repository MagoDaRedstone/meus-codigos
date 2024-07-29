// LuaExecute.js

class LuaExecute {
    constructor() {
        this.luaCode = '';
    }

    input(luaCode) {
        this.luaCode = luaCode;
        this.convertAndExecute();
    }

    resultado() {
        return this.parse();
    }

    convertAndExecute() {
        const jsCode = this.parse();
        const outputDiv = document.getElementById('console');
        this.execute(jsCode, outputDiv);
        document.getElementById('jsOutput').textContent = jsCode;
    }

    parse() {
        const lines = this.luaCode.split('\n');
        const jsCode = [];
        let indentLevel = 0;
        const blockStack = [];
        const indent = () => ' '.repeat(indentLevel * 4);

        lines.forEach(line => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('print')) {
                                jsCode.push(`${indent()}console.log(${trimmedLine.slice(6, -1)});`);
            } else if (trimmedLine.startsWith('local ')) {
                jsCode.push(`${indent()}${this.convertLocal(trimmedLine)};`);
            } else if (trimmedLine.startsWith('function ')) {
                jsCode.push(this.convertFunction(trimmedLine));
                indentLevel++;
                blockStack.push('function');
            } else if (trimmedLine === 'end') {
                indentLevel--;
                if (blockStack.length > 0) {
                    const blockType = blockStack.pop();
                    if (['if', 'while', 'repeat', 'for', 'function'].includes(blockType)) {
                        jsCode.push(`${indent()}}`);
                    }
                }
            } else if (trimmedLine.startsWith('if ')) {
                jsCode.push(`${indent()}if (${this.convertExpression(trimmedLine.slice(3).replace('then', '').trim())}) {`);
                indentLevel++;
                blockStack.push('if');
            } else if (trimmedLine.startsWith('elseif ')) {
                indentLevel--;
                jsCode.push(`${indent()}} else if (${this.convertExpression(trimmedLine.slice(7).replace('then', '').trim())}) {`);
                indentLevel++;
            } else if (trimmedLine.startsWith('else')) {
                indentLevel--;
                jsCode.push(`${indent()}} else {`);
                indentLevel++;
            } else if (trimmedLine.startsWith('for ')) {
                jsCode.push(this.convertFor(trimmedLine));
                indentLevel++;
                blockStack.push('for');
            } else if (trimmedLine.startsWith('while ')) {
                jsCode.push(`${indent()}while (${this.convertExpression(trimmedLine.slice(6))}) {`);
                indentLevel++;
                blockStack.push('while');
            } else if (trimmedLine.startsWith('repeat')) {
                jsCode.push(`${indent()}do {`);
                indentLevel++;
                blockStack.push('repeat');
            } else if (trimmedLine.startsWith('until ')) {
                indentLevel--;
                jsCode.push(`${indent()}} while (${this.convertExpression(trimmedLine.slice(6))});`);
                blockStack.pop();
            } else if (trimmedLine === 'do') {
                jsCode.push(`${indent()} {`);
                indentLevel++;
                blockStack.push('do');
            } else if (trimmedLine.startsWith('return ')) {
                jsCode.push(`${indent()}return ${this.convertExpression(trimmedLine.slice(7))};`);
            } else if (trimmedLine.includes('=')) {
                jsCode.push(`${indent()}${this.convertAssignment(trimmedLine)}`);
            } else if (trimmedLine.startsWith('{')) {
                jsCode.push(this.convertTable(trimmedLine));
            } else if (trimmedLine) {
                jsCode.push(`${indent()}${this.convertExpression(trimmedLine)};`);
            }
        });

        return jsCode.join('\n');
    }

    convertLocal(line) {
        const [name, value] = line.replace('local ', '').split('=').map(s => s.trim());
        return value ? `${name} = ${this.convertExpression(value)}` : `${name} = undefined`;
    }

    convertFunction(line) {
        const match = line.match(/function\s+(\w+)\s*\(([^)]*)\)/);
        if (match) {
            const [, name, params] = match;
            return `function ${name}(${params}) {`;
        }
        return '';
    }

    convertFor(line) {
        const match = line.match(/for\s+(\w+)\s*=\s*(\d+)\s*,\s*(\d+)/);
        if (match) {
            const [, varName, start, end] = match;
            return `for (let ${varName} = ${start}; ${varName} <= ${end}; ${varName}++) {`;
        }
        return '';
    }

    convertAssignment(line) {
        const [left, right] = line.split('=').map(s => s.trim());
        return `${left} = ${this.convertExpression(right)}`;
    }

convertExpression(expression) {
    // Corrige a conversão de expressões e preserva as strings literais
    return expression
        .replace(/"[^"]*"/g, (str) => str)  // Preserva strings entre aspas
        .replace(/'[^']*'/g, (str) => str)  // Preserva strings entre aspas simples
        .replace(/and/g, '&&')              // Converte "and" para "&&"
        .replace(/or/g, '||')               // Converte "or" para "||"
        .replace(/not\s+([^\s()]+)/g, '!($1)') // Converte "not" para "!"
        .replace(/\btrue\b/g, 'true')       // Converte "true" para "true"
        .replace(/\bfalse\b/g, 'false')     // Converte "false" para "false"
        .replace(/\bnil\b/g, 'null')        // Converte "nil" para "null"
        .replace(/(\w+)\s*:\s*(\w+)/g, '$1.$2') // Converte tabelas usando ":" para "."
        .replace(/(\w+)\s*\[\s*([^\]]+)\s*\]/g, '$1[$2]') // Converte acessos a tabelas
        .replace(/(\w+)\s*\(\s*(.*)\s*\)/g, '$1($2)') // Converte chamadas de função
        .replace(/([^+\-*/%^=!<>]+)\s*([+\-*/%^=!<>])\s*([^+\-*/%^=!<>]+)/g, '$1 $2 $3') // Preserva expressões matemáticas
        .replace(/\b(\w+)\s*=\s*(\w+)\b/g, '$1 = $2'); // Corrige atribuições simples
}

    convertTable(line) {
        const content = line.slice(1, -1).trim();
        const properties = content.split(/,(?![^\{\[\}\]])/).map(prop => prop.trim()).map(prop => {
            const [key, value] = prop.split('=').map(s => s.trim());
            const jsKey = key.replace(/['"]/g, '');
            const jsValue = this.convertExpression(value);
            return `${jsKey}: ${jsValue}`;
        }).join(', ');
        return `let table = { ${properties} };`;
    }

    execute(jsCode, outputDiv) {
        try {
            // Redefine console.log para capturar a saída
            const originalConsoleLog = console.log;
            const consoleOutput = [];
            console.log = function(...args) {
                consoleOutput.push(...args);
            };

            // Executa o código JavaScript
            new Function(jsCode)();

            // Restaura console.log e exibe a saída
            console.log = originalConsoleLog;
            outputDiv.textContent = consoleOutput.join('\n');
        } catch (error) {
            outputDiv.textContent = `Error: ${error.message}`;
        }
    }
}

// Adiciona a classe ao objeto global para ser acessível na página.
window.LuaExecute = LuaExecute;
