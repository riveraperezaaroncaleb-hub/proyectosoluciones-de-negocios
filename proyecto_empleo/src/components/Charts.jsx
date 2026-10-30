import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line, Bar } from 'react-chartjs-2';

// Registrar los componentes de Chart.js que usamos
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

// Intentar registrar el plugin de anotaciones (se instala aparte)
try {
  ChartJS.register(annotationPlugin);
} catch {
  // Plugin no disponible — las líneas de referencia no se mostrarán
}

// ── Constantes de estilo ────────────────────────────────────
const COLORS = {
  indigo: 'rgba(99, 102, 241, 1)',
  indigoFaded: 'rgba(99, 102, 241, 0.15)',
  violet: 'rgba(139, 92, 246, 1)',
  violetFaded: 'rgba(139, 92, 246, 0.15)',
  cyan: 'rgba(6, 182, 212, 1)',
  cyanFaded: 'rgba(6, 182, 212, 0.15)',
  emerald: 'rgba(16, 185, 129, 1)',
  emeraldFaded: 'rgba(16, 185, 129, 0.15)',
  amber: 'rgba(245, 158, 11, 1)',
  rose: 'rgba(244, 63, 94, 1)',
  roseFaded: 'rgba(244, 63, 94, 0.15)',
  textMuted: 'rgba(148, 163, 184, 0.6)',
  gridLine: 'rgba(99, 102, 241, 0.08)',
};

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  animation: { duration: 400, easing: 'easeOutQuart' },
  plugins: {
    legend: {
      labels: {
        color: COLORS.textMuted,
        font: { family: 'Inter', size: 11, weight: 500 },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 15, 26, 0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(99, 102, 241, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: { family: 'Inter', weight: 600 },
      bodyFont: { family: 'Inter' },
    },
  },
  scales: {
    x: {
      ticks: { color: COLORS.textMuted, font: { family: 'Inter', size: 10 } },
      grid: { color: COLORS.gridLine },
      border: { color: COLORS.gridLine },
    },
    y: {
      ticks: { color: COLORS.textMuted, font: { family: 'Inter', size: 10 } },
      grid: { color: COLORS.gridLine },
      border: { color: COLORS.gridLine },
    },
  },
};

/**
 * ════════════════════════════════════════════════════════
 * 1. CURVA DE CAJA (Cash Curve)
 * ════════════════════════════════════════════════════════
 */
export function CashCurveChart({ results }) {
  if (!results) return null;

  const labels = results.cashCurveMonthly.map((p) => `M${p.month}`);
  const monthlyValues = results.cashCurveMonthly.map((p) => p.value);
  const annualValues = results.cashCurveAnnual.map((p) => p.value);

  const data = {
    labels,
    datasets: [
      {
        label: 'Cliente Mensual',
        data: monthlyValues,
        borderColor: COLORS.indigo,
        backgroundColor: COLORS.indigoFaded,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Cliente Anual',
        data: annualValues,
        borderColor: COLORS.emerald,
        backgroundColor: COLORS.emeraldFaded,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...BASE_OPTIONS,
    plugins: {
      ...BASE_OPTIONS.plugins,
      annotation: {
        annotations: {
          paybackLine: {
            type: 'line',
            yMin: 0,
            yMax: 0,
            borderColor: COLORS.amber,
            borderWidth: 2,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'Payback (CAC recuperado)',
              position: 'start',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: COLORS.amber,
              font: { family: 'Inter', size: 10, weight: 600 },
              padding: 4,
            },
          },
        },
      },
    },
    scales: {
      ...BASE_OPTIONS.scales,
      y: {
        ...BASE_OPTIONS.scales.y,
        ticks: {
          ...BASE_OPTIONS.scales.y.ticks,
          callback: (val) => `$${val.toFixed(0)}`,
        },
      },
    },
  };

  return (
    <div className="chart-card chart-card--full animate-in animate-in-delay-1">
      <h3 className="chart-card__title">📈 Curva de Caja (Cash Curve) — 24 Meses</h3>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * ════════════════════════════════════════════════════════
 * 2. LTV vs CAC
 * ════════════════════════════════════════════════════════
 */
export function LtvVsCacChart({ results }) {
  if (!results) return null;

  const data = {
    labels: ['LTV 24m', 'CAC Paid', 'CAC Blended'],
    datasets: [
      {
        label: 'Valor ($)',
        data: [results.ltv24, results.cacPaid, results.cacBlended],
        backgroundColor: [COLORS.indigo, COLORS.rose, COLORS.amber],
        borderColor: [COLORS.indigo, COLORS.rose, COLORS.amber],
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  // Líneas de referencia 1:1 y 3:1
  const maxVal = Math.max(results.ltv24, results.cacPaid * 3, 300);
  const options = {
    ...BASE_OPTIONS,
    plugins: {
      ...BASE_OPTIONS.plugins,
      legend: { display: false },
      annotation: {
        annotations: {
          line1to1: {
            type: 'line',
            yMin: results.cacPaid,
            yMax: results.cacPaid,
            borderColor: COLORS.rose,
            borderWidth: 1.5,
            borderDash: [5, 3],
            label: {
              display: true,
              content: '1:1 CAC Paid',
              position: 'end',
              backgroundColor: COLORS.roseFaded,
              color: COLORS.rose,
              font: { family: 'Inter', size: 9, weight: 600 },
              padding: 3,
            },
          },
          line3to1: {
            type: 'line',
            yMin: results.cacPaid * 3,
            yMax: results.cacPaid * 3,
            borderColor: COLORS.emerald,
            borderWidth: 1.5,
            borderDash: [5, 3],
            label: {
              display: true,
              content: '3:1 (objetivo)',
              position: 'end',
              backgroundColor: COLORS.emeraldFaded,
              color: COLORS.emerald,
              font: { family: 'Inter', size: 9, weight: 600 },
              padding: 3,
            },
          },
        },
      },
    },
    scales: {
      ...BASE_OPTIONS.scales,
      y: {
        ...BASE_OPTIONS.scales.y,
        max: maxVal * 1.2,
        ticks: {
          ...BASE_OPTIONS.scales.y.ticks,
          callback: (val) => `$${val.toFixed(0)}`,
        },
      },
    },
  };

  return (
    <div className="chart-card animate-in animate-in-delay-2">
      <h3 className="chart-card__title">📊 LTV vs CAC</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * ════════════════════════════════════════════════════════
 * 3. FUNNEL
 * ════════════════════════════════════════════════════════
 */
export function FunnelChart({ results }) {
  if (!results) return null;

  const funnel = results.funnel;

  const data = {
    labels: funnel.map((f) => f.label),
    datasets: [
      {
        label: 'Funnel',
        data: funnel.map((f) => f.value),
        backgroundColor: [
          COLORS.indigo,
          COLORS.violet,
          COLORS.cyan,
        ],
        borderColor: [
          COLORS.indigo,
          COLORS.violet,
          COLORS.cyan,
        ],
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.7,
      },
    ],
  };

  const options = {
    ...BASE_OPTIONS,
    indexAxis: 'y',
    plugins: {
      ...BASE_OPTIONS.plugins,
      legend: { display: false },
    },
    scales: {
      x: {
        ...BASE_OPTIONS.scales.x,
        ticks: {
          ...BASE_OPTIONS.scales.x.ticks,
          callback: (val) => {
            if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
            return val;
          },
        },
      },
      y: {
        ...BASE_OPTIONS.scales.y,
        ticks: {
          ...BASE_OPTIONS.scales.y.ticks,
          font: { family: 'Inter', size: 12, weight: 600 },
        },
      },
    },
  };

  return (
    <div className="chart-card animate-in animate-in-delay-3">
      <h3 className="chart-card__title">🔻 Funnel de Conversión</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
