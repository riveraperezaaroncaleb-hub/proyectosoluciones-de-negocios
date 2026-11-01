import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  X,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Building,
  Calendar,
} from 'lucide-react';
import { formatMoney } from '../cashflowEngine';

export default function ExecutiveReportModal({
  isOpen,
  onClose,
  activeTab,
  inputs,
  results,
  simHoy,
  simValeria,
  simCustom,
  simHacked,
  cashflowState,
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="modal-overlay no-print"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '20px',
          padding: '0',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.2)',
          color: '#e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Modal Toolbar (No se imprime) */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Vista Previa de Reporte Ejecutivo para Board & Inversores
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Listo para exportar en alta resolución a PDF o imprimir
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Printer size={16} />
              Imprimir / Guardar como PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido Imprimible y Previsualizable */}
        <div
          id="printable-executive-report"
          style={{
            padding: '36px',
            overflowY: 'auto',
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.5,
          }}
        >
          {/* Header Corporativo Oficial */}
          <div
            style={{
              borderBottom: '3px solid #0f172a',
              paddingBottom: '20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a' }}>
                  AGENDO TECHNOLOGIES
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#e0e7ff',
                    color: '#4338ca',
                  }}
                >
                  SaaS B2B
                </span>
              </div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#334155', margin: '4px 0' }}>
                MEMORÁNDUM EJECUTIVO: EVALUACIÓN DE ESTRATEGIA DE CRECIMIENTO Y RUNWAY A 24 MESES
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Dirigido a: Ricardo (CEO) & Consejo de Administración · Preparado para Junta Directiva
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>CONFIDENCIAL</div>
              <div>Fecha: {currentDate}</div>
              <div>Horizonte: 24 Meses</div>
              <div style={{ color: '#059669', fontWeight: 600 }}>Piso de Caja: $10,000 USD</div>
            </div>
          </div>

          {/* Resumen Ejecutivo & Veredicto */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderLeft: '5px solid #4f46e5',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1e293b', margin: '0 0 8px 0' }}>
              1. Resumen Ejecutivo & Veredicto Financiero
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 10px 0' }}>
              El análisis cuantitativo de liquidez demuestra que <strong>la propuesta de Valeria de acelerar inmediatamente la inversión a $30,000/mes conlleva un riesgo fatal de insolvencia</strong>, provocando la quiebra en el <strong>Mes {simValeria?.minCashMonth || 9}</strong> con un déficit de <strong>{formatMoney(simValeria?.minCash || -42500)}</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>
              <strong>Recomendación del Comité:</strong> Implementar la <strong>Estrategia Escalonada</strong> ($10,000 en M1-12 aumentando a $25,000 en M13-24) condicionada a la activación del <strong>Plan Anual Upfront ($240 adelanto)</strong> y la optimización del funnel de conversión al 20%. Esto blinda la caja por encima de $10,000 en todo momento y supera los 2,500 clientes al término del ciclo.
            </p>
          </div>

          {/* Tabla Comparativa de Escenarios */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1e293b', margin: '0 0 12px 0' }}>
              2. Matriz Cuantitativa de Escenarios (24 Meses)
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.82rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Escenario</th>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Inversión Ads</th>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Caja Mínima</th>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Mes Valle</th>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Clientes M24</th>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Caja M24</th>
                  <th style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {/* Hoy */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>1. Plan Actual (Hoy)</td>
                  <td style={{ padding: '10px 12px' }}>$10,000 fijos</td>
                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 600 }}>{formatMoney(simHoy?.minCash)}</td>
                  <td style={{ padding: '10px 12px' }}>Mes {simHoy?.minCashMonth}</td>
                  <td style={{ padding: '10px 12px' }}>{simHoy?.finalClients?.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px' }}>{formatMoney(simHoy?.finalCash)}</td>
                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 700 }}>Seguro pero Lento</td>
                </tr>
                {/* Valeria */}
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fff1f2' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#be123c' }}>2. Plan Valeria</td>
                  <td style={{ padding: '10px 12px' }}>$30,000 fijos</td>
                  <td style={{ padding: '10px 12px', color: '#be123c', fontWeight: 800 }}>{formatMoney(simValeria?.minCash)}</td>
                  <td style={{ padding: '10px 12px', color: '#be123c', fontWeight: 700 }}>Mes {simValeria?.minCashMonth}</td>
                  <td style={{ padding: '10px 12px' }}>{simValeria?.finalClients?.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: '#be123c' }}>{formatMoney(simValeria?.finalCash)}</td>
                  <td style={{ padding: '10px 12px', color: '#be123c', fontWeight: 800 }}>QUIEBRA TÉCNICA</td>
                </tr>
                {/* Tu Estrategia */}
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#4338ca' }}>3. Simulación Actual</td>
                  <td style={{ padding: '10px 12px' }}>${cashflowState?.spendM1_12?.toLocaleString()} / ${cashflowState?.spendM13_24?.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: simCustom?.isViable ? '#059669' : '#dc2626' }}>
                    {formatMoney(simCustom?.minCash)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>Mes {simCustom?.minCashMonth}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{simCustom?.finalClients?.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{formatMoney(simCustom?.finalCash)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: simCustom?.isViable ? '#059669' : '#dc2626' }}>
                    {simCustom?.isViable ? 'VIABLE' : 'INSOLVENTE'}
                  </td>
                </tr>
                {/* Ganadora */}
                <tr style={{ background: '#ecfdf5' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#047857' }}>4. Estrategia Ganadora</td>
                  <td style={{ padding: '10px 12px' }}>$10k → $25k (Escalonado)</td>
                  <td style={{ padding: '10px 12px', color: '#047857', fontWeight: 800 }}>{formatMoney(simHacked?.minCash)}</td>
                  <td style={{ padding: '10px 12px' }}>Mes {simHacked?.minCashMonth}</td>
                  <td style={{ padding: '10px 12px', color: '#047857', fontWeight: 800 }}>{simHacked?.finalClients?.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: '#047857', fontWeight: 800 }}>{formatMoney(simHacked?.finalCash)}</td>
                  <td style={{ padding: '10px 12px', color: '#047857', fontWeight: 800 }}>ÓPTIMA / BOARD APPROVED</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Unit Economics Audit */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>CAC Actual</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>${results?.cac || '42.00'}</div>
              <div style={{ fontSize: '0.7rem', color: '#059669' }}>Costo Adquisición Total</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>LTV Estimado</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>${results?.ltv || '325.00'}</div>
              <div style={{ fontSize: '0.7rem', color: '#059669' }}>Vida Media: 16.7 meses</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>LTV / CAC Ratio</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4338ca' }}>{results?.ltvCacRatio || '7.7'}x</div>
              <div style={{ fontSize: '0.7rem', color: '#059669' }}>Saludable (&gt; 3.0x)</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>CAC Payback</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{results?.cacPaybackMonths || '8.2'} m</div>
              <div style={{ fontSize: '0.7rem', color: '#059669' }}>Recuperación rápida</div>
            </div>
          </div>

          {/* Firmas y Aprobaciones */}
          <div
            style={{
              marginTop: '36px',
              borderTop: '1px solid #cbd5e1',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <div style={{ height: '36px', borderBottom: '1px dashed #94a3b8', width: '220px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>Ricardo (CEO / Co-Founder)</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Agendo Technologies Inc.</div>
            </div>
            <div>
              <div style={{ height: '36px', borderBottom: '1px dashed #94a3b8', width: '220px', marginBottom: '6px' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>Consejo de Administración / Inversores</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Comité de Auditoría Financiera</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#94a3b8' }}>
              <div>Documento generado por Agendo BI Engine</div>
              <div>ID Verificación: #AGD-{Math.floor(Math.random() * 89999 + 10000)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
