const fs = require('fs');
const content = fs.readFileSync('c:/Users/LENOV/Downloads/Proyecto empleabilidad/proyecto_empleo/public/index_standalone.html', 'utf-8');

const match = content.match(/<script>([\s\S]*?)<\/script>[\s\n]*<\/body>/);
const lines = match[1].split('\n');

for (let i = 1; i <= lines.length; i++) {
  const codeSnippet = lines.slice(0, i).join('\n');
  try {
    new Function(codeSnippet);
  } catch (e) {
    if (!e.message.includes('Unexpected end of input') && !e.message.includes('Unexpected token')) {
      console.log(`Line ${i}:`, lines[i - 1]);
      console.log(`Error:`, e.message);
      break;
    }
  }
}
