import { formatCurrency, getSemaphoreColor } from '../engine';
import CONFIG from '../config';

/**
 * Tarjetas de KPIs — resultados en vivo
 */
export default function KpiCards({ results }) {
  if (!results) return null;

  const currency = CONFIG.meta.currency;
  const semPaid = getSemaphoreColor(results.ltvCacPaid);
  const semBlended = getSemaphoreColor(results.ltvCacBlended);

  const cards = [
    {
      label: 'CAC Paid',
      value: formatCurrency(results.cacPaid, currency),
      colorClass: 'kpi-card__value--default',
      sub: 'Costo de adquirir un cliente por anuncios',
    },
    {
      label: 'CAC Blended',
      value: formatCurrency(results.cacBlended, currency),
      colorClass: 'kpi-card__value--default',
      sub: 'Incluyendo clientes orgánicos',
    },
    {
      label: 'LTV 24 Meses',
      value: formatCurrency(results.ltv24, currency),
      colorClass: 'kpi-card__value--default',
      sub: `Margen mensual: ${formatCurrency(results.margenMensual, currency)}`,
    },
    {
      label: 'LTV:CAC Paid',
      value: results.ltvCacPaid.toFixed(2) + 'x',
      colorClass: `kpi-card__value--${semPaid}`,
      semaphore: semPaid,
      sub: semPaid === 'green' ? '✅ Saludable (>3x)' : semPaid === 'yellow' ? '⚠️ Riesgoso (1-3x)' : '🚨 Insostenible (<1x)',
    },
    {
      label: 'LTV:CAC Blended',
      value: results.ltvCacBlended.toFixed(2) + 'x',
      colorClass: `kpi-card__value--${semBlended}`,
      semaphore: semBlended,
      sub: 'Incluye orgánicos — puede ser engañoso',
    },
    {
      label: 'Payback',
      value: typeof results.paybackMonth === 'number' ? `${results.paybackMonth} meses` : results.paybackMonth,
      colorClass: typeof results.paybackMonth === 'number' && results.paybackMonth <= 12
        ? 'kpi-card__value--green'
        : 'kpi-card__value--yellow',
      sub: 'Meses para recuperar el CAC',
    },
    {
      label: 'Vendedoras Necesarias',
      value: results.vendedoras,
      colorClass: 'kpi-card__value--default',
      sub: `${results.trials} trials generados`,
    },
    {
      label: 'CAC Marginal',
      value: formatCurrency(results.cacMarginal, currency),
      colorClass: 'kpi-card__value--default',
      sub: 'Costo del último cliente extra',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`kpi-card animate-in animate-in-delay-${i + 1}`}
        >
          <div className="kpi-card__label">{card.label}</div>
          <div className={`kpi-card__value ${card.colorClass}`}>
            {card.semaphore && (
              <span className={`semaphore semaphore--${card.semaphore}`} />
            )}
            {card.value}
          </div>
          {card.sub && <div className="kpi-card__sub">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
