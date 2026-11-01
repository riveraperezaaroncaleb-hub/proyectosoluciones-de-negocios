import { FileText, BarChart2, AlertTriangle } from 'lucide-react';
import CONFIG from '../config';

/**
 * Banner de la "Trampa de Valeria"
 * Muestra el valor que Valeria reporta vs. el cálculo real.
 */
export default function ValeriaBanner({ results }) {
  if (!results) return null;

  const { claimedLtvCac, explanation } = CONFIG.valeriaReport;
  const realLtvCacPaid = results.ltvCacPaid;
  const diff = (claimedLtvCac - realLtvCacPaid).toFixed(2);

  return (
    <div className="valeria-banner animate-in">
      {/* Lado de Valeria */}
      <div className="valeria-side valeria-side--claimed">
        <div className="valeria-side__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <FileText size={13} />
          Reporte de Valeria
        </div>
        <div className="valeria-side__value">
          LTV:CAC = {claimedLtvCac}x
        </div>
        <div className="valeria-side__note">
          Usa CAC Blended (mezcla orgánicos) sin restar costos reales de vendedoras y comisiones.
        </div>
      </div>

      {/* Lado real */}
      <div className="valeria-side valeria-side--real">
        <div className="valeria-side__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <BarChart2 size={13} />
          Cálculo Real (CAC Paid)
        </div>
        <div className="valeria-side__value">
          LTV:CAC = {realLtvCacPaid.toFixed(2)}x
        </div>
        <div className="valeria-side__note">
          Usando CAC Paid real que incluye inversión, vendedoras y comisiones por cada cliente.
        </div>
      </div>

      {/* Warning */}
      <div className="valeria-banner__warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <AlertTriangle size={14} />
        Diferencia de <strong>{diff}x</strong> — {explanation}
      </div>
    </div>
  );
}
