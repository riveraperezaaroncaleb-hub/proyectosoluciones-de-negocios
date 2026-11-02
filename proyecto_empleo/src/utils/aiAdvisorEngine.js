/**
 * ══════════════════════════════════════════════════════════════
 * AI ADVISOR ENGINE — Agendo Business Intelligence
 * ══════════════════════════════════════════════════════════════
 * Proporciona análisis cuantitativo estratégico, auditoría de
 * Unit Economics y puente directo hacia APIs de LLMs (Gemini / OpenAI).
 */

import { formatCurrency } from '../engine.js';

/**
 * Genera el contexto cuantitativo completo en texto estructurado
 * para alimentar tanto al motor local como a LLMs externos.
 */
export function buildSystemContext({ inputs, results, cashflowState, activeTab }) {
  const diffValeria = (2.4 - results.ltvCacPaid).toFixed(2);
  const isLtvHealthy = results.ltvCacPaid >= 3.0;
  const isPaybackHealthy = typeof results.paybackMonth === 'number' && results.paybackMonth <= 12;

  return `
CONTEXTO DE NEGOCIO — SAAS AGENDO (Reservas para Barberías):
- Inversión en Anuncios: $${inputs.adSpend.toLocaleString()} / mes
- Conversión Trial a Pago: ${inputs.conversionRate}%
- Precio Mensual Suscripción: $${inputs.monthlyPrice}
- Margen Bruto: ${inputs.grossMargin}%
- Churn Mensual: ${inputs.monthlyChurn}% (Vida media esperada: ${(100 / Math.max(inputs.monthlyChurn, 0.1)).toFixed(1)} meses)
- Clientes Orgánicos: ${inputs.organicClients} clientes/mes
- Clientes Pagos Adquiridos: ${results.clientesPaid} clientes/mes
- Vendedoras requeridas: ${results.vendedoras} (capacidad: ${inputs.salesCapacity} trials/vendedora, sueldo: $${inputs.salesSalary})
- Comisión por cliente: $${inputs.commissionPerClient}

MÉTRICAS UNIT ECONOMICS ACTUALES:
- CAC Paid Real: $${results.cacPaid.toFixed(2)} (Incluye ads + vendedoras + comisiones)
- CAC Blended: $${results.cacBlended.toFixed(2)} (Distorsionado por los ${inputs.organicClients} orgánicos)
- LTV a 24 Meses: $${results.ltv24.toFixed(2)} (Margen mensual neto: $${results.margenMensual.toFixed(2)})
- Relación LTV:CAC Paid: ${results.ltvCacPaid.toFixed(2)}x ${isLtvHealthy ? '(Saludable > 3x)' : '(Alerta: por debajo del umbral óptimo de 3x)'}
- Relación LTV:CAC Blended: ${results.ltvCacBlended.toFixed(2)}x
- Período de Recuperación (Payback): ${results.paybackMonth} meses ${isPaybackHealthy ? '(Sano ≤12m)' : '(Lento >12m)'}

CASO VALERIA (AUDITORÍA DE FRAUDE/ERROR METODOLÓGICO):
- Valeria reporta: LTV:CAC de 2.40x
- Realidad CAC Paid: ${results.ltvCacPaid.toFixed(2)}x
- Diferencia real: ${diffValeria}x. Valeria usa CAC Blended mezclando orgánicos gratis y omite salarios de vendedoras ($${inputs.salesSalary * results.vendedoras}) y comisiones ($${inputs.commissionPerClient * results.clientesPaid}).

SIMULACIÓN DE FLUJO DE CAJA A 24 MESES (NIVEL 3):
- Inversión M1-12: $${cashflowState?.spendM1_12?.toLocaleString() || '10,000'} / mes
- Inversión M13-24: $${cashflowState?.spendM13_24?.toLocaleString() || '20,000'} / mes
- Plan Anual con 10% dcto: ${cashflowState?.annualPlan ? 'ACTIVADO' : 'DESACTIVADO'}
- Conversión Optimizada al 20%: ${cashflowState?.improvedConversion ? 'ACTIVADA' : 'DESACTIVADA'}
Vista actual en pantalla: ${activeTab === 'level3' ? 'Simulador de Caja (Nivel 3)' : 'Unit Economics (Nivel 2)'}.
`.trim();
}

/**
 * Realiza una auditoría estratégica instantánea y genera diagnósticos y sugerencias aplicables.
 */
