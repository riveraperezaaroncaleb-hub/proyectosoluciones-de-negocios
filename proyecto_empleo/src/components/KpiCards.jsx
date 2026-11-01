import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  ShoppingCart,
  Activity,
  Zap,
} from 'lucide-react';
import { formatCurrency, getSemaphoreColor } from '../engine';
import CONFIG from '../config';

const cardIcons = [
  <DollarSign size={16} />,
  <ShoppingCart size={16} />,
  <TrendingUp size={16} />,
  <Activity size={16} />,
  <Zap size={16} />,
  <Clock size={16} />,
  <Users size={16} />,
  <TrendingDown size={16} />,
];

/**
 * Tarjetas de KPIs — resultados en vivo
 */
export default function KpiCards({ results }) {
  if (!results) return null;

  const currency = CONFIG.meta.currency;
  const semPaid = getSemaphoreColor(results.ltvCacPaid);
  const semBlended = getSemaphoreColor(results.ltvCacBlended);

  const semLabel = {
    green: 'Saludable (>3x)',
    yellow: 'Riesgoso (1–3x)',
    red: 'Insostenible (<1x)',
  };

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
      sub: semLabel[semPaid],
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
      value:
        typeof results.paybackMonth === 'number'
          ? `${results.paybackMonth} meses`
          : results.paybackMonth,
      colorClass:
        typeof results.paybackMonth === 'number' && results.paybackMonth <= 12
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
        <div key={card.label} className={`kpi-card animate-in animate-in-delay-${i + 1}`}>
          {/* Icon badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div className="kpi-card__label">{card.label}</div>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              {cardIcons[i]}
            </div>
          </div>

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
