/**
 * ══════════════════════════════════════════════════════════════
 * URL STATE UTILITY — Estado Compartible Cero-Backend
 * ══════════════════════════════════════════════════════════════
 * Permite serializar y deserializar el estado completo de la
 * simulación financiera en la URL para compartir escenarios
 * con inversores, miembros del consejo o colegas mediante un enlace.
 * ══════════════════════════════════════════════════════════════
 */

import CONFIG from '../config';

// Parámetros compactos para mantener la URL limpia y legible
const PARAM_KEYS = {
  tab: 'tab',
  // Nivel 2
  adSpend: 'ad',
  conversionRate: 'cr',
  monthlyPrice: 'mp',
  grossMargin: 'gm',
  monthlyChurn: 'mc',
  annualPlanPct: 'ap',
  commissionPerClient: 'cc',
  salesSalary: 'ss',
  salesCapacity: 'sc',
  organicClients: 'oc',
  trialSlope: 'ts',
  // Nivel 3 (Simulador de Caja)
  spendM1_12: 's1',
  spendM13_24: 's2',
  annualPlan: 'ann',
  improvedConversion: 'ic',
};

/**
 * Lee los parámetros de la URL actual y devuelve el estado inicial
 */
export function getInitialStateFromUrl() {
  if (typeof window === 'undefined') {
    return {
      activeTab: 'level3',
      inputs: { ...CONFIG.defaults },
      cashflowState: {
        spendM1_12: 10000,
        spendM13_24: 20000,
        annualPlan: false,
        improvedConversion: false,
      },
      hasUrlParams: false,
    };
  }

  const params = new URLSearchParams(window.location.search);
  let hasUrlParams = false;

  // 1. Tab activo
  let activeTab = 'level3';
  if (params.has(PARAM_KEYS.tab)) {
    const t = params.get(PARAM_KEYS.tab);
    if (t === 'level2' || t === 'level3') {
      activeTab = t;
      hasUrlParams = true;
    }
  }

  // 2. Inputs de Nivel 2
  const inputs = { ...CONFIG.defaults };
  Object.keys(CONFIG.defaults).forEach((key) => {
    const paramKey = PARAM_KEYS[key];
    if (paramKey && params.has(paramKey)) {
      const val = parseFloat(params.get(paramKey));
      if (!isNaN(val)) {
        inputs[key] = val;
        hasUrlParams = true;
      }
    }
  });

  // 3. Inputs de Nivel 3
  const cashflowState = {
    spendM1_12: 10000,
    spendM13_24: 20000,
    annualPlan: false,
    improvedConversion: false,
  };

  if (params.has(PARAM_KEYS.spendM1_12)) {
    cashflowState.spendM1_12 = parseInt(params.get(PARAM_KEYS.spendM1_12), 10) || 10000;
    hasUrlParams = true;
  }
  if (params.has(PARAM_KEYS.spendM13_24)) {
    cashflowState.spendM13_24 = parseInt(params.get(PARAM_KEYS.spendM13_24), 10) || 20000;
    hasUrlParams = true;
  }
  if (params.has(PARAM_KEYS.annualPlan)) {
    cashflowState.annualPlan = params.get(PARAM_KEYS.annualPlan) === '1' || params.get(PARAM_KEYS.annualPlan) === 'true';
    hasUrlParams = true;
  }
  if (params.has(PARAM_KEYS.improvedConversion)) {
    cashflowState.improvedConversion = params.get(PARAM_KEYS.improvedConversion) === '1' || params.get(PARAM_KEYS.improvedConversion) === 'true';
    hasUrlParams = true;
  }

  return { activeTab, inputs, cashflowState, hasUrlParams };
}

/**
 * Genera la URL completa con los parámetros del estado actual
 */
export function buildShareableUrl({ activeTab, inputs, cashflowState }) {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(PARAM_KEYS.tab, activeTab);

  if (activeTab === 'level2' && inputs) {
    Object.keys(CONFIG.defaults).forEach((key) => {
      if (inputs[key] !== undefined && inputs[key] !== CONFIG.defaults[key]) {
        const paramKey = PARAM_KEYS[key];
        if (paramKey) {
          url.searchParams.set(paramKey, inputs[key]);
        }
      }
    });
  } else if (activeTab === 'level3' && cashflowState) {
    if (cashflowState.spendM1_12 !== undefined) {
      url.searchParams.set(PARAM_KEYS.spendM1_12, cashflowState.spendM1_12);
    }
    if (cashflowState.spendM13_24 !== undefined) {
      url.searchParams.set(PARAM_KEYS.spendM13_24, cashflowState.spendM13_24);
    }
    if (cashflowState.annualPlan) {
      url.searchParams.set(PARAM_KEYS.annualPlan, '1');
    }
    if (cashflowState.improvedConversion) {
      url.searchParams.set(PARAM_KEYS.improvedConversion, '1');
    }
  }

  return url.toString();
}

/**
 * Actualiza silenciosamente la URL del navegador sin recargar la página
 */
export function syncUrlWithState({ activeTab, inputs, cashflowState }) {
  if (typeof window === 'undefined') return;
  const newUrl = buildShareableUrl({ activeTab, inputs, cashflowState });
  window.history.replaceState(null, '', newUrl);
}