export function generateQuickAudit({ inputs, results, cashflowState }) {
  const ltvCac = results.ltvCacPaid;
  const payback = typeof results.paybackMonth === 'number' ? results.paybackMonth : 25;
  const churn = inputs.monthlyChurn;
  const margin = inputs.grossMargin;

  let score = 5.0;
  if (ltvCac >= 3.0) score += 2.0;
  else if (ltvCac >= 1.8) score += 1.0;
  else score -= 1.5;

  if (payback <= 8) score += 1.5;
  else if (payback <= 12) score += 0.8;
  else score -= 1.0;

  if (churn <= 4.0) score += 1.0;
  else if (churn > 8.0) score -= 1.0;

  if (margin >= 80) score += 0.5;

  score = Math.max(2.0, Math.min(9.8, Math.round(score * 10) / 10));

  let statusText = 'Saludable';
  let badgeColor = '#10b981';
  if (score < 4.5) {
    statusText = 'Crítico / Insostenible';
    badgeColor = '#f43f5e';
  } else if (score < 7.0) {
    statusText = 'Vulnerable / Requiere Ajustes';
    badgeColor = '#f59e0b';
  }

  // Recomendaciones aplicables
  const recommendations = [];

  if (churn > 5.0) {
    recommendations.push({
      id: 'rec_churn',
      title: 'Contener el Churn Mensual',
      detail: `El churn actual del ${churn}% evapora la base instalada. Bajar a 4.0% expande el LTV significativamente.`,
      actionLabel: 'Reducir Churn a 4%',
      patch: { inputs: { monthlyChurn: 4.0 } },
    });
  }

  if (inputs.conversionRate < 18) {
    recommendations.push({
      id: 'rec_conv',
      title: 'Optimizar Embudo de Conversión',
      detail: `La conversión actual es ${inputs.conversionRate}%. Mejorar el onboarding hacia un 18% baja el CAC Paid drásticamente.`,
      actionLabel: 'Subir Conversión a 18%',
      patch: { inputs: { conversionRate: 18 } },
    });
  }

  if (cashflowState && (!cashflowState.annualPlan || !cashflowState.improvedConversion)) {
    recommendations.push({
      id: 'rec_hack',
      title: 'Activar Estrategia de Caja Escalonada',
      detail: 'Cobro anual anticipado inyecta liquidez inmediata y evita quebrar en el valle del mes 7-9.',
      actionLabel: 'Aplicar Plan Anual + Conversión 20%',
      patch: {
        cashflowState: {
          spendM1_12: 10000,
          spendM13_24: 25000,
          annualPlan: true,
          improvedConversion: true,
        },
      },
    });
  }

  return {
    score,
    statusText,
    badgeColor,
    recommendations,
  };
}

/**
 * Responde preguntas del usuario utilizando el motor determinista local
 * entrenado en los datos y fórmulas del caso Agendo.
 */
