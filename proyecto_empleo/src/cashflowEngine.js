/**
 * ══════════════════════════════════════════════════════════════
 * CASHFLOW ENGINE: Motor de Simulación de Flujo de Caja a 24 Meses
 * ══════════════════════════════════════════════════════════════
 * 
 * Funciones puras de cálculo.
 * Sin dependencias de UI, 100% testeable y reutilizable.
 */

/**
 * Interpola linealmente los trials generados a partir de la inversión
 * usando la tabla histórica:
 * $0=0, $5k=290, $10k=500, $15k=650, $20k=760, $30k=900
 */
export function interpolateTrials(spend, history) {
  if (spend <= 0) return 0;
  if (spend >= history[history.length - 1].spend) {
    return history[history.length - 1].trials;
  }

  for (let i = 0; i < history.length - 1; i++) {
    const p1 = history[i];
    const p2 = history[i + 1];
    if (spend >= p1.spend && spend <= p2.spend) {
      const slope = (p2.trials - p1.trials) / (p2.spend - p1.spend);
      return p1.trials + slope * (spend - p1.spend);
    }
  }
  return 0;
}

/**
 * Ejecuta la simulación de 24 meses dado un config y una estrategia.
 *
 * @param {Object} config - Configuración del negocio (SIMULATOR_CONFIG)
 * @param {Object} strategy - { spendM1_12, spendM13_24, annualPlan, improvedConversion }
 * @returns {Object} { months: Array, minCash, minCashMonth, finalCash, finalClients, isViable }
 */
export function runSimulation(config, strategy) {
  const { initialState, rules, trialHistory } = config;
  const {
    minCashFloor,
    fixedCosts,
    monthlyChurnRate,
    organicClientsPerMonth,
    marginPerClient,
    salesSalary,
    salesCapacity,
    commissionPerPaidClient,
    annualPlanPrice,
    annualPlanMargin,
    annualPlanAdoptionRate,
  } = rules;

  const conversionRate = strategy.improvedConversion
    ? rules.improvedTrialConversion
    : rules.defaultTrialConversion;

  let currentCash = initialState.cash;
  let currentClients = initialState.activeClients;

  const months = [];
  let minCash = currentCash;
  let minCashMonth = 0;

  for (let m = 1; m <= 24; m++) {
    // 1. Determinar inversión del mes
    const spend = m <= 12 ? strategy.spendM1_12 : strategy.spendM13_24;

    // 2. Trials generados
    const trials = interpolateTrials(spend, trialHistory);

    // 3. Vendedoras requeridas
    const vendedoras = trials > 0 ? Math.ceil(trials / salesCapacity) : 0;

    // 4. Clientes nuevos
    const clientesPaid = trials * conversionRate;
    const clientesNuevosTotales = clientesPaid + organicClientsPerMonth;

    // 5. Clientes activos al fin de mes
    // Churn aplica a los clientes activos del mes anterior: (prev * 0.94) + nuevos
    const clientesActivosFinMes = (currentClients * (1 - monthlyChurnRate)) + clientesNuevosTotales;

    // 6. Entradas (Ingresos / Margen recaudado)
    let entradas = 0;
    if (strategy.annualPlan) {
      // Si plan anual está activo:
      // 10% de clientes nuevos pagan $240 upfront (margen de $187.20)
      // 90% pagan normal $19.50 mensual
      // La base existente paga $19.50 mensual
      const nuevosAnuales = clientesNuevosTotales * annualPlanAdoptionRate;
      const clientesMensuales = clientesActivosFinMes - nuevosAnuales;
      entradas = (clientesMensuales * marginPerClient) + (nuevosAnuales * annualPlanMargin);
    } else {
      // Fórmula estándar estricta del caso:
      // Entradas = Clientes Activos Fin de Mes * $19.50
      entradas = clientesActivosFinMes * marginPerClient;
    }

    // 7. Salidas (Egresos)
    // Inversión + (Vendedoras * 1200) + (Clientes Paid * 20) + 14000
    const comisiones = clientesPaid * commissionPerPaidClient;
    const costoVendedoras = vendedoras * salesSalary;
    const salidas = spend + costoVendedoras + comisiones + fixedCosts;

    // 8. Flujo Neto y Caja Final
    const flujoNeto = entradas - salidas;
    const cajaFinal = currentCash + flujoNeto;

    // Registro del mes
    months.push({
      mes: m,
      inversion: spend,
      trials: Math.round(trials * 10) / 10,
      vendedoras,
      clientesPaid: Math.round(clientesPaid * 10) / 10,
      clientesNuevosTotales: Math.round(clientesNuevosTotales * 10) / 10,
      clientesActivosPrevios: Math.round(currentClients * 10) / 10,
      clientesActivosFinMes: Math.round(clientesActivosFinMes * 100) / 100,
      entradas: Math.round(entradas * 100) / 100,
      costoVendedoras,
      comisiones: Math.round(comisiones * 100) / 100,
      costosFijos: fixedCosts,
      salidas: Math.round(salidas * 100) / 100,
      flujoNeto: Math.round(flujoNeto * 100) / 100,
      cajaInicial: Math.round(currentCash * 100) / 100,
      cajaFinal: Math.round(cajaFinal * 100) / 100,
      isUnderFloor: cajaFinal < minCashFloor,
    });

    if (cajaFinal < minCash) {
      minCash = cajaFinal;
      minCashMonth = m;
    }

    // Actualizar estados para el siguiente mes
    currentCash = cajaFinal;
    currentClients = clientesActivosFinMes;
  }

  const finalMonth = months[months.length - 1];
  const isViable = minCash >= minCashFloor;

  return {
    months,
    minCash: Math.round(minCash * 100) / 100,
    minCashMonth,
    finalCash: finalMonth.cajaFinal,
    finalClients: Math.round(finalMonth.clientesActivosFinMes),
    isViable,
    strategy,
  };
}

