import { useState, useMemo, useCallback } from 'react';
import CONFIG from './config';
import { calcularUnitEconomics } from './engine';
import ControlPanel from './components/ControlPanel';
import KpiCards from './components/KpiCards';
import ValeriaBanner from './components/ValeriaBanner';
import { CashCurveChart, LtvVsCacChart, FunnelChart } from './components/Charts';
import CashflowSimulator from './components/CashflowSimulator';
import './index.css';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  // ── Tab activo: 'level2' (Unit Economics) | 'level3' (Simulador de Caja) ──
  const [activeTab, setActiveTab] = useState('level3');

  // ── Estado de los inputs (sliders Nivel 2) ──────────────────
  const [inputs, setInputs] = useState({ ...CONFIG.defaults });
  const [saveModal, setSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [notification, setNotification] = useState(null);

  // ── Cálculo reactivo Nivel 2 ───────────────────────────────
  const results = useMemo(() => calcularUnitEconomics(inputs), [inputs]);

  // ── Reset Nivel 2 ──────────────────────────────────────────
  const handleReset = useCallback(() => {
    setInputs({ ...CONFIG.defaults });
    showNotification('🔄 Datos reseteados a Agendo', 'info');
  }, []);

  // ── Guardar escenario (backend) ────────────────────────────
  const handleSave = async () => {
    if (!scenarioName.trim()) return;
    try {
      await fetch(`${API_BASE}/scenarios/${scenarioName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      showNotification(`💾 Escenario "${scenarioName}" guardado`, 'success');
      setSaveModal(false);
      setScenarioName('');
    } catch {
      showNotification('❌ Error al guardar — ¿Backend corriendo?', 'error');
    }
  };

  // ── Cargar escenario (backend) ─────────────────────────────
  const handleLoad = async () => {
    const name = prompt('Nombre del escenario a cargar:');
    if (!name) return;
    try {
      const res = await fetch(`${API_BASE}/scenarios/${name}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInputs(data);
      showNotification(`📂 Escenario "${name}" cargado`, 'success');
    } catch {
      showNotification(`❌ No se encontró el escenario "${name}"`, 'error');
    }
  };

  // ── Notificaciones ─────────────────────────────────────────
  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="dashboard">
      {/* ── Notification Toast ── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 100,
            padding: '12px 20px',
            borderRadius: '10px',
            backdropFilter: 'blur(20px)',
            background:
              notification.type === 'error'
                ? 'rgba(244, 63, 94, 0.15)'
                : notification.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${
              notification.type === 'error'
                ? 'rgba(244, 63, 94, 0.3)'
                : notification.type === 'success'
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(99, 102, 241, 0.3)'
            }`,
            color: '#e2e8f0',
            fontSize: '0.85rem',
            fontWeight: 500,
            animation: 'slideUp 0.3s',
          }}
        >
          {notification.msg}
        </div>
      )}

      {/* ── Header con Selector de Nivel ── */}
      <header className="dashboard-header flex-wrap gap-4">
        <div className="dashboard-header__logo">
          <div className="dashboard-header__icon">{CONFIG.meta.logo}</div>
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
        <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-indigo-500/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('level2')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'level2'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📊</span> Nivel 2: Unit Economics
          </button>
          <button
            onClick={() => setActiveTab('level3')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'level3'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💰</span> Nivel 3: Simulador de Caja (24m)
          </button>
        </div>

        {activeTab === 'level2' && (
          <div className="dashboard-header__actions">
            <button className="btn btn--ghost" onClick={handleLoad}>
              📂 Cargar
            </button>
            <button className="btn btn--primary" onClick={() => setSaveModal(true)}>
              💾 Guardar
            </button>
          </div>
        )}
      </header>

      {/* ── VISTA NIVEL 2: UNIT ECONOMICS ── */}
      {activeTab === 'level2' && (
        <div className="dashboard-grid animate-fadeIn">
          {/* Left: Control Panel */}
          <ControlPanel inputs={inputs} onChange={setInputs} onReset={handleReset} />

          {/* Right: Results */}
          <main>
            <ValeriaBanner results={results} />
            <KpiCards results={results} />
            <div className="charts-grid">
              <CashCurveChart results={results} />
              <LtvVsCacChart results={results} />
              <FunnelChart results={results} />
            </div>
          </main>
        </div>
      )}

      {/* ── VISTA NIVEL 3: SIMULADOR DE CAJA A 24 MESES ── */}
      {activeTab === 'level3' && (
        <main className="animate-fadeIn">
          <CashflowSimulator />
        </main>
      )}

      {/* ── Save Modal (Nivel 2) ── */}
      {saveModal && (
        <div className="modal-overlay" onClick={() => setSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">💾 Guardar Escenario</h3>
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
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
