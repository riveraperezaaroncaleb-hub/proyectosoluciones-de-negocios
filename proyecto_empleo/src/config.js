/**
 * ══════════════════════════════════════════════════════════════
 * CONFIG: Configuración del modelo de negocio
 * ══════════════════════════════════════════════════════════════
 *
 * Cambia este archivo para adaptar el dashboard a otro negocio.
 * Solo necesitas modificar:
 *   1. meta (nombre, tipo, moneda)
 *   2. defaults (valores iniciales)
 *   3. sliderRanges (rangos de los controles)
 *   4. labels (textos de la interfaz)
 *
 * El motor de cálculo (engine.js) se adapta automáticamente.
 * ══════════════════════════════════════════════════════════════
 */

const CONFIG = {
  // ── Metadatos del negocio ──────────────────────────────────
  meta: {
    businessName: 'Agendo',
    businessType: 'saas', // 'saas' | 'ecommerce' | 'leadgen'
    currency: '$',
    horizonMonths: 24,
    description: 'SaaS B2B de reservas para barberías',
    logo: '📅',
  },

  // ── Valores por defecto (estado inicial de los sliders) ────
  defaults: {
    adSpend: 10000,
    conversionRate: 14,
    monthlyPrice: 25,
    grossMargin: 78,
    monthlyChurn: 6,
    annualPlanPct: 10,
    commissionPerClient: 20,
    salesSalary: 1200,
    salesCapacity: 500,
    organicClients: 50,
    trialSlope: 0.03,
  },

  // ── Rangos y pasos de los sliders ──────────────────────────
  sliderRanges: {
    adSpend:              { min: 0,     max: 30000, step: 500 },
    conversionRate:       { min: 0,     max: 30,    step: 0.5 },
    monthlyPrice:         { min: 5,     max: 200,   step: 1 },
    grossMargin:          { min: 10,    max: 100,   step: 1 },
    monthlyChurn:         { min: 0,     max: 30,    step: 0.5 },
    annualPlanPct:        { min: 0,     max: 100,   step: 1 },
    commissionPerClient:  { min: 0,     max: 100,   step: 1 },
    salesSalary:          { min: 0,     max: 5000,  step: 100 },
    salesCapacity:        { min: 50,    max: 2000,  step: 50 },
    organicClients:       { min: 0,     max: 500,   step: 5 },
    trialSlope:           { min: 0.005, max: 0.1,   step: 0.005 },
  },

  // ── Labels para la UI ─────────────────────────────────────
  labels: {
    adSpend:              'Inversión en Anuncios',
    conversionRate:       'Conversión Trial → Pago (%)',
    monthlyPrice:         'Precio Mensual',
    grossMargin:          'Margen Bruto (%)',
    monthlyChurn:         'Churn Mensual (%)',
    annualPlanPct:        '% Clientes Plan Anual',
    commissionPerClient:  'Comisión por Cliente',
    salesSalary:          'Sueldo Vendedora',
    salesCapacity:        'Capacidad (Trials/Vendedora)',
    organicClients:       'Clientes Orgánicos',
    trialSlope:           'Pendiente Trials (slope)',
  },

  // ── Sufijos para mostrar valores ──────────────────────────
  suffixes: {
    adSpend:              '',
    conversionRate:       '%',
    monthlyPrice:         '',
    grossMargin:          '%',
    monthlyChurn:         '%',
    annualPlanPct:        '%',
    commissionPerClient:  '',
    salesSalary:          '',
    salesCapacity:        '',
    organicClients:       '',
    trialSlope:           '',
  },

  // ── Prefijos para mostrar valores (moneda) ────────────────
  prefixes: {
    adSpend:              '$',
    conversionRate:       '',
    monthlyPrice:         '$',
    grossMargin:          '',
    monthlyChurn:         '',
    annualPlanPct:        '',
    commissionPerClient:  '$',
    salesSalary:          '$',
    salesCapacity:        '',
    organicClients:       '',
    trialSlope:           '',
  },

  // ── Reporte de Valeria (la "trampa") ──────────────────────
  valeriaReport: {
    claimedLtvCac: 2.4,
    explanation:
      'Valeria usa el CAC Blended (mezclando orgánicos que no costaron nada) y no resta los costos reales de vendedoras y comisiones. El cálculo real con CAC Paid es diferente.',
  },
};

export default CONFIG;
