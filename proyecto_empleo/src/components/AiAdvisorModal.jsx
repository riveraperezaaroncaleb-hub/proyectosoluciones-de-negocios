import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Key,
  Volume2,
  VolumeX,
  X,
  Zap,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Settings,
  RefreshCw,
  MessageSquare,
  BarChart,
} from 'lucide-react';
import {
  buildSystemContext,
  generateQuickAudit,
  answerUserQueryLocally,
  callExternalAiApi,
} from '../utils/aiAdvisorEngine';

export default function AiAdvisorModal({
  isOpen,
  onClose,
  inputs,
  setInputs,
  results,
  cashflowState,
  setCashflowState,
  activeTab,
  showNotification,
}) {
  const [activeTabMode, setActiveTabMode] = useState('chat'); // 'chat' | 'audit' | 'settings'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Configuraciones de Conexión Directa con IA
  const [provider, setProvider] = useState(() => localStorage.getItem('agendo_ai_provider') || 'local');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('agendo_ai_apikey') || '');
  const [modelName, setModelName] = useState(() => localStorage.getItem('agendo_ai_model') || 'gemini-1.5-flash');

  const messagesEndRef = useRef(null);

  // Inicializar primer mensaje de bienvenida y estado al abrir
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const audit = generateQuickAudit({ inputs, results, cashflowState });
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `👋 ¡Hola! Soy tu **Asesor Cuantitativo y CFO con IA** de Agendo.\n\n` +
            `Tengo acceso en tiempo real a tus métricas actuales:\n` +
            `- **LTV:CAC Paid:** **${results.ltvCacPaid.toFixed(2)}x**\n` +
            `- **CAC Paid Real:** **$${results.cacPaid.toFixed(2)}**\n` +
            `- **Payback:** **${results.paybackMonth} meses**\n` +
            `- **Discrepancia Valeria:** **${(2.4 - results.ltvCacPaid).toFixed(2)}x** vs realidad\n\n` +
            `¿Qué aspecto de la estrategia financiera deseas auditar u optimizar?`,
          audit,
        },
      ]);
    }
  }, [isOpen]);

  // Desplazar al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persistir configuración de IA
  const saveAiSettings = (newProvider, newKey, newModel) => {
    setProvider(newProvider);
    setApiKey(newKey);
    setModelName(newModel);
    localStorage.setItem('agendo_ai_provider', newProvider);
    localStorage.setItem('agendo_ai_apikey', newKey);
    localStorage.setItem('agendo_ai_model', newModel);
    showNotification('Configuración de IA guardada', 'success');
  };

  // Text-To-Speech (Accesibilidad por voz)
  const toggleSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      showNotification('Tu navegador no soporta síntesis de voz', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Limpiar markdown del texto para lectura clara
    const cleanText = text
      .replace(/[*#_`~-]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Detener voz al cerrar
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Aplicar parche a los inputs o al simulador
  const handleApplyPatch = (patch, label) => {
    if (patch.inputs && setInputs) {
      setInputs((prev) => ({ ...prev, ...patch.inputs }));
    }
    if (patch.cashflowState && setCashflowState) {
      setCashflowState((prev) => ({ ...prev, ...patch.cashflowState }));
    }
    showNotification(`Aplicado: ${label || 'Parámetros optimizados'}`, 'success');
  };

  // Enviar mensaje
  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMsg = { id: `user_${Date.now()}`, sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      let replyData;
      if (provider !== 'local' && apiKey.trim()) {
        const systemContext = buildSystemContext({ inputs, results, cashflowState, activeTab });
        const res = await callExternalAiApi({
          provider,
          apiKey,
          modelName,
          userMessage: textToSend,
          systemContext,
        });
        replyData = { text: res.text };
      } else {
        // Motor Especializado Local
        replyData = answerUserQueryLocally({
          query: textToSend,
          inputs,
          results,
          cashflowState,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: replyData.text,
          suggestion: replyData.suggestion,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Error al conectar con la API de IA:** ${err.message}\n\n*Puedes cambiar a "Motor Especializado Local" en la pestaña de Configuración para continuar sin interrupciones.*`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentAudit = generateQuickAudit({ inputs, results, cashflowState });

  return (
    <div
      className="modal-overlay no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panel Asesor Inteligente con IA"
      style={{ zIndex: 9999 }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '820px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* ── Top Header del Modal ── */}
        <div
          style={{
            padding: '16px 24px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                color: 'white',
              }}
            >
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Agendo AI Copilot & CFO
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: provider === 'local' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: provider === 'local' ? '#10b981' : 'var(--accent-primary)',
                    border: '1px solid currentColor',
                  }}
                >
                  {provider === 'local' ? '⚡ Motor Cuantitativo Activo' : `🌐 Conectado: ${provider.toUpperCase()}`}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Auditoría en tiempo real conectada a los datos de simulación
              </p>
            </div>
          </div>

          {/* Navegación Interna */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-primary)',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                gap: '4px',
              }}
            >
              <button
                onClick={() => setActiveTabMode('chat')}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  background: activeTabMode === 'chat' ? 'var(--gradient-primary)' : 'transparent',
                  color: activeTabMode === 'chat' ? 'white' : 'var(--text-secondary)',
                }}
              >
                <MessageSquare size={13} />
                Chat Directo
              </button>
              <button
                onClick={() => setActiveTabMode('audit')}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  background: activeTabMode === 'audit' ? 'var(--gradient-primary)' : 'transparent',
                  color: activeTabMode === 'audit' ? 'white' : 'var(--text-secondary)',
                }}
              >
                <BarChart size={13} />
                Auditoría 360°
              </button>
              <button
                onClick={() => setActiveTabMode('settings')}
                className="btn"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  background: activeTabMode === 'settings' ? 'var(--gradient-primary)' : 'transparent',
                  color: activeTabMode === 'settings' ? 'white' : 'var(--text-secondary)',
                }}
                title="Configurar API Key de Gemini u OpenAI"
              >
                <Settings size={13} />
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar panel de IA"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '6px',
                display: 'flex',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Mini Barra de Estado Métrico en Vivo ── */}
        <div
          style={{
            padding: '8px 24px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            overflowX: 'auto',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', whiteSpace: 'nowrap' }}>
            <span>
              <strong>LTV:CAC Paid:</strong>{' '}
              <span style={{ color: results.ltvCacPaid >= 3 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                {results.ltvCacPaid.toFixed(2)}x
              </span>
            </span>
            <span>
              <strong>CAC Paid:</strong> ${results.cacPaid.toFixed(2)}
            </span>
            <span>
              <strong>Payback:</strong> {results.paybackMonth} meses
            </span>
            <span>
              <strong>Alerta Valeria:</strong>{' '}
              <span style={{ color: '#f43f5e', fontWeight: 700 }}>
                {(2.4 - results.ltvCacPaid).toFixed(2)}x de diferencia
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentAudit.badgeColor,
              }}
            />
            <span style={{ fontWeight: 700, color: currentAudit.badgeColor }}>
              Score: {currentAudit.score}/10 ({currentAudit.statusText})
            </span>
          </div>
        </div>

        {/* ── CONTENIDO PRINCIPAL POR PESTAÑA ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          {/* TAB 1: CHAT DIRECTO CON LA IA */}
          {activeTabMode === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Mensajes del chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '14px 18px',
                        borderRadius:
                          msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background:
                          msg.sender === 'user'
                            ? 'var(--gradient-primary)'
                            : 'var(--bg-card)',
                        color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                        border:
                          msg.sender === 'user'
                            ? 'none'
                            : msg.isError
                            ? '1px solid #f43f5e'
                            : '1px solid var(--border-color)',
                        fontSize: '0.84rem',
                        lineHeight: 1.6,
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}

                      {/* Botón de Síntesis de Voz en respuestas de la IA */}
                      {msg.sender === 'ai' && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => toggleSpeech(msg.text)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                            title="Escuchar texto narrado con síntesis de voz (Accesibilidad)"
                          >
                            {isSpeaking ? <VolumeX size={12} color="#f43f5e" /> : <Volume2 size={12} />}
                            {isSpeaking ? 'Detener Voz' : 'Escuchar por voz'}
                          </button>
                        </div>
                      )}

                      {/* Sugerencia de acción aplicable con 1 click */}
                      {msg.suggestion && (
                        <div
                          style={{
                            marginTop: '12px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                            ⚡ Sugerencia de la IA lista para aplicar
                          </div>
                          <button
                            onClick={() => handleApplyPatch(msg.suggestion.patch, msg.suggestion.label)}
                            className="btn btn--primary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.74rem',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                            }}
                          >
                            <Zap size={12} />
                            {msg.suggestion.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <RefreshCw size={14} className="animate-spin" />
                    El Asesor IA está procesando las fórmulas y datos cuantitativos...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Botones de preguntas frecuentes y rápidas */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                {[
                  { label: '🔍 Auditar reporte de Valeria', prompt: 'Explica detalladamente la trampa del reporte de Valeria y por qué su LTV:CAC de 2.4x es falso.' },
                  { label: '📉 Impacto de reducir Churn', prompt: '¿Cómo impacta reducir el churn de 6% a 4% en el LTV y en el tiempo de recuperación de inversión?' },
                  { label: '💰 Optimizar CAC y Ventas', prompt: '¿Cuáles son las palancas más eficientes para reducir el CAC Paid de Agendo?' },
                  { label: '🛡️ Estrategia para el Board', prompt: '¿Qué plan financiero debo presentarle a Ricardo y a la junta para crecer sin riesgo de quiebra?' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    disabled={isLoading}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Input de consulta libre */}
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  padding: '8px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <input
                  type="text"
                  placeholder="Pregúntale a la IA sobre Unit Economics, CAC, Churn o estrategia de caja..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    padding: '8px 12px',
                  }}
                  aria-label="Escribe tu consulta para la IA"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="btn btn--primary"
                  style={{ padding: '8px 18px', borderRadius: '10px' }}
                  aria-label="Enviar mensaje"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AUDITORÍA 360° ESTRATÉGICA */}
          {activeTabMode === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tarjeta de Score General */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Diagnóstico Global de Salud Financiera
                  </span>
                  <h4 style={{ margin: '4px 0 8px', fontSize: '1.4rem', color: currentAudit.badgeColor, fontWeight: 800 }}>
                    {currentAudit.statusText}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                    Basado en la correlación entre CAC Paid real ($ {results.cacPaid}), LTV 24m ($ {results.ltv24}), tasa de
                    recuperación de capital y vulnerabilidad ante la trampa de Valeria.
                  </p>
                </div>
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: `conic-gradient(${currentAudit.badgeColor} ${currentAudit.score * 36}deg, var(--bg-primary) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: currentAudit.badgeColor }}>
                      {currentAudit.score}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ 10</span>
                  </div>
                </div>
              </div>

              {/* Recomendaciones Cuantitativas con Acción en 1 Click */}
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  🎯 Recomendaciones Prioritarias de la IA (Listas para aplicar):
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentAudit.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ maxWidth: '75%' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {rec.detail}
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyPatch(rec.patch, rec.actionLabel)}
                        className="btn btn--primary"
                        style={{ padding: '8px 16px', fontSize: '0.76rem' }}
                      >
                        <Zap size={13} />
                        {rec.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de lectura completa de la auditoría */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() =>
                    toggleSpeech(
                      `Diagnóstico de salud financiera de Agendo: Score ${currentAudit.score} de 10. Estado: ${currentAudit.statusText}. ` +
                      `Relación LTV a CAC Paid de ${results.ltvCacPaid.toFixed(2)}x. El reporte de Valeria presenta un desfase de ${(2.4 - results.ltvCacPaid).toFixed(2)}x. ` +
                      `Se recomienda activar el cobro anual anticipado y contener el churn mensual.`
                    )
                  }
                  className="btn btn--ghost"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Volume2 size={14} />
                  {isSpeaking ? 'Detener locución por voz' : 'Escuchar resumen completo por voz'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURACIÓN DE CONEXIÓN DIRECTA CON API DE IA */}
          {activeTabMode === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ⚙️ Conexión Directa con Modelos de IA
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Puedes usar el <strong>Motor Cuantitativo Local Integrado</strong> (100% autónomo y rápido) o conectar directamente tu propia <strong>API Key de Google Gemini</strong> o <strong>OpenAI</strong>.
                </p>
              </div>

              {/* Selector de Proveedor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Seleccionar Modo / Proveedor de IA:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { id: 'local', title: 'Motor Local (Recomendado)', desc: 'Cero latencia, no requiere API Key' },
                    { id: 'gemini', title: 'Google Gemini', desc: 'Conecta con tu clave de Google AI Studio' },
                    { id: 'openai', title: 'OpenAI (GPT-4o)', desc: 'Conecta con tu clave de OpenAI API' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: provider === p.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: provider === p.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{p.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración cuando se selecciona Gemini u OpenAI */}
              {provider !== 'local' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      API Key ({provider.toUpperCase()}):
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="password"
                        placeholder={`Ingresa tu clave secreta de ${provider === 'gemini' ? 'AI Studio' : 'OpenAI'}...`}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      🔒 La clave se almacena exclusivamente en tu navegador (localStorage) y nunca pasa por servidores intermediarios.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Modelo Seleccionado:
                    </label>
                    <select
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    >
                      {provider === 'gemini' ? (
                        <>
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Rápido y Económico)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro (Máxima Capacidad de Razonamiento)</option>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        </>
                      ) : (
                        <>
                          <option value="gpt-4o-mini">GPT-4o Mini (Rápido y Preciso)</option>
                          <option value="gpt-4o">GPT-4o (Modelo Insignia)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Botón Guardar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => saveAiSettings(provider, apiKey, modelName)}
                  className="btn btn--primary"
                  style={{ padding: '8px 22px' }}
                >
                  <CheckCircle2 size={14} />
                  Guardar Preferencias de IA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

