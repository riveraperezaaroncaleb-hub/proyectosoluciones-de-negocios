/**
 * ══════════════════════════════════════════════════════════════
 * ENGINE: Motor de cálculo de Unit Economics
 * ══════════════════════════════════════════════════════════════
 *
 * Este archivo contiene TODAS las fórmulas de negocio.
 * Es independiente de React — funciones puras de JS.
 *
 * ─── PARA ADAPTAR A OTRO NEGOCIO ────────────────────────────
 *
 * E-COMMERCE (pedido único):
 *   - Cambia monthlyPrice → averageOrderValue
 *   - Cambia grossMargin → margenPorPedido
 *   - LTV = AOV * margen * frecuenciaAnual * añosRetención
 *   - No hay churn mensual, usa tasa de recompra
 *   - CAC = (adSpend + costos) / pedidosNuevos
 *
 * LEAD GEN:
 *   - Cambia monthlyPrice → valorPorLead
 *   - CAC = costoDeAdquisición / leadsCalificados
 *   - LTV = valorPorLead * tasaDeCierre * valorContrato
 *
 * Para cambiar: modifica las funciones en este archivo y
 * actualiza el CONFIG en config.js con los nuevos labels/ranges.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Calcula todos los Unit Economics a partir de los inputs actuales.
 * @param {Object} inputs - Estado actual de todos los sliders
 * @returns {Object} Todos los KPIs calculados
 */
export function calcularUnitEconomics(inputs) {
  const {
    adSpend,
    conversionRate,
    monthlyPrice,
    grossMargin,
    monthlyChurn,
    annualPlanPct,
    commissionPerClient,
    salesSalary,
    salesCapacity,
    organicClients,
    trialSlope,
  } = inputs;

  // ─── 1. Trials generados (interpolación lineal) ──────────
  const trials = adSpend * trialSlope;

  // ─── 2. Clientes nuevos pagos ────────────────────────────
  const clientesPaid = trials * (conversionRate / 100);

  // ─── 3. Vendedoras necesarias ────────────────────────────
  const vendedoras = trials > 0 ? Math.ceil(trials / salesCapacity) : 0;

  // ─── 4. Costo total de adquisición ───────────────────────
  const costoTotal =
    adSpend +
    vendedoras * salesSalary +
    clientesPaid * commissionPerClient;

  // ─── 5. CAC Paid ─────────────────────────────────────────
  const cacPaid = clientesPaid > 0 ? costoTotal / clientesPaid : 0;

  // ─── 6. CAC Blended (incluye orgánicos) ──────────────────
  const totalClientes = clientesPaid + organicClients;
  const cacBlended = totalClientes > 0 ? costoTotal / totalClientes : 0;

  // ─── 7. Margen mensual por cliente ───────────────────────
  const margenMensual = monthlyPrice * (grossMargin / 100);

  // ─── 8. LTV a 24 meses (suma iterativa) ──────────────────
  const churnDecimal = monthlyChurn / 100;
  let ltv24 = 0;
  let paybackMonth = null;

  // Cash curves para gráfico
  const cashCurveMonthly = [{ month: 0, value: -cacPaid }];
  const cashCurveAnnual = [{ month: 0, value: -cacPaid }];

  const annualPayment = monthlyPrice * 12 * 0.85; // 15% descuento anual
  const annualMargin = annualPayment * (grossMargin / 100);

  for (let m = 1; m <= 24; m++) {
    const retention = Math.pow(1 - churnDecimal, m);
    ltv24 += margenMensual * retention;

    // ── Cash curve: cliente mensual ──
    const cumMonthly = -cacPaid + ltv24;
    cashCurveMonthly.push({ month: m, value: round2(cumMonthly) });

    // ── Cash curve: cliente anual ──
    let cumAnnual;
    if (m <= 12) {
      // Primer año: pago upfront en mes 1
      cumAnnual = -cacPaid + annualMargin;
    } else {
      // Segundo año: renovación con retención desde mes 12
      const retention2 = Math.pow(1 - churnDecimal, m - 12);
      cumAnnual = -cacPaid + annualMargin + annualMargin * retention2;
    }
    cashCurveAnnual.push({ month: m, value: round2(cumAnnual) });

    // Payback: primer mes donde se recupera el CAC
    if (paybackMonth === null && cumMonthly >= 0) {
      paybackMonth = m;
    }
  }

  // ─── 9. LTV:CAC ratios ──────────────────────────────────
  const ltvCacPaid = cacPaid > 0 ? ltv24 / cacPaid : 0;
  const ltvCacBlended = cacBlended > 0 ? ltv24 / cacBlended : 0;

  // ─── 10. CAC Marginal ────────────────────────────────────
  // Costo de adquirir 1 cliente adicional
  const trialsPlusOne = trials + (conversionRate > 0 ? 1 / (conversionRate / 100) : 0);
  const vendedorasNew = trialsPlusOne > 0 ? Math.ceil(trialsPlusOne / salesCapacity) : 0;
  const costoExtraVendedora = (vendedorasNew - vendedoras) * salesSalary;
  const costPerTrial = trialSlope > 0 ? 1 / trialSlope : 0;
  const trialsPerClient = conversionRate > 0 ? 1 / (conversionRate / 100) : 0;
  const cacMarginal = costPerTrial * trialsPerClient + commissionPerClient + costoExtraVendedora;

  // ─── 11. Funnel ──────────────────────────────────────────
  const funnel = [
    { label: 'Inversión', value: adSpend, color: '#6366f1' },
    { label: 'Trials', value: Math.round(trials), color: '#8b5cf6' },
    { label: 'Clientes Pagos', value: Math.round(clientesPaid), color: '#06b6d4' },
  ];

  return {
    trials: Math.round(trials),
    clientesPaid: Math.round(clientesPaid),
    vendedoras,
    cacPaid: round2(cacPaid),
    cacBlended: round2(cacBlended),
    margenMensual: round2(margenMensual),
    ltv24: round2(ltv24),
    ltvCacPaid: round2(ltvCacPaid),
    ltvCacBlended: round2(ltvCacBlended),
    paybackMonth: paybackMonth ?? '>24',
    cacMarginal: round2(cacMarginal),
    cashCurveMonthly,
    cashCurveAnnual,
    funnel,
    totalClientes: Math.round(totalClientes),
    annualPlanPct,
  };
}

/**
 * Determina el color semáforo para LTV:CAC
 * @param {number} ratio
 * @returns {'red'|'yellow'|'green'}
 */
export function getSemaphoreColor(ratio) {
  if (ratio < 1) return 'red';
  if (ratio < 3) return 'yellow';
  return 'green';
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(value, currency = '$') {
  if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
  return `${currency}${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Redondea a 2 decimales
 */
function round2(n) {
  return Math.round(n * 100) / 100;
}
