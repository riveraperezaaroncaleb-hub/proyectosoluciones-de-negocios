import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Save,
  FolderOpen,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  CalendarDays,
  Banknote,
  Share2,
  FileDown,
  Tv,
  Bot,
  Accessibility,
  Sun,
  Moon,
} from 'lucide-react';
import CONFIG from './config';
import { calcularUnitEconomics } from './engine';
import { SIMULATOR_CONFIG } from './cashflowConfig';
import { runSimulation } from './cashflowEngine';
import ControlPanel from './components/ControlPanel';
import KpiCards from './components/KpiCards';
import ValeriaBanner from './components/ValeriaBanner';
import { CashCurveChart, LtvVsCacChart, FunnelChart } from './components/Charts';
import CashflowSimulator from './components/CashflowSimulator';
import ShareModal from './components/ShareModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import PresentationMode from './components/PresentationMode';
import AiAdvisorModal from './components/AiAdvisorModal';
import AccessibilityModal from './components/AccessibilityModal';
import { getInitialStateFromUrl, syncUrlWithState } from './utils/urlState';
import './index.css';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  // ── Inicializar estado desde la URL si existe ──
  const initialData = useMemo(() => getInitialStateFromUrl(), []);

  const [activeTab, setActiveTab] = useState(initialData.activeTab);
  const [inputs, setInputs] = useState(initialData.inputs);
  const [cashflowState, setCashflowState] = useState(initialData.cashflowState);

  // ── Modos Visuales y Accesibilidad ──
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('agendo_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  });

  const [fontSize, setFontSize] = useState(() => localStorage.getItem('agendo_fontsize') || 'normal');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('agendo_contrast') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('agendo_motion') === 'true');

  // Modales y herramientas ejecutivas
  const [saveModal, setSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [notification, setNotification] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  // Sincronizar atributos de tema y accesibilidad en el HTML raíz
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agendo_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('agendo_fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    localStorage.setItem('agendo_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
    localStorage.setItem('agendo_motion', String(reducedMotion));
  }, [reducedMotion]);

  // Notificar si se cargó un escenario desde la URL compartida
  useEffect(() => {
    if (initialData.hasUrlParams) {
      showNotification('¡Escenario cargado desde enlace compartido!', 'success');
    }
  }, [initialData.hasUrlParams]);

  // Sincronizar URL silenciosamente cada vez que cambian los parámetros
  useEffect(() => {
    syncUrlWithState({ activeTab, inputs, cashflowState });
  }, [activeTab, inputs, cashflowState]);

  // Atajos de teclado globales (Accesibilidad y productividad)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo en un input o textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Escape: cerrar modales abiertos
      if (e.key === 'Escape') {
        setIsPresentationOpen(false);
        setIsAiAdvisorOpen(false);
        setIsAccessibilityOpen(false);
        setIsShareModalOpen(false);
        setIsExecutiveReportOpen(false);
        setSaveModal(false);
        return;
      }

      // Alt + T o tecla 'T': Alternar modo claro / oscuro
      if ((e.altKey && (e.key === 't' || e.key === 'T')) || e.key === 't' || e.key === 'T') {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
        return;
      }

      // Alt + A o tecla 'A': Abrir menú de Accesibilidad
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || e.key === 'a' || e.key === 'A') {
        setIsAccessibilityOpen((prev) => !prev);
        return;
      }

      // Alt + I o tecla 'I': Abrir Asesor IA Copilot
      if ((e.altKey && (e.key === 'i' || e.key === 'I')) || e.key === 'i' || e.key === 'I') {
        setIsAiAdvisorOpen((prev) => !prev);
        return;
      }

      // Tecla 'P': Modo Presentación
      if (e.key === 'p' || e.key === 'P') {
        setIsPresentationOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Cálculos Nivel 2: Unit Economics ──
  const results = useMemo(() => calcularUnitEconomics(inputs), [inputs]);

  // ── Cálculos Nivel 3: Simulaciones de Caja para Reportes y Presentación ──
  const simHoy = useMemo(
    () =>
      runSimulation(SIMULATOR_CONFIG, {
        spendM1_12: 10000,
        spendM13_24: 10000,
        annualPlan: false,
        improvedConversion: false,
      }),
    []
  );

  const simValeria = useMemo(
    () =>
      runSimulation(SIMULATOR_CONFIG, {
        spendM1_12: 30000,
        spendM13_24: 30000,
        annualPlan: false,
        improvedConversion: false,
      }),
    []
  );

  const simCustom = useMemo(
    () => runSimulation(SIMULATOR_CONFIG, cashflowState),
    [cashflowState]
  );

  const simHacked = useMemo(
    () =>
      runSimulation(SIMULATOR_CONFIG, {
        spendM1_12: 10000,
        spendM13_24: 25000,
        annualPlan: true,
        improvedConversion: true,
      }),
    []
  );

  const handleReset = useCallback(() => {
    setInputs({ ...CONFIG.defaults });
    showNotification('Datos reseteados a Agendo', 'info');
  }, []);

  const handleSave = async () => {
    if (!scenarioName.trim()) return;
    try {
      await fetch(`${API_BASE}/scenarios/${scenarioName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      showNotification(`Escenario "${scenarioName}" guardado`, 'success');
      setSaveModal(false);
      setScenarioName('');
    } catch {
      showNotification('Error al guardar — ¿Backend corriendo?', 'error');
    }
  };

  const handleLoad = async () => {
    const name = prompt('Nombre del escenario a cargar:');
    if (!name) return;
    try {
      const res = await fetch(`${API_BASE}/scenarios/${name}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInputs(data);
      showNotification(`Escenario "${name}" cargado`, 'success');
    } catch {
      showNotification(`No se encontró el escenario "${name}"`, 'error');
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const notifIcon = {
    error: <AlertTriangle size={15} />,
    success: <CheckCircle size={15} />,
    info: <Info size={15} />,
  };
  const notifColors = {
    error: { bg: 'rgba(244,63,94,0.22)', border: 'rgba(244,63,94,0.5)' },
    success: { bg: 'rgba(16,185,129,0.22)', border: 'rgba(16,185,129,0.5)' },
    info: { bg: 'rgba(99,102,241,0.22)', border: 'rgba(99,102,241,0.5)' },
  };

  return (
    <div className="dashboard">
      {/* ── Notification Toast ── */}
      {notification && (
        <div
          className="no-print"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 10001,
            padding: '12px 20px',
            borderRadius: '14px',
            backdropFilter: 'blur(24px)',
            background: notifColors[notification.type]?.bg,
            border: `1px solid ${notifColors[notification.type]?.border}`,
            color: 'var(--text-primary)',
            fontSize: '0.86rem',
            fontWeight: 600,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          }}
        >
          {notifIcon[notification.type]}
          {notification.msg}
        </div>
      )}

      {/* ── Header Principal con Herramientas Ejecutivas ── */}
      <header className="dashboard-header no-print" style={{ flexWrap: 'wrap', gap: '16px' }}>
        {/* Logo */}
        <div className="dashboard-header__logo">
          <div className="dashboard-header__icon">
            <CalendarDays size={24} color="white" />
          </div>
          <div>
            <div className="dashboard-header__title">
              {CONFIG.meta.businessName} — Business Intelligence
            </div>
            <div className="dashboard-header__subtitle">
              Caso Agendo · Modelado Financiero Cuantitativo
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            padding: '6px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(12px)',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setActiveTab('level2')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.2s',
              background:
                activeTab === 'level2'
                  ? 'var(--gradient-primary)'
                  : 'transparent',
              color: activeTab === 'level2' ? 'white' : 'var(--text-secondary)',
              boxShadow:
                activeTab === 'level2' ? '0 4px 15px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            <BarChart3 size={14} />
            Nivel 2: Unit Economics
          </button>
          <button
            onClick={() => setActiveTab('level3')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.2s',
              background:
                activeTab === 'level3'
                  ? 'linear-gradient(135deg, #10b981, #0d9488)'
                  : 'transparent',
              color: activeTab === 'level3' ? 'white' : 'var(--text-secondary)',
              boxShadow:
                activeTab === 'level3' ? '0 4px 15px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            <Banknote size={14} />
            Nivel 3: Simulador de Caja (24m)
          </button>
        </div>

        {/* ── BOTONES DE ALTO IMPACTO, IA Y ACCESIBILIDAD ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* BOTÓN ASESOR IA COPILOT */}
          <button
            onClick={() => setIsAiAdvisorOpen(true)}
            className="btn btn--primary"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Abrir Asesor Cuantitativo con IA Directa (Atajo: Alt + I o tecla I)"
            aria-label="Abrir Asesor Inteligente con IA"
          >
            <Bot size={15} />
            Asesor IA
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
                display: 'inline-block',
              }}
            />
          </button>

          {/* BOTÓN ACCESIBILIDAD */}
          <button
            onClick={() => setIsAccessibilityOpen(true)}
            className="btn btn--ghost"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Centro de Accesibilidad y Lectura por Voz (Atajo: Alt + A o tecla A)"
            aria-label="Centro de Accesibilidad"
          >
            <Accessibility size={15} color="var(--accent-cyan)" />
            Accesibilidad
          </button>

          {/* BOTÓN MODO CLARO / OSCURO RÁPIDO */}
          <button
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="btn btn--ghost"
            style={{
              padding: '8px 11px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`Cambiar a ${theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'} (Atajo: Alt + T o tecla T)`}
            aria-label={`Cambiar a ${theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}`}
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="var(--accent-primary)" />}
          </button>

          {/* 1. URL Compartible */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn btn--ghost"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Generar enlace compartible con el estado exacto de la simulación"
          >
            <Share2 size={14} color="var(--accent-cyan)" />
            Compartir URL
          </button>

          {/* 2. Exportar PDF */}
          <button
            onClick={() => setIsExecutiveReportOpen(true)}
            className="btn btn--ghost"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Generar reporte ejecutivo imprimible para Board o Inversores"
          >
            <FileDown size={14} color="var(--accent-emerald)" />
            Exportar PDF
          </button>

          {/* 3. Modo Presentación */}
          <button
            onClick={() => setIsPresentationOpen(true)}
            className="btn btn--primary"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Modo pantalla completa para presentar en vivo a la junta (Atajo: tecla P)"
          >
            <Tv size={14} />
            Presentación [P]
          </button>

          {/* Actions legacy de persistencia backend en Nivel 2 */}
          {activeTab === 'level2' && (
            <div style={{ display: 'flex', gap: '6px', marginLeft: '4px', borderLeft: '1px solid var(--border-color)', paddingLeft: '8px' }}>
              <button className="btn btn--ghost" style={{ padding: '7px 11px', fontSize: '0.74rem' }} onClick={handleLoad} title="Cargar desde backend local">
                <FolderOpen size={13} />
                Cargar
              </button>
              <button className="btn btn--primary" style={{ padding: '7px 11px', fontSize: '0.74rem' }} onClick={() => setSaveModal(true)} title="Guardar en backend local">
                <Save size={13} />
                Guardar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── VISTA NIVEL 2: UNIT ECONOMICS ── */}
      {activeTab === 'level2' && (
        <div className="dashboard-grid animate-fadeIn">
          <ControlPanel inputs={inputs} onChange={setInputs} onReset={handleReset} />
          <main>
            <ValeriaBanner results={results} />
            <KpiCards results={results} />
            <div className="charts-grid">
              <CashCurveChart results={results} theme={theme} />
              <LtvVsCacChart results={results} theme={theme} />
              <FunnelChart results={results} theme={theme} />
            </div>
          </main>
        </div>
      )}

      {/* ── VISTA NIVEL 3: SIMULADOR DE CAJA A 24 MESES ── */}
      {activeTab === 'level3' && (
        <main className="animate-fadeIn">
          <CashflowSimulator
            spendM1_12={cashflowState.spendM1_12}
            setSpendM1_12={(val) => setCashflowState((prev) => ({ ...prev, spendM1_12: val }))}
            spendM13_24={cashflowState.spendM13_24}
            setSpendM13_24={(val) => setCashflowState((prev) => ({ ...prev, spendM13_24: val }))}
            annualPlan={cashflowState.annualPlan}
            setAnnualPlan={(val) => setCashflowState((prev) => ({ ...prev, annualPlan: typeof val === 'function' ? val(prev.annualPlan) : val }))}
            improvedConversion={cashflowState.improvedConversion}
            setImprovedConversion={(val) => setCashflowState((prev) => ({ ...prev, improvedConversion: typeof val === 'function' ? val(prev.improvedConversion) : val }))}
            onOpenPresentation={() => setIsPresentationOpen(true)}
            onExportPdf={() => setIsExecutiveReportOpen(true)}
            onShareUrl={() => setIsShareModalOpen(true)}
          />
        </main>
      )}

      {/* ── Modal IA: Asesor Cuantitativo & Copilot Directo ── */}
      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        inputs={inputs}
        setInputs={setInputs}
        results={results}
        cashflowState={cashflowState}
        setCashflowState={setCashflowState}
        activeTab={activeTab}
        showNotification={showNotification}
      />

      {/* ── Modal Accesibilidad & Centro Visual ── */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        results={results}
        showNotification={showNotification}
      />

      {/* ── Modal 1: Compartir URL (Estado Compartible Cero Backend) ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeTab={activeTab}
        inputs={inputs}
        cashflowState={cashflowState}
      />

      {/* ── Modal 2: Reporte Ejecutivo / Exportación PDF ── */}
      <ExecutiveReportModal
        isOpen={isExecutiveReportOpen}
        onClose={() => setIsExecutiveReportOpen(false)}
        activeTab={activeTab}
        inputs={inputs}
        results={results}
        simHoy={simHoy}
        simValeria={simValeria}
        simCustom={simCustom}
        simHacked={simHacked}
        cashflowState={cashflowState}
      />

      {/* ── Modal 3: Modo Presentación (Junta Directiva Live) ── */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        results={results}
        simHoy={simHoy}
        simValeria={simValeria}
        simCustom={simCustom}
        simHacked={simHacked}
        cashflowState={cashflowState}
        setCashflowState={setCashflowState}
      />

      {/* ── Modal Guardar Escenario Backend ── */}
      {saveModal && (
        <div className="modal-overlay no-print" onClick={() => setSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 className="modal__title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} color="var(--accent-primary)" />
                Guardar Escenario
              </h3>
              <button
                onClick={() => setSaveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>
            <input
              className="modal__input"
              placeholder="Nombre del escenario..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setSaveModal(false)}>
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={handleSave}>
                <Save size={13} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
