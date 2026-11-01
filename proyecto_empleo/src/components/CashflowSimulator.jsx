import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Zap, Shield, Target, Search, CheckCircle2, XCircle,
  TrendingUp, Users, DollarSign, BarChart3, Briefcase,
  Table2, X, Settings2, AlertTriangle, Lightbulb, Scale,
  Calculator,
} from 'lucide-react';
import { SIMULATOR_CONFIG } from '../cashflowConfig';
import { runSimulation, formatMoney, goalSeekMaxSafeSpend, goalSeekTargetClients } from '../cashflowEngine';

export default function CashflowSimulator() {
  // Estrategia del usuario
  const [spendM1_12, setSpendM1_12] = useState(10000);
  const [spendM13_24, setSpendM13_24] = useState(20000);
  const [annualPlan, setAnnualPlan] = useState(false);
  const [improvedConversion, setImprovedConversion] = useState(false);
  const [showMathModal, setShowMathModal] = useState(false);

  // Estado del Goal Seek
  const [targetClients, setTargetClients] = useState(2200);
  const [isSolvingGoalSeek, setIsSolvingGoalSeek] = useState(false);
  const [goalSeekResult, setGoalSeekResult] = useState(null);

  // ── 1. Ejecutar las 4 simulaciones para comparación ────────
  const currentStrategy = useMemo(() => ({
    spendM1_12,
    spendM13_24,
    annualPlan,
    improvedConversion,
  }), [spendM1_12, spendM13_24, annualPlan, improvedConversion]);

  // Escenario 1: Hoy ($10k fijos, sin mejoras)
  const simHoy = useMemo(() => runSimulation(SIMULATOR_CONFIG, {
    spendM1_12: 10000,
    spendM13_24: 10000,
    annualPlan: false,
    improvedConversion: false,
  }), []);

  // Escenario 2: Valeria ($30k fijos, sin mejoras)
  const simValeria = useMemo(() => runSimulation(SIMULATOR_CONFIG, {
    spendM1_12: 30000,
    spendM13_24: 30000,
    annualPlan: false,
    improvedConversion: false,
  }), []);

  // Escenario 3: Personalizado 1 (con los controles actuales)
  const simCustom = useMemo(() => runSimulation(SIMULATOR_CONFIG, currentStrategy), [currentStrategy]);

  // Escenario 4: Personalizado 2 (Estrategia Óptima con Hack: Escalonada + Plan Anual + Conv 20%)
  const simHacked = useMemo(() => runSimulation(SIMULATOR_CONFIG, {
    spendM1_12: 10000,
    spendM13_24: 25000,
    annualPlan: true,
    improvedConversion: true,
  }), []);

  const scenarios = [
    { title: '1. Plan Actual (Hoy)', data: simHoy, badge: '$10k Fijos', color: '#06b6d4' },
    { title: '2. Plan Valeria', data: simValeria, badge: '$30k Fijos', color: '#f43f5e' },
    { title: '3. Tu Estrategia', data: simCustom, badge: 'Personalizada', color: '#6366f1' },
    { title: '4. Estrategia Ganadora (Hack)', data: simHacked, badge: 'Escalonada + Anual + 20%', color: '#10b981' },
  ];

  // ── Función para animar el movimiento de los sliders al valor óptimo ──
  const animateSliderTo = (targetM1_12, targetM13_24) => {
    const startM1 = spendM1_12;
    const startM13 = spendM13_24;
    const steps = 15;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const currentVal1 = Math.round(startM1 + (targetM1_12 - startM1) * progress);
      const currentVal13 = Math.round(startM13 + (targetM13_24 - startM13) * progress);

      setSpendM1_12(currentVal1);
      setSpendM13_24(currentVal13);

      if (step >= steps) {
        clearInterval(interval);
        setSpendM1_12(targetM1_12);
        setSpendM13_24(targetM13_24);
      }
    }, 25);
  };

  // ── Goal Seek 1: Maximizar Inversión Segura (Piso $10k) ─────
  const handleGoalSeekMaxSafe = () => {
    setIsSolvingGoalSeek(true);
    setTimeout(() => {
      const res = goalSeekMaxSafeSpend(SIMULATOR_CONFIG, {
        annualPlan,
        improvedConversion,
      });

      setGoalSeekResult({
        type: 'max_safe',
        optimalSpend: res.optimalSpend,
        minCash: res.simulation.minCash,
        finalClients: res.simulation.finalClients,
        iterations: res.iterations,
        executionTimeMs: res.executionTimeMs,
        isSafe: true,
      });

      // Mover los sliders suavemente al valor encontrado
      animateSliderTo(res.optimalSpend, res.optimalSpend);
      setIsSolvingGoalSeek(false);
    }, 150);
  };

  // ── Goal Seek 2: Meta de Clientes al Mes 24 ─────────────────
  const handleGoalSeekTargetClients = () => {
    setIsSolvingGoalSeek(true);
    setTimeout(() => {
      const res = goalSeekTargetClients(SIMULATOR_CONFIG, targetClients, {
        annualPlan,
        improvedConversion,
      });

      setGoalSeekResult({
        type: 'target_clients',
        optimalSpend: res.requiredSpend,
        minCash: res.simulation ? res.simulation.minCash : 0,
        finalClients: res.simulation ? res.simulation.finalClients : 0,
        iterations: res.iterations,
        executionTimeMs: res.executionTimeMs,
        isSafe: res.isSafe,
        targetRequested: targetClients,
      });

      // Mover los sliders suavemente al valor encontrado
      animateSliderTo(res.requiredSpend, res.requiredSpend);
      setIsSolvingGoalSeek(false);
    }, 150);
  };

  // ── 2. Datos para Gráficos ──────────────────────────────────
  const labels24 = Array.from({ length: 24 }, (_, i) => `Mes ${i + 1}`);

  // Gráfico de Caja
  const cashChartData = {
    labels: labels24,
    datasets: [
      {
        label: 'Hoy ($10k)',
        data: simHoy.months.map(m => m.cajaFinal),
        borderColor: '#06b6d4',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.25,
      },
      {
        label: 'Valeria ($30k)',
        data: simValeria.months.map(m => m.cajaFinal),
        borderColor: '#f43f5e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.25,
      },
      {
        label: 'Tu Estrategia',
        data: simCustom.months.map(m => m.cajaFinal),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        borderWidth: 3,
        tension: 0.25,
      },
      {
        label: 'Estrategia Ganadora',
        data: simHacked.months.map(m => m.cajaFinal),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 4],
        tension: 0.25,
      },
    ],
  };

  const cashChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
      annotation: {
        annotations: {
          floorLine: {
            type: 'line',
            yMin: 10000,
            yMax: 10000,
            borderColor: '#f43f5e',
            borderWidth: 2,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'PISO DE SEGURIDAD ($10.000)',
              position: 'start',
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              color: '#f43f5e',
              font: { family: 'Inter', size: 10, weight: 'bold' },
            },
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(99, 102, 241, 0.08)' } },
      y: {
        ticks: { color: '#94a3b8', callback: (v) => `$${v / 1000}k` },
        grid: { color: 'rgba(99, 102, 241, 0.08)' },
      },
    },
  };

  // Gráfico de Clientes Activos
  const clientsChartData = {
    labels: labels24,
    datasets: [
      {
        label: 'Hoy ($10k)',
        data: simHoy.months.map(m => m.clientesActivosFinMes),
        borderColor: '#06b6d4',
        borderWidth: 2,
        tension: 0.25,
      },
      {
        label: 'Valeria ($30k)',
        data: simValeria.months.map(m => m.clientesActivosFinMes),
        borderColor: '#f43f5e',
        borderWidth: 2,
        tension: 0.25,
      },
      {
        label: 'Tu Estrategia',
        data: simCustom.months.map(m => m.clientesActivosFinMes),
        borderColor: '#6366f1',
        borderWidth: 3,
        tension: 0.25,
      },
      {
        label: 'Estrategia Ganadora',
        data: simHacked.months.map(m => m.clientesActivosFinMes),
        borderColor: '#10b981',
        borderWidth: 2,
        borderDash: [5, 4],
        tension: 0.25,
      },
    ],
  };

  const clientsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(99, 102, 241, 0.08)' } },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(99, 102, 241, 0.08)' },
      },
    },
  };

  // ── 3. Pitch para Ricardo Dinámico ──────────────────────────
  const pitchText = useMemo(() => {
    const isValeriaDead = !simValeria.isViable;
    const isCustomSafe = simCustom.isViable;

    let recSpend = `Inversión Mes 1-12: $${spendM1_12.toLocaleString()} / Mes 13-24: $${spendM13_24.toLocaleString()}`;
    let statusPhrase = isCustomSafe
      ? `Tu estrategia es SOSTENIBLE. La caja mínima proyectada es de ${formatMoney(simCustom.minCash)} (Mes ${simCustom.minCashMonth}), manteniéndose por encima del piso de $10.000.`
      : `RIESGO DE QUIEBRA: Tu estrategia perfora el piso de $10.000 en el Mes ${simCustom.minCashMonth} con una caja de ${formatMoney(simCustom.minCash)}.`;

    let valeriaCritique = isValeriaDead
      ? `El plan de Valeria ($30.000 fijos de inmediato) QUEMA LA CAJA en el Mes ${simValeria.minCashMonth} (cae a ${formatMoney(simValeria.minCash)}). El crecimiento desmedido en anuncios genera costos tempranos de vendedoras y comisiones antes de que los ingresos acumulados puedan solventarlos.`
      : `El plan de Valeria requiere un colchón de capital mucho mayor.`;

    let hackTip = !annualPlan
      ? `RECOMENDACIÓN CLAVE: Si activas el "Plan Anual Upfront", los nuevos clientes adelantan $240 en efectivo. Esto inyecta liquidez inmediata en los primeros meses y te permite financiar una mayor inversión en anuncios sin poner en riesgo la solvencia.`
      : `EXCELENTE DECISIÓN: Con el Plan Anual activado, estás capturando efectivo por adelantado, lo que te permite sostener una mayor inversión en captación y maximizar los clientes en el Mes 24.`;

    return { recSpend, statusPhrase, valeriaCritique, hackTip };
  }, [simCustom, simValeria, spendM1_12, spendM13_24, annualPlan]);

  return (
    <div className="space-y-6">
      {/* ── PANEL DE GOAL SEEK ── */}
      <section className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Buscador de Metas (Goal Seek Cuantitativo)
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  Búsqueda Binaria O(log N)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calcula automáticamente la inversión exacta al dólar y mueve los sliders de inmediato.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Opción 1: Maximizar Inversión sin romper piso */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                <Shield size={13} /> Meta 1: Maximizar Inversión Segura
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Encuentra la máxima inversión mensual en anuncios que exprime el crecimiento sin perforar el piso de <strong>$10.000</strong>.
              </p>
            </div>
            <button
              onClick={handleGoalSeekMaxSafe}
              disabled={isSolvingGoalSeek}
              className="btn btn--primary w-full text-xs py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all"
            >
              {isSolvingGoalSeek ? (
                <span className="flex items-center gap-2"><Calculator size={13} /> Calculando iteraciones...</span>
              ) : (
                <span className="flex items-center gap-2"><Target size={13} /> Optimizar Máxima Inversión</span>
              )}
            </button>
          </div>

          {/* Opción 2: Meta de Clientes al Mes 24 */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Users size={13} /> Meta 2: Objetivo de Clientes Mes 24
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Ingresa cuántos clientes activos deseas tener en el Mes 24:
              </p>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  min="1200"
                  max="4000"
                  step="50"
                  value={targetClients}
                  onChange={(e) => setTargetClients(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap">clientes</span>
              </div>
            </div>
            <button
              onClick={handleGoalSeekTargetClients}
              disabled={isSolvingGoalSeek}
              className="btn w-full text-xs py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all"
            >
              {isSolvingGoalSeek ? (
                <span className="flex items-center gap-2"><Search size={13} /> Buscando solución...</span>
              ) : (
                <span className="flex items-center gap-2"><Target size={13} /> Buscar Inversión para Meta</span>
              )}
            </button>
          </div>

          {/* Resultado de la Búsqueda Binaria */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60 min-h-[140px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5"><BarChart3 size={12} /> Resultado Algorítmico</span>
              {goalSeekResult && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  {goalSeekResult.iterations} pasos · {goalSeekResult.executionTimeMs}ms
                </span>
              )}
            </div>

            {goalSeekResult ? (
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Inversión calculada:</span>
                  <span className="font-bold text-white text-sm">
                    ${goalSeekResult.optimalSpend.toLocaleString()}/mes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Caja mínima resultante:</span>
                  <span className={`font-bold ${goalSeekResult.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatMoney(goalSeekResult.minCash)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clientes proyectados M24:</span>
                  <span className="font-bold text-cyan-400">
                    {goalSeekResult.finalClients.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] pt-1 font-sans flex items-center gap-1">
                  {goalSeekResult.isSafe ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Sliders sincronizados. Caja protegida.
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> Para esa meta la caja cae por debajo de $10k.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-2 gap-2">
                <Search size={20} />
                <span className="text-[11px]">Presiona un botón para ejecutar la búsqueda binaria.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Controles de Estrategia ── */}
      <section className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings2 size={18} className="text-indigo-400" /> Controles de Inversión y Estrategia
            </h2>
            <p className="text-sm text-slate-400">
              Modela la aceleración de inversión en anuncios y activa las palancas de optimización de Nivel 1.
            </p>
          </div>
          <button
            onClick={() => setShowMathModal(true)}
            className="btn btn--primary flex items-center gap-2 text-xs py-2 px-4 shadow-lg shadow-indigo-500/20"
          >
            <Calculator size={13} /> Ver Matemática Mes 1 ($56,819.50)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Slider Mes 1-12 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 transition-all">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">Inversión Mes 1 al 12</label>
              <span className="text-sm font-bold text-indigo-400 font-mono transition-all">
                ${spendM1_12.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="50"
              value={spendM1_12}
              onChange={(e) => setSpendM1_12(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>$0</span>
              <span>$15k</span>
              <span>$30k</span>
            </div>
          </div>

          {/* Slider Mes 13-24 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 transition-all">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">Inversión Mes 13 al 24</label>
              <span className="text-sm font-bold text-indigo-400 font-mono transition-all">
                ${spendM13_24.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="50"
              value={spendM13_24}
              onChange={(e) => setSpendM13_24(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>$0</span>
              <span>$15k</span>
              <span>$30k</span>
            </div>
          </div>

          {/* Toggle Plan Anual */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1">Palanca: Plan Anual Upfront</div>
              <p className="text-[11px] text-slate-400">10% de clientes pagan $240 por adelantado.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={annualPlan}
                onChange={(e) => setAnnualPlan(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className={`ml-3 text-xs font-medium flex items-center gap-1 ${annualPlan ? 'text-emerald-400' : 'text-slate-400'}`}>
                {annualPlan ? <><CheckCircle2 size={12} /> Activado</> : 'Desactivado'}
              </span>
            </label>
          </div>

          {/* Toggle Mejora Conversión */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1">Palanca: Conversión Trial</div>
              <p className="text-[11px] text-slate-400">Mejorar trial → pago del 14% al 20%.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={improvedConversion}
                onChange={(e) => setImprovedConversion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className={`ml-3 text-xs font-medium flex items-center gap-1 ${improvedConversion ? 'text-emerald-400' : 'text-slate-400'}`}>
                {improvedConversion ? <><CheckCircle2 size={12} /> 20% (Mejorado)</> : '14% (Base)'}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* ── Comparador de los 4 Escenarios ── */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Scale size={18} className="text-indigo-400" /> Comparador de Escenarios (Criterio de Piso de $10.000)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc, i) => {
            const isSafe = sc.data.isViable;
            return (
              <div
                key={i}
                className="relative bg-slate-900/70 border rounded-2xl p-5 backdrop-blur-md shadow-lg transition-all hover:scale-[1.01]"
                style={{ borderColor: isSafe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.4)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{sc.title}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                  >
                    {sc.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-400">Caja Mínima Alcanzada</div>
                    <div
                      className="text-xl font-black font-mono"
                      style={{ color: isSafe ? '#10b981' : '#f43f5e' }}
                    >
                      {formatMoney(sc.data.minCash)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Ocurre en: Mes {sc.data.minCashMonth}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Clientes Mes 24</div>
                      <div className="text-sm font-bold text-white font-mono">
                        {sc.data.finalClients.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Caja Mes 24</div>
                      <div className="text-sm font-bold text-white font-mono">
                        {formatMoney(sc.data.finalCash)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span
                      className={`inline-flex w-full items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-bold ${
                        isSafe
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isSafe ? <><CheckCircle2 size={12} /> Viable (Caja Protegida)</> : <><XCircle size={12} /> Descalificado (&lt; $10k)</>}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Gráficos ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Caja */}
        <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col h-[380px]">
          <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><TrendingUp size={15} className="text-indigo-400" /> Evolución de Caja a 24 Meses</span>
            <span className="text-[11px] text-rose-400 font-semibold">Piso de Seguridad: $10.000</span>
          </h4>
          <div className="flex-1 relative">
            <Line
              key={`cash-${spendM1_12}-${spendM13_24}-${annualPlan}-${improvedConversion}`}
              data={cashChartData}
              options={cashChartOptions}
              redraw={false}
            />
          </div>
        </div>

        {/* Gráfico de Clientes Activos */}
        <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col h-[380px]">
          <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
            <Users size={15} className="text-cyan-400" /> Evolución de Clientes Activos (Mes 1 a 24)
          </h4>
          <div className="flex-1 relative">
            <Line
              key={`clients-${spendM1_12}-${spendM13_24}-${annualPlan}-${improvedConversion}`}
              data={clientsChartData}
              options={clientsChartOptions}
              redraw={false}
            />
          </div>
        </div>
      </section>

      {/* ── El Pitch para Ricardo ── */}
      <section className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Briefcase size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">El Pitch para Ricardo (Resumen Ejecutivo)</h3>
            <p className="text-xs text-slate-400">Argumentario cuantitativo para sustentar la decisión ante el Board.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 flex gap-2">
            <DollarSign size={15} className="text-indigo-400 mt-0.5 shrink-0" />
            <span><strong>Estrategia Recomendada:</strong> {pitchText.recSpend}.</span>
          </p>
          <p className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 flex gap-2">
            <TrendingUp size={15} className="text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>Diagnóstico de Viabilidad:</strong> {pitchText.statusPhrase}</span>
          </p>
          <p className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/20 text-rose-200 flex gap-2">
            <AlertTriangle size={15} className="text-rose-400 mt-0.5 shrink-0" />
            <span><strong>La Trampa del Plan de Valeria:</strong> {pitchText.valeriaCritique}</span>
          </p>
          <p className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-emerald-200 flex gap-2">
            <Lightbulb size={15} className="text-emerald-400 mt-0.5 shrink-0" />
            <span><strong>La Solución Financiera (Hack):</strong> {pitchText.hackTip}</span>
          </p>
        </div>
      </section>

      {/* ── Tabla Dinámica de 24 Meses ── */}
      <section className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Table2 size={18} className="text-indigo-400" /> Tabla de Flujo de Caja Proyectado (24 Meses)
            </h3>
            <p className="text-xs text-slate-400">
              Desglose detallado mes a mes basado en tu estrategia actual.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Base Inicial: 1.150 clientes | Caja: $60.000
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-800/90 text-slate-400 sticky top-0 backdrop-blur z-10">
              <tr>
                <th className="p-2.5">Mes</th>
                <th className="p-2.5">Inversión</th>
                <th className="p-2.5">Trials</th>
                <th className="p-2.5">Vend.</th>
                <th className="p-2.5">Nuevos</th>
                <th className="p-2.5">Activos</th>
                <th className="p-2.5 text-emerald-400">Entradas</th>
                <th className="p-2.5 text-rose-400">Salidas</th>
                <th className="p-2.5">Flujo Neto</th>
                <th className="p-2.5 font-bold">Caja Final</th>
                <th className="p-2.5 text-center">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {simCustom.months.map((m) => (
                <tr
                  key={m.mes}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    m.isUnderFloor ? 'bg-rose-950/20 text-rose-200' : ''
                  }`}
                >
                  <td className="p-2.5 font-bold text-white">M{m.mes}</td>
                  <td className="p-2.5">${m.inversion.toLocaleString()}</td>
                  <td className="p-2.5">{m.trials}</td>
                  <td className="p-2.5">{m.vendedoras}</td>
                  <td className="p-2.5">{m.clientesNuevosTotales}</td>
                  <td className="p-2.5 font-bold text-white">{m.clientesActivosFinMes.toLocaleString()}</td>
                  <td className="p-2.5 text-emerald-400">{formatMoney(m.entradas)}</td>
                  <td className="p-2.5 text-rose-400">{formatMoney(m.salidas)}</td>
                  <td className={`p-2.5 font-semibold ${m.flujoNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatMoney(m.flujoNeto)}
                  </td>
                  <td className={`p-2.5 font-black ${m.isUnderFloor ? 'text-rose-400 font-extrabold' : 'text-white'}`}>
                    {formatMoney(m.cajaFinal)}
                  </td>
                  <td className="p-2.5 text-center">
                    {m.isUnderFloor ? (
                      <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded font-sans font-bold inline-flex items-center gap-1">
                        <AlertTriangle size={10} /> &lt;$10k
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[10px] flex items-center justify-center"><CheckCircle2 size={12} /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Modal de Verificación Matemática Mes 1 ── */}
      {showMathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMathModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white flex"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calculator size={18} className="text-indigo-400" /> Verificación Matemática: Mes 1 ($10.000 de Inversión)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paso a paso exacto auditado según las fórmulas del caso Agendo Nivel 3.
            </p>

            <div className="space-y-3 font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Inversión inicial:</span>
                <span className="font-bold text-white">$10.000</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Trials (interpolación $10k):</span>
                <span className="font-bold text-white">500 trials</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Vendedoras necesarias: Math.ceil(500 / 500):</span>
                <span className="font-bold text-white">1 vendedora ($1.200)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Clientes Pagos Ads (500 * 14%):</span>
                <span className="font-bold text-white">70 clientes</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Clientes Nuevos Totales (70 ads + 50 orgánicos):</span>
                <span className="font-bold text-white">120 clientes</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Clientes Activos Fin Mes: (1.150 * 0.94) + 120 = 1.081 + 120:</span>
                <span className="font-bold text-white">1.201 clientes</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1 text-emerald-400">
                <span>Entradas (1.201 * $19.50 de margen):</span>
                <span className="font-bold">$23.419,50</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1 text-rose-400">
                <span>Salidas ($10k ads + $1.200 vend + 70*$20 comisiones + $14k fijos):</span>
                <span className="font-bold">$26.600,00</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1 text-amber-400">
                <span>Flujo Neto Mes 1 ($23.419,50 - $26.600,00):</span>
                <span className="font-bold">-$3.180,50</span>
              </div>
              <div className="flex justify-between pt-2 text-sm bg-indigo-950/40 p-2 rounded border border-indigo-500/30">
                <span className="font-bold text-indigo-300">Caja Final Mes 1 ($60.000 - $3.180,50):</span>
                <span className="font-black text-emerald-400">$56.819,50</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowMathModal(false)}
                className="btn btn--primary py-1.5 px-5 text-xs"
              >
                Cerrar Verificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
