const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAppState.test.ts', 'utf8');

// The file has an extra '});' at the end now due to previous patches.
if (code.endsWith('\n});\n});\n')) {
    code = code.substring(0, code.length - 5);
} else if (code.endsWith('\n});\n')) {
    // If there is only one extra, remove it and see.
    code = code.substring(0, code.length - 4);
}

fs.writeFileSync('src/hooks/useAppState.test.ts', code);
console.log("Patched file end again");
