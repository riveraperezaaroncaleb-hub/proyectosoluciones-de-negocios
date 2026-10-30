/**
 * ══════════════════════════════════════════════════════════════
 * SIMULATOR_CONFIG: Configuración del Simulador de Caja a 24 Meses
 * ══════════════════════════════════════════════════════════════
 * 
 * Reutilizable para cualquier negocio:
 * Cambia estos valores para adaptar a SaaS, E-commerce, etc.
 */

export const SIMULATOR_CONFIG = {
  meta: {
    businessName: 'Agendo',
    level: 'Nivel 3: Simulador de Caja a 24 Meses',
    currency: '$',
    horizonMonths: 24,
  },

  // Estado Inicial (Mes 0)
  initialState: {
    cash: 60000,           // Caja inicial $60.000
    activeClients: 1150,   // Clientes activos iniciales
  },

  // Parámetros y reglas del caso Agendo
  rules: {
    minCashFloor: 10000,    // Piso de seguridad de caja
    fixedCosts: 14000,      // Costos fijos mensuales
    monthlyChurnRate: 0.06, // Churn mensual 6% (retención 94%)
    organicClientsPerMonth: 50, // Clientes orgánicos nuevos/mes
    monthlyPrice: 25,       // Precio mensual $25
    grossMarginRate: 0.78,  // Margen bruto 78%
    marginPerClient: 19.50, // 25 * 0.78 = $19.50
    defaultTrialConversion: 0.14, // 14%
    salesSalary: 1200,      // $1.200 por vendedora
    salesCapacity: 500,     // 500 trials por vendedora
    commissionPerPaidClient: 20, // $20 por cliente nuevo pagado por ads
    annualPlanPrice: 240,   // Plan anual $240 upfront
    annualPlanMargin: 240 * 0.78, // $187.20 margen upfront
    annualPlanAdoptionRate: 0.10, // 10% de clientes nuevos
    improvedTrialConversion: 0.20, // 20% para escenario optimizado
  },

  // Tabla histórica de inversión vs trials para interpolación lineal por tramos
  trialHistory: [
    { spend: 0, trials: 0 },
    { spend: 5000, trials: 290 },
    { spend: 10000, trials: 500 },
    { spend: 15000, trials: 650 },
    { spend: 20000, trials: 760 },
    { spend: 30000, trials: 900 },
  ],

  // Escenarios predefinidos para la comparativa
  presetScenarios: {
    hoy: {
      id: 'hoy',
      name: 'Plan Actual (Hoy)',
      description: 'Inversión conservadora de $10.000 fijos todos los meses',
      spendM1_12: 10000,
      spendM13_24: 10000,
      annualPlan: false,
      improvedConversion: false,
      color: '#06b6d4', // cyan
    },
    valeria: {
      id: 'valeria',
      name: 'Plan Valeria',
      description: 'Triplicar inversión a $30.000 fijos sin mejoras de retención/caja',
      spendM1_12: 30000,
      spendM13_24: 30000,
      annualPlan: false,
      improvedConversion: false,
      color: '#f43f5e', // rojo alerta
    },
    custom: {
      id: 'custom',
      name: 'Estrategia Personalizada',
      description: 'Ajustable con los sliders en tiempo real',
      spendM1_12: 10000,
      spendM13_24: 20000,
      annualPlan: false,
      improvedConversion: false,
      color: '#6366f1', // indigo
    },
    hacked: {
      id: 'hacked',
      name: 'Estrategia Óptima (Hack Nivel 1)',
      description: 'Escalonada ($10k → $20k) + Plan Anual Upfront + Conversión 20%',
      spendM1_12: 10000,
      spendM13_24: 20000,
      annualPlan: true,
      improvedConversion: true,
      color: '#10b981', // verde
    },
  },
};