export function answerUserQueryLocally({ query, inputs, results, cashflowState }) {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Preguntas sobre Valeria o engaño / fraude
  if (q.includes('valeria') || q.includes('trampa') || q.includes('engano') || q.includes('reporte') || q.includes('discrepancia')) {
    const diff = (2.4 - results.ltvCacPaid).toFixed(2);
    return {
      text: `### 🔍 Auditoría del Reporte de Valeria\n\n` +
        `Valeria reporta un **LTV:CAC de 2.40x**, pero el cálculo riguroso arroja **${results.ltvCacPaid.toFixed(2)}x** (una discrepancia de **${diff}x**).\n\n` +
        `**¿Por qué es engañoso el número de Valeria?**\n` +
        `1. **Uso de CAC Blended:** Valeria divide la inversión entre el total de clientes, mezclando **${inputs.organicClients} clientes orgánicos** que llegaron gratis. Esto diluye artificialmente el costo unitario.\n` +
        `2. **Omisión de Costos de Ventas:** No incluye el sueldo de las **${results.vendedoras} vendedoras** ($${(inputs.salesSalary * results.vendedoras).toLocaleString()}/mes) ni las comisiones por cliente ($${inputs.commissionPerClient}/cliente).\n` +
        `3. **Riesgo Operativo:** Si escalamos pauta a $30,000 asumiendo el número de Valeria, el CAC marginal se dispara y el flujo quema la caja en menos de 9 meses.`,
      suggestion: {
        label: 'Ver impacto en la Curva de Caja',
        patch: { inputs: { ...inputs, adSpend: 10000 } },
      },
    };
  }

  // 2. Preguntas sobre Churn / Retención
  if (q.includes('churn') || q.includes('retencion') || q.includes('baja') || q.includes('cancelacion')) {
    const currentLtv = results.ltv24;
    const monthsCurrent = (100 / Math.max(inputs.monthlyChurn, 0.1)).toFixed(1);
    return {
      text: `### 📉 Análisis de Churn y Retención\n\n` +
        `Actualmente el Churn mensual es **${inputs.monthlyChurn}%**, lo que implica una vida útil promedio de **${monthsCurrent} meses** por cliente.\n\n` +
        `- **Impacto en LTV:** Tu LTV actual a 24 meses es de **$${currentLtv.toFixed(2)}**.\n` +
        `- **Sensibilidad:** Si logramos reducir el churn al **4.0%**, la retención sube a 25 meses y el LTV supera los **$${(currentLtv * 1.35).toFixed(2)}**, acelerando el Payback en casi 3 meses.\n\n` +
        `**Recomendación de Producto:** Implementar alertas de inactividad para barberías que lleven más de 48 horas sin agendar un cliente y planes con incentivo trimestral/anual.`,
      suggestion: {
        label: 'Probar Churn optimizado al 4%',
        patch: { inputs: { monthlyChurn: 4.0 } },
      },
    };
  }

  // 3. Preguntas sobre CAC y optimización publicitaria
  if (q.includes('cac') || q.includes('adquisicion') || q.includes('anuncio') || q.includes('publicidad') || q.includes('adspend')) {
    return {
      text: `### 💰 Diagnóstico de CAC (Costo de Adquisición)\n\n` +
        `- **CAC Paid Real:** $${results.cacPaid.toFixed(2)} por cada cliente pago.\n` +
        `- **CAC Blended:** $${results.cacBlended.toFixed(2)} (incluyendo los orgánicos).\n` +
        `- **CAC Marginal:** $${results.cacMarginal.toFixed(2)} por cada nuevo cliente adicional.\n\n` +
        `**Las 2 palancas más baratas para reducir el CAC:**\n` +
        `1. **Tasa de Conversión (Trial → Pago):** Pasar de ${inputs.conversionRate}% a 18% reduce el CAC Paid en más del 20% sin gastar ni un solo dólar más en Facebook/Google Ads.\n` +
        `2. **Eficiencia de Vendedoras:** Elevar la capacidad de trials por vendedora de ${inputs.salesCapacity} a 700 mediante automatización de WhatsApp CRM.`,
      suggestion: {
        label: 'Aumentar conversión a 18%',
        patch: { inputs: { conversionRate: 18 } },
      },
    };
  }

  // 4. Preguntas sobre Cashflow / Quiebra / Board de Inversores
  if (q.includes('caja') || q.includes('flujo') || q.includes('quiebra') || q.includes('runway') || q.includes('inversor') || q.includes('board') || q.includes('ricardo')) {
    return {
      text: `### 🛡️ Estrategia Financiera y Defensa ante el Board\n\n` +
        `El error principal que cometen las startups B2B SaaS como Agendo es **escalar pauta antes de asegurar el Payback**.\n\n` +
        `- **El plan de Valeria ($30k fijos):** Quema la caja hacia el Mes 7-8 porque la inversión y comisiones se pagan hoy, mientras que la suscripción de $25 entra mes a mes.\n` +
        `- **Estrategia Ganadora (Hack):** Mantener $10,000 en el Año 1, ofrecer **10% de descuento por cobro anual anticipado** (recibes $270 al contado en vez de $25) y optimizar la conversión al 20%. Esto genera más de 2,300 clientes y una caja final de más de $300,000 sin perforar el piso de $10,000.`,
      suggestion: {
        label: 'Activar Estrategia Ganadora en Simulador',
        patch: {
          cashflowState: {
            spendM1_12: 10000,
            spendM13_24: 25000,
            annualPlan: true,
            improvedConversion: true,
          },
        },
      },
    };
  }

  // 5. Pregunta general o recomendación holística
  return {
    text: `### 🤖 Evaluación Cuantitativa General\n\n` +
      `Analizando el estado actual de Agendo:\n` +
      `- **Relación LTV:CAC Paid:** **${results.ltvCacPaid.toFixed(2)}x** ${results.ltvCacPaid >= 3 ? '(Excelente)' : '(Por debajo del benchmark ideal de 3.0x)'}.\n` +
      `- **Payback:** **${results.paybackMonth} meses**.\n` +
      `- **Margen Bruto:** **${inputs.grossMargin}%**.\n\n` +
      `**Recomendación prioritaria:** Te sugiero activar el **Plan Anual** para adelantar el flujo de caja y mantener la inversión controlada en el primer año para evitar la crisis de liquidez que provocaría el plan de Valeria.`,
    suggestion: {
      label: 'Optimizar Margen (82%) y Conversión (16%)',
      patch: { inputs: { grossMargin: 82, conversionRate: 16 } },
    },
  };
}

/**
 * Conexión directa a API externa de LLM (Gemini o OpenAI).
 */
export async function callExternalAiApi({
  provider,
  apiKey,
  modelName,
  userMessage,
  systemContext,
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Debes ingresar tu API Key para utilizar la conexión externa.');
  }

  // Proveedor: GOOGLE GEMINI
  if (provider === 'gemini') {
    const model = modelName || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    const promptText = `
Eres el Asesor Estratégico Cuantitativo y Director Financiero (CFO) de Agendo.
Utiliza el siguiente contexto financiero en tiempo real para fundamentar rigurosamente tu respuesta:

${systemContext}

Instrucciones:
- Sé conciso, analítico y profesional (formato Markdown con viñetas y datos numéricos exactos).
- Responde directamente a la consulta del usuario.
- Enfatiza si hay riesgos de liquidez o discrepancias en métricas (como el caso Valeria).

Pregunta del usuario:
${userMessage}
`.trim();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error ${response.status} en la API de Google Gemini.`);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Respuesta vacía de Google Gemini.');
    return { text: reply };
  }

  // Proveedor: OPENAI
  if (provider === 'openai') {
    const model = modelName || 'gpt-4o-mini';
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Eres el CFO y Asesor de Negocios de Agendo. Tienes acceso a estas métricas en vivo:\n\n${systemContext}`,
          },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error ${response.status} en la API de OpenAI.`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Respuesta vacía de OpenAI.');
    return { text: reply };
  }

  throw new Error(`Proveedor "${provider}" no reconocido.`);
}
