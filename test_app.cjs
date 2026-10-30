const fs = require('fs');
const content = fs.readFileSync('c:/Users/LENOV/Downloads/Proyecto empleabilidad/proyecto_empleo/public/index_standalone.html', 'utf-8');

// Extraer todo el código dentro de <script> ... </script> que define appData
const match = content.match(/<script>([\s\S]*?)<\/script>[\s\n]*<\/body>/);
if (!match) {
  console.error("No script match");
  process.exit(1);
}

// Emular un mini entorno de navegador
global.window = {};
global.document = {
  getElementById: (id) => null
};
global.localStorage = {
  getItem: () => 'dark',
  setItem: () => {}
};
global.Chart = function() {
  return {
    destroy: () => {},
    update: () => {},
    resize: () => {},
    data: { datasets: [{ data: [] }] }
  };
};

try {
  eval(match[1]);
  console.log("Script evaluated successfully.");
  const app = appData();
  app.$watch = (k, fn) => {};
  app.$nextTick = (fn) => fn && fn();
  app.initApp();

  console.log("simCurrent.months length:", app.simCurrent.months ? app.simCurrent.months.length : "undefined");
  if (app.simCurrent.months && app.simCurrent.months.length > 0) {
    console.log("First month:", app.simCurrent.months[0]);
    console.log("Last month:", app.simCurrent.months[23]);
  }
} catch (e) {
  console.error("RUNTIME ERROR IN APPDATA:", e);
}
