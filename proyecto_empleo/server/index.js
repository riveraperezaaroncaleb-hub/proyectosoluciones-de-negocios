import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────
// Directorio donde se guardan los escenarios
// ─────────────────────────────────────────────────────────────────
const SCENARIOS_DIR = join(__dirname, 'scenarios');
if (!existsSync(SCENARIOS_DIR)) mkdirSync(SCENARIOS_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────
// CONFIG por defecto: Agendo (SaaS B2B de reservas para barberías)
// ─────────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  meta: {
    businessName: 'Agendo',
    businessType: 'saas',          // 'saas' | 'ecommerce' | 'leadgen'
    currency: '$',
    horizonMonths: 24,
    description: 'SaaS B2B de reservas para barberías',
  },
  defaults: {
    adSpend:           10000,     // Inversión en anuncios
    conversionRate:    14,        // % trial → pago
    monthlyPrice:      25,        // Precio mensual
    grossMargin:       78,        // Margen bruto %
    monthlyChurn:      6,         // Churn mensual %
    annualPlanPct:     10,        // % clientes en plan anual
    commissionPerClient: 20,     // Comisión por cliente
    salesSalary:       1200,      // Sueldo vendedora
    salesCapacity:     500,       // Trials que maneja una vendedora
    organicClients:    50,        // Clientes orgánicos
    trialSlope:        0.03,     // Pendiente de interpolación lineal (trials = inversión * slope)
  },
  sliderRanges: {
    adSpend:           { min: 0,  max: 30000, step: 500 },
    conversionRate:    { min: 0,  max: 30,    step: 0.5 },
    monthlyPrice:      { min: 5,  max: 200,   step: 1 },
    grossMargin:       { min: 10, max: 100,   step: 1 },
    monthlyChurn:      { min: 0,  max: 30,    step: 0.5 },
    annualPlanPct:     { min: 0,  max: 100,   step: 1 },
    commissionPerClient: { min: 0, max: 100, step: 1 },
    salesSalary:       { min: 0,  max: 5000,  step: 100 },
    salesCapacity:     { min: 50, max: 2000,  step: 50 },
    organicClients:    { min: 0,  max: 500,   step: 5 },
    trialSlope:        { min: 0.005, max: 0.1, step: 0.005 },
  },
  labels: {
    adSpend:           'Inversión en Anuncios',
    conversionRate:    'Conversión Trial → Pago (%)',
    monthlyPrice:      'Precio Mensual',
    grossMargin:       'Margen Bruto (%)',
    monthlyChurn:      'Churn Mensual (%)',
    annualPlanPct:     '% Clientes Plan Anual',
    commissionPerClient: 'Comisión por Cliente',
    salesSalary:       'Sueldo Vendedora',
    salesCapacity:     'Capacidad (Trials/Vendedora)',
    organicClients:    'Clientes Orgánicos',
    trialSlope:        'Pendiente Trials (slope)',
  },
  // ─────────────────────────────────────────────────────────────
  // "Reporte de Valeria" — el dato falso que el caso pide evidenciar
  // ─────────────────────────────────────────────────────────────
  valeriaReport: {
    claimedLtvCac: 2.4,
    explanation: 'Valeria usa el CAC blended (mezclando orgánicos) y no resta los costos reales de adquisición. El valor real es diferente.',
  },
};

// ═══════════════════════════════════════════════════════════════
// RUTAS API
// ═══════════════════════════════════════════════════════════════

// GET /api/config  →  devuelve el CONFIG base
app.get('/api/config', (_req, res) => {
  res.json(DEFAULT_CONFIG);
});

