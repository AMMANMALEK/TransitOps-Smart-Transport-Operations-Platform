const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.js')) {
        callback(dirPath);
      }
    }
  });
}

console.log('--- SCANNING FILES FOR SYNTAX ERRORS ---');
let filesChecked = 0;
let errorsFound = 0;

walkDir('.', (filePath) => {
  filesChecked++;
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    // Using Function constructor to parse code for syntax errors without executing side effects
    new Function(code);
    // console.log(`✓ ${filePath} is syntactically correct.`);
  } catch (err) {
    errorsFound++;
    console.error(`❌ Syntax error in file: ${filePath}`);
    console.error(`   Error message: ${err.message}`);
  }
});

console.log(`\nScan complete. Checked ${filesChecked} files. Found ${errorsFound} syntax errors.`);
if (errorsFound > 0) {
  process.exitCode = 1;
}
