import { useState, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('level3');
  const [inputs, setInputs] = useState({ ...CONFIG.defaults });
  const [saveModal, setSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [notification, setNotification] = useState(null);

  const results = useMemo(() => calcularUnitEconomics(inputs), [inputs]);

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

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const notifIcon = {
    error: <AlertTriangle size={15} />,
    success: <CheckCircle size={15} />,
    info: <Info size={15} />,
  };
  const notifColors = {
    error: { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.35)' },
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' },
    info: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)' },
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
            padding: '10px 18px',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            background: notifColors[notification.type]?.bg,
            border: `1px solid ${notifColors[notification.type]?.border}`,
            color: '#e2e8f0',
            fontSize: '0.84rem',
            fontWeight: 500,
            animation: 'slideUp 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {notifIcon[notification.type]}
          {notification.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="dashboard-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
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
            background: 'rgba(15,15,26,0.8)',
            padding: '6px',
            borderRadius: '14px',
            border: '1px solid rgba(99,102,241,0.2)',
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
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
              color: activeTab === 'level2' ? 'white' : '#94a3b8',
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
              color: activeTab === 'level3' ? 'white' : '#94a3b8',
              boxShadow:
                activeTab === 'level3' ? '0 4px 15px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            <Banknote size={14} />
            Nivel 3: Simulador de Caja (24m)
          </button>
        </div>

        {/* Actions (solo en Nivel 2) */}
        {activeTab === 'level2' && (
          <div className="dashboard-header__actions">
            <button className="btn btn--ghost" onClick={handleLoad}>
              <FolderOpen size={14} />
              Cargar
            </button>
            <button className="btn btn--primary" onClick={() => setSaveModal(true)}>
              <Save size={14} />
              Guardar
            </button>
          </div>
        )}
      </header>

      {/* ── VISTA NIVEL 2: UNIT ECONOMICS ── */}
      {activeTab === 'level2' && (
        <div className="dashboard-grid animate-fadeIn">
          <ControlPanel inputs={inputs} onChange={setInputs} onReset={handleReset} />
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

      {/* ── Save Modal ── */}
      {saveModal && (
        <div className="modal-overlay" onClick={() => setSaveModal(false)}>
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
