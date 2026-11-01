import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  Layers,
  Calendar,
  Sliders,
} from 'lucide-react';
import { buildShareableUrl } from '../utils/urlState';

export default function ShareModal({
  isOpen,
  onClose,
  activeTab,
  inputs,
  cashflowState,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = buildShareableUrl({ activeTab, inputs, cashflowState });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const isLevel3 = activeTab === 'level3';

  return (
    <div
      className="modal-overlay no-print"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #161b2e 0%, #0f1220 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          padding: '28px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
          color: '#e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
                border: '1px solid rgba(99,102,241,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Share2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Compartir Simulación
                <span
                  style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  Cero Backend
                </span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                El estado completo vive en la URL. Cualquiera con este enlace verá exactamente tus cifras.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumen del Escenario Codificado */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '14px',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={13} />
            Parámetros de este enlace
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#64748b' }}>Vista:</span>
              <strong style={{ color: '#e2e8f0' }}>{isLevel3 ? 'Simulador de Caja (24m)' : 'Unit Economics (Nivel 2)'}</strong>
            </div>
            {isLevel3 ? (
              <>
                <div>
                  <span style={{ color: '#64748b' }}>Inversión M1-12:</span>{' '}
                  <strong style={{ color: '#38bdf8' }}>${cashflowState.spendM1_12.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Inversión M13-24:</span>{' '}
                  <strong style={{ color: '#818cf8' }}>${cashflowState.spendM13_24.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Plan Anual (Cash):</span>{' '}
                  <strong style={{ color: cashflowState.annualPlan ? '#34d399' : '#94a3b8' }}>
                    {cashflowState.annualPlan ? 'ACTIVADO' : 'Desactivado'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Conversión 20%:</span>{' '}
                  <strong style={{ color: cashflowState.improvedConversion ? '#34d399' : '#94a3b8' }}>
                    {cashflowState.improvedConversion ? 'ACTIVADO' : 'Desactivado (14%)'}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span style={{ color: '#64748b' }}>Inversión:</span>{' '}
                  <strong style={{ color: '#38bdf8' }}>${inputs.adSpend.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Conversión:</span>{' '}
                  <strong style={{ color: '#818cf8' }}>{inputs.conversionRate}%</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Precio:</span>{' '}
                  <strong style={{ color: '#34d399' }}>${inputs.monthlyPrice}/mes</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Churn:</span>{' '}
                  <strong style={{ color: '#f43f5e' }}>{inputs.monthlyChurn}%</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Input con URL y botón copiar */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <input
            id="share-url-input"
            readOnly
            value={shareUrl}
            style={{
              width: '100%',
              padding: '12px 110px 12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 6, 23, 0.7)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              right: '6px',
              top: '6px',
              bottom: '6px',
              padding: '0 16px',
              borderRadius: '8px',
              backgroundColor: copied ? '#10b981' : '#6366f1',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.78rem',
              transition: 'all 0.2s',
            }}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={14} />
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Acciones adicionales */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              fontSize: '0.8rem',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'background 0.2s',
            }}
          >
            <ExternalLink size={13} />
            Probar enlace en nueva pestaña
          </a>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
