import React, { useState, useEffect } from 'react';
import {
  Tv,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  BookOpen,
  HelpCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { formatMoney } from '../cashflowEngine';

export default function PresentationMode({
  isOpen,
  onClose,
  results,
  simHoy,
  simValeria,
  simCustom,
  simHacked,
  cashflowState,
  setCashflowState,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Atajos de teclado para presentaciones (Flechas, Esc, Espacio)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const slides = [
    {
      id: 'slide-1',
      tag: '01. FUNDAMENTOS',
      title: 'Unit Economics de Agendo: ¿El Negocio es Sano?',
      subtitle: 'Diagnóstico cuantitativo del modelo B2B antes de escalar inversión',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '24px' }}>
          <div className="presenter-card">
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>CAC (Costo Adquisición)</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#38bdf8' }}>
              ${results?.cac || '42'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
              Incluye anuncios + vendedoras + comisiones directas
            </div>
          </div>

          <div className="presenter-card">
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>LTV (Customer Lifetime Value)</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#818cf8' }}>
              ${results?.ltv || '325'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
              ARPU $25/mes con vida media de ~16.7 meses
            </div>
          </div>

          <div className="presenter-card" style={{ borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.06)' }}>
            <div style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700 }}>
              Ratio LTV / CAC
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981' }}>
              {results?.ltvCacRatio || '7.7'}x
            </div>
            <div style={{ color: '#34d399', fontSize: '0.85rem', marginTop: '8px' }}>
              Excelente (benchmark SaaS óptimo es &gt; 3.0x)
            </div>
          </div>

          <div className="presenter-card">
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>CAC Payback Period</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#f59e0b' }}>
              {results?.cacPaybackMonths || '8.2'}
              <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>meses</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
              Tiempo en que cada nuevo cliente paga su adquisición
            </div>
          </div>
        </div>
      ),
      takeaway: 'Conclusión: La unidad económica es sumamente sólida (LTV/CAC 7.7x). El producto tiene demanda real y genera rentabilidad por cliente. El cuello de botella NO es la propuesta de valor, sino el timing de liquidez.',
      notes: [
        'Explicar al board que el LTV de $325 frente a un CAC de $42 es un indicador extraordinario de adecuación producto-mercado.',
        'Hacer hincapié en el Payback de 8.2 meses: el dinero invertido tarda casi 9 meses en regresar a la caja.',
        'Este desfase de 8 meses es precisamente lo que puede matar a la compañía si escalamos demasiado rápido.',
      ],
    },
    {
      id: 'slide-2',
      tag: '02. EL RIESGO DE VALERIA',
      title: '¿Por qué la Propuesta de Valeria ($30,000) Quiebra la Empresa?',
      subtitle: 'La trampa del crecimiento acelerado en SaaS sin respaldo de caja',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', marginTop: '20px' }}>
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', marginBottom: '16px' }}>
              <ShieldAlert size={28} />
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>ALERTA DE INSOLVENCIA EN MES {simValeria?.minCashMonth || 9}</h4>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Valeria propone triplicar la pauta publicitaria a <strong>$30,000 mensuales desde el Mes 1</strong>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Caja Mínima Proyectada</div>
                <div style={{ color: '#f43f5e', fontSize: '1.8rem', fontWeight: 900 }}>
                  {formatMoney(simValeria?.minCash || -42500)}
                </div>
                <div style={{ color: '#fda4af', fontSize: '0.78rem' }}>Déficit crítico por debajo de $0</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Piso Obligatorio</div>
                <div style={{ color: '#38bdf8', fontSize: '1.8rem', fontWeight: 900 }}>$10,000</div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Reserva mínima exigida por el board</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', marginBottom: '12px' }}>
              ¿Por qué se produce la quiebra?
            </div>
            <ul style={{ color: '#94a3b8', fontSize: '0.88rem', spaceY: '10px', paddingLeft: '18px', lineHeight: 1.7 }}>
              <li><strong>Costos fijos inmediatos:</strong> Más anuncios generan más trials, requiriendo contratar vendedoras el día 1 ($1,200/mes c/u).</li>
              <li><strong>Comisiones en efectivo:</strong> $20 pagados en el acto por cada cliente cerrado.</li>
              <li><strong>Ingreso goteado:</strong> Los clientes pagan solo $25 al mes, requiriendo meses para cubrir los costos iniciales.</li>
            </ul>
          </div>
        </div>
      ),
      takeaway: 'Veredicto para Valeria: Escalar prematuramente a $30k es suicidio financiero si no se modifica la estructura de cobro o se escalona la inversión.',
      notes: [
        'Advertir firmemente al board: quemaríamos la compañía en el Mes 9.',
        'La gráfica de flujo de caja se hunde a -$42,500.',
        'No es culpa de la efectividad del producto, sino del desfase de working capital.',
      ],
    },
    {
      id: 'slide-3',
      tag: '03. ESTRATEGIA GANADORA',
      title: 'El Plan Aprobado: Escalonamiento + Liquidez Anticipada',
      subtitle: 'Cómo alcanzar más de 2,500 clientes sin arriesgar la solvencia de la empresa',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div className="presenter-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '12px' }}>
              <TrendingUp size={22} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>1. Inversión Escalonada</h4>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              $10k → $25k
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Mantener $10,000 los primeros 12 meses mientras se acumula masa crítica de MRR, y subir a $25,000 en el Mes 13.
            </p>
          </div>

          <div className="presenter-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16,185,129,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '12px' }}>
              <Zap size={22} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>2. Plan Anual Upfront</h4>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginBottom: '8px' }}>
              $240 en Día 1
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              El 20% de los clientes paga el año completo por adelantado. Esto inyecta liquidez inmediata y autofinancia la captación.
            </p>
          </div>

          <div className="presenter-card" style={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', marginBottom: '12px' }}>
              <Sparkles size={22} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>3. Optimización Funnel</h4>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              14% → 20% Conversión
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Mejora en onboarding de barberías para convertir más trials en pagos sin incrementar el costo publicitario.
            </p>
          </div>
        </div>
      ),
      takeaway: 'Resultado Proyectado: Caja siempre protegida (> $10,000), más de 2,500 clientes activos en Mes 24 y un saldo final superior a $140,000.',
      notes: [
        'Enfatizar el concepto de auto-financiamiento: el cobro anual convierte a los clientes en nuestros principales financistas.',
        'La junta no necesita aportar capital dilutivo adicional ni endeudarse.',
        'El escalonamiento en el Mes 13 aprovecha un MRR ya maduro que cubre los salarios fijos.',
      ],
    },
    {
      id: 'slide-4',
      tag: '04. SIMULADOR EN VIVO',
      title: 'Espacio de Preguntas de la Junta: Simulación Interactiva',
      subtitle: 'Ajuste en tiempo real para responder a escenarios planteados por los directores',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '20px' }}>
          {/* Controles en Vivo */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} /> Controles en Vivo para la Reunión
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Inversión Meses 1 a 12:</span>
                <strong style={{ color: '#38bdf8' }}>${cashflowState.spendM1_12.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="30000"
                step="1000"
                value={cashflowState.spendM1_12}
                onChange={(e) => setCashflowState((prev) => ({ ...prev, spendM1_12: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Inversión Meses 13 a 24:</span>
                <strong style={{ color: '#818cf8' }}>${cashflowState.spendM13_24.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="0"
                max="40000"
                step="1000"
                value={cashflowState.spendM13_24}
                onChange={(e) => setCashflowState((prev) => ({ ...prev, spendM13_24: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#818cf8' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <button
                onClick={() => setCashflowState((prev) => ({ ...prev, annualPlan: !prev.annualPlan }))}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: cashflowState.annualPlan ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                  background: cashflowState.annualPlan ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                  color: cashflowState.annualPlan ? '#34d399' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={15} />
                Plan Anual ({cashflowState.annualPlan ? 'SI' : 'NO'})
              </button>

              <button
                onClick={() => setCashflowState((prev) => ({ ...prev, improvedConversion: !prev.improvedConversion }))}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: cashflowState.improvedConversion ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                  background: cashflowState.improvedConversion ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                  color: cashflowState.improvedConversion ? '#c084fc' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={15} />
                Conv 20% ({cashflowState.improvedConversion ? 'SI' : '14%'})
              </button>
            </div>
          </div>

          {/* Resultado de la Prueba en Vivo */}
          <div
            style={{
              background: simCustom?.isViable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${simCustom?.isViable ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: simCustom?.isViable ? '#34d399' : '#f43f5e', marginBottom: '8px' }}>
                {simCustom?.isViable ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {simCustom?.isViable ? 'ESTRATEGIA VIABLE' : 'ALERTA DE QUIEBRA'}
                </h4>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                {simCustom?.isViable
                  ? `La caja no desciende del umbral de $10.000. Punto de mayor tensión en Mes ${simCustom?.minCashMonth}.`
                  : `Se perfora la reserva mínima en el Mes ${simCustom?.minCashMonth} con saldo crítico de ${formatMoney(simCustom?.minCash)}.`}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Caja Mínima</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: simCustom?.isViable ? '#34d399' : '#f43f5e' }}>
                  {formatMoney(simCustom?.minCash)}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Clientes M24</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                  {simCustom?.finalClients?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      takeaway: 'Esta vista permite responder en vivo a cualquier objeción de los directores: "¿Y si solo aumentamos $15k?", "¿Y si no sube la conversión?".',
      notes: [
        'Utilizar los controles para demostrar la sensibilidad del modelo.',
        'Mostrar cómo al desactivar el Plan Anual la caja vuelve a estar en riesgo.',
        'Cerrar pidiendo aprobación formal para la ejecución de la Estrategia Escalonada.',
      ],
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div
      className="presentation-overlay no-print"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090b14',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Barra Superior del Presentador */}
      <div
        style={{
          padding: '14px 28px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <Tv size={14} /> MODO JUNTA DIRECTIVA (LIVE)
          </div>

          {/* Selector de Diapositivas */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: currentSlide === idx ? '#4f46e5' : 'rgba(255,255,255,0.06)',
                  color: currentSlide === idx ? 'white' : '#94a3b8',
                  transition: 'all 0.2s',
                }}
              >
                {idx + 1}. {s.tag.split('.')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Acciones del Presentador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowNotes((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: showNotes ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.06)',
              border: showNotes ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              color: showNotes ? '#fbbf24' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <BookOpen size={14} />
            Notas del CEO [N]
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <X size={15} />
            Salir [ESC]
          </button>
        </div>
      </div>

      {/* Área Principal de la Diapositiva */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 48px',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#818cf8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {slide.tag}
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f8fafc', margin: '6px 0' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', margin: 0 }}>{slide.subtitle}</p>
        </div>

        {/* Contenido Visual */}
        {slide.content}

        {/* Takeaway / Conclusión */}
        <div
          style={{
            marginTop: '28px',
            background: 'rgba(30, 41, 59, 0.5)',
            borderLeft: '4px solid #6366f1',
            padding: '14px 20px',
            borderRadius: '0 12px 12px 0',
            fontSize: '0.92rem',
            color: '#e2e8f0',
          }}
        >
          {slide.takeaway}
        </div>

        {/* Notas del Orador (Colapsable) */}
        {showNotes && (
          <div
            style={{
              marginTop: '16px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
            }}
          >
            <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} /> Puntos Clave para Decir en la Junta (Notas del Orador):
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#fde68a', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {slide.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Barra Inferior con Navegación */}
      <div
        style={{
          padding: '16px 36px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            background: currentSlide === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
            color: currentSlide === 0 ? '#475569' : '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <ChevronLeft size={16} /> Diapositiva Anterior
        </button>

        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
          {currentSlide + 1} de {slides.length}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '10px',
            background: currentSlide === slides.length - 1 ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: currentSlide === slides.length - 1 ? '#475569' : 'white',
            border: 'none',
            cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: currentSlide === slides.length - 1 ? 'none' : '0 4px 15px rgba(99,102,241,0.3)',
          }}
        >
          Siguiente Diapositiva <ChevronRight size={16} />
        </button>
      </div>

      <style>{`
        .presenter-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(12px);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  );
}
