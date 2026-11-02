import React, { useState } from 'react';
import {
  Accessibility,
  Sun,
  Moon,
  Type,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
  Keyboard,
  RotateCcw,
  X,
  Check,
  CheckCircle2,
} from 'lucide-react';

export default function AccessibilityModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  reducedMotion,
  setReducedMotion,
  results,
  showNotification,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  // Lector de voz para resumen de accesibilidad
  const toggleSpeechSummary = () => {
    if (!('speechSynthesis' in window)) {
      showNotification('Tu navegador no cuenta con soporte de síntesis de voz', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narration = `Resumen accesible de métricas de Agendo: ` +
      `Costo de adquisición de clientes de pago: ${results.cacPaid} dólares. ` +
      `Valor de vida del cliente a veinticuatro meses: ${results.ltv24} dólares. ` +
      `Relación de valor a costo de adquisición: ${results.ltvCacPaid.toFixed(2)} a uno. ` +
      `Tiempo de recuperación de inversión: ${results.paybackMonth} meses. ` +
      `Alerta de auditoría: El reporte de Valeria afirma dos punto cuatro equis, pero la cifra real con costos de ventas es de ${results.ltvCacPaid.toFixed(2)} equis.`;

    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetAccessibility = () => {
    setTheme('dark');
    setFontSize('normal');
    setHighContrast(false);
    setReducedMotion(false);
    showNotification('Ajustes de accesibilidad restablecidos a valores estándar', 'info');
  };

  return (
    <div
      className="modal-overlay no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
      style={{ zIndex: 9999 }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Accessibility size={22} />
            </div>
            <div>
              <h3 id="accessibility-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Centro de Accesibilidad y Visualización
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personaliza la experiencia visual, contraste y navegación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar panel de accesibilidad"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. MODO CLARO Y OSCURO */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {theme === 'dark' ? <Moon size={15} color="var(--accent-primary)" /> : <Sun size={15} color="#f59e0b" />}
            Tema Visual (Modo Claro / Modo Oscuro)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setTheme('dark')}
              className="btn"
              style={{
                padding: '10px',
                justifyContent: 'center',
                background: theme === 'dark' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                color: theme === 'dark' ? '#ffffff' : 'var(--text-secondary)',
                border: theme === 'dark' ? 'none' : '1px solid var(--border-color)',
                borderRadius: '10px',
              }}
            >
              <Moon size={15} />
              Modo Oscuro
            </button>
            <button
              onClick={() => setTheme('light')}
              className="btn"
              style={{
                padding: '10px',
                justifyContent: 'center',
                background: theme === 'light' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                color: theme === 'light' ? '#ffffff' : 'var(--text-secondary)',
                border: theme === 'light' ? 'none' : '1px solid var(--border-color)',
                borderRadius: '10px',
              }}
            >
              <Sun size={15} />
              Modo Claro
            </button>
          </div>
        </div>

        {/* 2. ESCALADO DE FUENTE */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            <Type size={15} color="var(--accent-primary)" />
            Tamaño de Letra (Escalado de Texto)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { id: 'normal', label: 'Estándar', size: '100%' },
              { id: 'large', label: 'Grande', size: '115%' },
              { id: 'xlarge', label: 'Extra Grande', size: '130%' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className="btn"
                style={{
                  padding: '8px',
                  flexDirection: 'column',
                  gap: '2px',
                  background: fontSize === f.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                  border: fontSize === f.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: fontSize === f.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderRadius: '10px',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{f.label}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({f.size})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. ALTO CONTRASTE & REDUCCIÓN DE MOVIMIENTO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Alto Contraste */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={15} />
                Modo de Alto Contraste (AAA)
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Bordes reforzados y contraste máximo entre fondo y elementos
              </div>
            </div>
            <button
              onClick={() => setHighContrast((prev) => !prev)}
              aria-pressed={highContrast}
              style={{
                width: '46px',
                height: '26px',
                borderRadius: '13px',
                background: highContrast ? 'var(--accent-primary)' : 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: highContrast ? '22px' : '2px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>

          {/* Reducción de Movimiento */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={15} />
                Reducción de Movimiento
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Desactiva animaciones y transiciones continuas
              </div>
            </div>
            <button
              onClick={() => setReducedMotion((prev) => !prev)}
              aria-pressed={reducedMotion}
              style={{
                width: '46px',
                height: '26px',
                borderRadius: '13px',
                background: reducedMotion ? 'var(--accent-primary)' : 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: reducedMotion ? '22px' : '2px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>
        </div>

        {/* 4. ASISTENCIA POR VOZ / LECTOR DE PANTALLA */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={15} />
              Lector de Pantalla de Métricas
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Narra en voz alta el estado actual de los Unit Economics
            </div>
          </div>
          <button
            onClick={toggleSpeechSummary}
            className="btn btn--primary"
            style={{ fontSize: '0.76rem', padding: '6px 14px' }}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isSpeaking ? 'Detener Voz' : 'Leer en voz alta'}
          </button>
        </div>

        {/* 5. GUÍA DE ATAJOS DE TECLADO */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            <Keyboard size={15} color="var(--accent-primary)" />
            Atajos de Teclado Disponibles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Modo Claro / Oscuro</span>
              <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid var(--border-color)' }}>Alt + T</kbd>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Panel Accesibilidad</span>
              <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid var(--border-color)' }}>Alt + A</kbd>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Asesor IA Copilot</span>
              <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid var(--border-color)' }}>Alt + I</kbd>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Modo Presentación</span>
              <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid var(--border-color)' }}>P</kbd>
            </div>
          </div>
        </div>

        {/* Acciones de pie */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            onClick={handleResetAccessibility}
            className="btn btn--ghost"
            style={{ fontSize: '0.74rem' }}
          >
            <RotateCcw size={13} />
            Restablecer Valores
          </button>
          <button
            onClick={onClose}
            className="btn btn--primary"
            style={{ fontSize: '0.76rem', padding: '8px 20px' }}
          >
            <Check size={14} />
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