// POST /api/calculate  →  recibe inputs, devuelve resultados
app.post('/api/calculate', (req, res) => {
  try {
    const results = calcularUnitEconomics(req.body);
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/scenarios  →  lista escenarios guardados
app.get('/api/scenarios', (_req, res) => {
  const files = existsSync(SCENARIOS_DIR)
    ? readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
    : [];
  res.json(files);
});

// POST /api/scenarios/:name  →  guarda un escenario
app.post('/api/scenarios/:name', (req, res) => {
  const filePath = join(SCENARIOS_DIR, `${req.params.name}.json`);
  writeFileSync(filePath, JSON.stringify(req.body, null, 2));
  res.json({ saved: req.params.name });
});

// GET /api/scenarios/:name  →  carga un escenario
app.get('/api/scenarios/:name', (req, res) => {
  const filePath = join(SCENARIOS_DIR, `${req.params.name}.json`);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  res.json(data);
});

// ═══════════════════════════════════════════════════════════════
// MOTOR DE CÁLCULO (espejo del frontend — se usa como validación)
// ═══════════════════════════════════════════════════════════════

/**
 * calcularUnitEconomics(inputs)
 *
 * Recibe el estado actual de los sliders y devuelve todos los KPIs.
 *
 * ──────────────────────────────────────────────────────────────
 * PARA ADAPTAR A OTRO NEGOCIO:
 *
 * E-commerce (pedido único):
 *   - Reemplaza monthlyPrice por averageOrderValue
 *   - Reemplaza grossMargin por margenPorPedido
 *   - LTV = AOV * margen * frecuenciaAnual * añosRetención
 *   - No hay churn mensual, usa tasa de recompra
 *
 * Lead Gen:
 *   - Reemplaza monthlyPrice por valorPorLead
 *   - CAC = costoDeAdquisición / leadsGenerados
 *   - LTV = valorPorLead * tasaDeCierre * valorContrato
 * ──────────────────────────────────────────────────────────────
 */
function calcularUnitEconomics(inputs) {
  const {
    adSpend, conversionRate, monthlyPrice, grossMargin,
    monthlyChurn, annualPlanPct, commissionPerClient,
    salesSalary, salesCapacity, organicClients, trialSlope,
  } = inputs;

  // Trials generados (interpolación lineal)
  const trials = adSpend * trialSlope;

  // Clientes nuevos pagos
  const clientesPaid = trials * (conversionRate / 100);

  // Vendedoras necesarias
  const vendedoras = Math.ceil(trials / salesCapacity) || 0;

  // Costo total de adquisición
  const costoTotal = adSpend + (vendedoras * salesSalary) + (clientesPaid * commissionPerClient);

  // CAC Paid
  const cacPaid = clientesPaid > 0 ? costoTotal / clientesPaid : 0;

  // CAC Blended (incluye orgánicos)
  const totalClientes = clientesPaid + organicClients;
  const cacBlended = totalClientes > 0 ? costoTotal / totalClientes : 0;

  // Margen mensual por cliente
  const margenMensual = monthlyPrice * (grossMargin / 100);

  // LTV a 24 meses (suma iterativa con retención)
  const churnDecimal = monthlyChurn / 100;
  let ltv24 = 0;
  const cashCurveMonthly = [0]; // mes 0 = -CAC
  const cashCurveAnnual = [0];
  let paybackMonth = null;

  for (let m = 1; m <= 24; m++) {
    const retention = Math.pow(1 - churnDecimal, m);
    ltv24 += margenMensual * retention;

    // Cash curve mensual: acumula margen * retención - CAC
    const cumMonthly = -cacPaid + ltv24;
    cashCurveMonthly.push(cumMonthly);

    // Cash curve anual: el cliente anual paga 12 meses up-front con descuento
    const annualPayment = monthlyPrice * 12 * 0.85; // 15% descuento anual
    const annualMargin = annualPayment * (grossMargin / 100);
    let cumAnnual;
    if (m === 1) {
      cumAnnual = -cacPaid + annualMargin;
    } else if (m <= 12) {
      cumAnnual = -cacPaid + annualMargin;
    } else {
      // Segundo año: se renueva con retención
      const retention2 = Math.pow(1 - churnDecimal, m - 12);
      cumAnnual = -cacPaid + annualMargin + (annualMargin * retention2);
    }
    cashCurveAnnual.push(cumAnnual);

    // Payback: primer mes donde recuperamos el CAC
    if (paybackMonth === null && cumMonthly >= 0) {
      paybackMonth = m;
    }
  }

  // LTV:CAC ratios
  const ltvCacPaid = cacPaid > 0 ? ltv24 / cacPaid : 0;
  const ltvCacBlended = cacBlended > 0 ? ltv24 / cacBlended : 0;

  // CAC Marginal: costo del último cliente extra
  // Si añadimos 1 cliente más, ¿cuánto cuesta marginalmente?
  const trialsPlusOne = trials + (1 / (conversionRate / 100 || 1));
  const vendedorasNew = Math.ceil(trialsPlusOne / salesCapacity) || 0;
  const costoExtraVendedora = (vendedorasNew - vendedoras) * salesSalary;
  const cacMarginal = (1 / (trialSlope || 0.03)) * (1 / (conversionRate / 100 || 0.14))
    + commissionPerClient + costoExtraVendedora;

  // Funnel data
  const funnel = {
    inversion: adSpend,
    trials: Math.round(trials),
    clientesPagos: Math.round(clientesPaid),
  };

  return {
    trials: Math.round(trials),
    clientesPaid: Math.round(clientesPaid),
    vendedoras,
    cacPaid: Math.round(cacPaid * 100) / 100,
    cacBlended: Math.round(cacBlended * 100) / 100,
    margenMensual: Math.round(margenMensual * 100) / 100,
    ltv24: Math.round(ltv24 * 100) / 100,
    ltvCacPaid: Math.round(ltvCacPaid * 100) / 100,
    ltvCacBlended: Math.round(ltvCacBlended * 100) / 100,
    paybackMonth: paybackMonth ?? '>24',
    cacMarginal: Math.round(cacMarginal * 100) / 100,
    cashCurveMonthly,
    cashCurveAnnual,
    funnel,
    totalClientes,
  };
}

// ═══════════════════════════════════════════════════════════════
import { readdirSync } from 'fs';

app.listen(PORT, () => {
  console.log(`\n🚀 Agendo API corriendo en http://localhost:${PORT}`);
  console.log(`   GET  /api/config       → Config base`);
  console.log(`   POST /api/calculate    → Calcula Unit Economics`);
  console.log(`   GET  /api/scenarios    → Lista escenarios`);
  console.log(`   POST /api/scenarios/:n → Guarda escenario`);
  console.log(`   GET  /api/scenarios/:n → Carga escenario\n`);
});