/**
 * Formatea número a moneda
 */
export function formatMoney(val) {
  if (typeof val !== 'number' || isNaN(val)) return '$0';
  return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * ══════════════════════════════════════════════════════════════
 * GOAL SEEK: Búsqueda Binaria para Maximizar Inversión Segura
 * ══════════════════════════════════════════════════════════════
 *
 * Encuentra la máxima inversión mensual en anuncios que mantiene
 * la caja mínima por encima o igual al piso de seguridad ($10.000).
 *
 * Complejidad: O(log(Max_Spend) * 24 meses) -> ~15 iteraciones (< 2ms).
 *
 * @param {Object} config - SIMULATOR_CONFIG
 * @param {Object} options - { annualPlan, improvedConversion, isUniform (aplica a M1-24 o por fase) }
 * @returns {Object} { optimalSpend, simulation, iterations, executionTimeMs }
 */
export function goalSeekMaxSafeSpend(config, options = {}) {
  const startTime = performance.now();
  const minFloor = config.rules.minCashFloor; // $10.000

  let low = 0;
  let high = 30000;
  let optimalSpend = 0;
  let bestSim = null;
  let iterations = 0;

  // Búsqueda binaria al dólar exacto
  while (low <= high) {
    iterations++;
    const mid = Math.floor((low + high) / 2);

    const testStrategy = {
      spendM1_12: mid,
      spendM13_24: options.twoPhases ? Math.min(30000, Math.floor(mid * 1.5)) : mid,
      annualPlan: options.annualPlan ?? false,
      improvedConversion: options.improvedConversion ?? false,
    };

    const sim = runSimulation(config, testStrategy);

    if (sim.minCash >= minFloor) {
      // Es seguro: podemos intentar gastar más
      optimalSpend = mid;
      bestSim = sim;
      low = mid + 1;
    } else {
      // Perfora el piso de $10.000: debemos reducir inversión
      high = mid - 1;
    }
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(2);

  return {
    optimalSpend,
    simulation: bestSim || runSimulation(config, {
      spendM1_12: 0,
      spendM13_24: 0,
      annualPlan: options.annualPlan,
      improvedConversion: options.improvedConversion,
    }),
    iterations,
    executionTimeMs,
  };
}

/**
 * GOAL SEEK: Búsqueda Binaria para Meta Específica de Clientes
 * 
 * Encuentra la inversión mensual requerida para alcanzar exactamente
 * X clientes al Mes 24.
 *
 * @param {Object} config - SIMULATOR_CONFIG
 * @param {number} targetClients - Meta de clientes al Mes 24 (ej: 2000)
 * @param {Object} options - { annualPlan, improvedConversion }
 * @returns {Object} { requiredSpend, simulation, iterations, isSafe, executionTimeMs }
 */
export function goalSeekTargetClients(config, targetClients, options = {}) {
  const startTime = performance.now();

  let low = 0;
  let high = 30000;
  let requiredSpend = 0;
  let bestSim = null;
  let iterations = 0;

  while (low <= high) {
    iterations++;
    const mid = Math.floor((low + high) / 2);

    const testStrategy = {
      spendM1_12: mid,
      spendM13_24: mid,
      annualPlan: options.annualPlan ?? false,
      improvedConversion: options.improvedConversion ?? false,
    };

    const sim = runSimulation(config, testStrategy);

    if (sim.finalClients < targetClients) {
      // Necesitamos más clientes: aumentar inversión
      requiredSpend = mid;
      bestSim = sim;
      low = mid + 1;
    } else {
      // Alcanzamos o superamos la meta: buscar si se puede con menor gasto
      requiredSpend = mid;
      bestSim = sim;
      high = mid - 1;
    }
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(2);

  return {
    requiredSpend,
    simulation: bestSim,
    iterations,
    isSafe: bestSim ? bestSim.isViable : false,
    executionTimeMs,
  };
}

