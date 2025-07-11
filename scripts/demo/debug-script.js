const fs = require('fs');
const path = require('path');

// Read the seed-demo-data.ts file
const seedScriptPath = path.join(__dirname, 'seed-demo-data.ts');
const content = fs.readFileSync(seedScriptPath, 'utf8');

// Log the content for debugging
console.log('File content analysis:');
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);

// Check for problematic export statements
const exportLines = lines
  .map((line, index) => ({ line, index: index + 1 }))
  .filter(({ line }) => line.includes('export'));

console.log('\nExport statements found:');
exportLines.forEach(({ line, index }) => {
  console.log(`Line ${index}: ${line}`);
});

// Check for hidden characters or BOM
const firstFewBytes = Buffer.from(content.slice(0, 50));
console.log('\nFirst few bytes (hex):');
console.log(firstFewBytes.toString('hex'));

// Write a clean version of the file
const cleanContent = content
  .replace(/export\s*{[^}]*}/g, '// export removed')
  .replace(/export\s+/g, '// export removed - ');

const cleanPath = path.join(__dirname, 'seed-demo-data.clean.ts');
fs.writeFileSync(cleanPath, cleanContent);
console.log(`\nCleaned file written to: ${cleanPath}`);
