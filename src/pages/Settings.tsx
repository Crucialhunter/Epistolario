import { useState, useEffect } from 'react';
import PromptLibrary from '../components/PromptLibrary';
import { db } from '../db/db';
import ConfirmModal from '../components/ConfirmModal';
import { testGeminiKey } from '../services/providers';
import { CheckCircle2, XCircle, Loader2, FlaskConical } from 'lucide-react';

interface KeyCheckResult {
  ok: boolean;
  status: string;
  message: string;
  at: number;
}

export default function Settings() {
  const [keys, setKeys] = useState({
    'gpt-5.2': '',
    'claude-4.6-sonnet': '',
    'claude-4.6-opus': '',
    'gemini-3.1-pro-preview': ''
  });
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [keyCheck, setKeyCheck] = useState<KeyCheckResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('paleobench_api_keys');
    if (saved) {
      try {
        setKeys(JSON.parse(saved));
      } catch (e) { }
    }
    const savedCheck = localStorage.getItem('paleobench_gemini_key_check');
    if (savedCheck) {
      try { setKeyCheck(JSON.parse(savedCheck)); } catch (e) { }
    }
    setDemoMode(localStorage.getItem('paleobench_demo_mode') === 'true');
  }, []);

  const handleChange = (id: string, value: string) => {
    const newKeys = { ...keys, [id]: value };
    setKeys(newKeys);
    localStorage.setItem('paleobench_api_keys', JSON.stringify(newKeys));
    // Clear key check when key changes
    if (id === 'gemini-3.1-pro-preview') {
      setKeyCheck(null);
      localStorage.removeItem('paleobench_gemini_key_check');
      localStorage.removeItem('paleobench_last_key_error');
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setKeyCheck(null);
    try {
      const result = await testGeminiKey(keys['gemini-3.1-pro-preview']);
      const check: KeyCheckResult = { ...result, at: Date.now() };
      setKeyCheck(check);
      localStorage.setItem('paleobench_gemini_key_check', JSON.stringify(check));
      if (result.ok) {
        localStorage.removeItem('paleobench_last_key_error');
      }
    } catch (e: any) {
      setKeyCheck({ ok: false, status: 'error', message: e?.message || 'Unknown error', at: Date.now() });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleDemo = (enabled: boolean) => {
    setDemoMode(enabled);
    localStorage.setItem('paleobench_demo_mode', enabled ? 'true' : 'false');
  };

  const handleClearAllData = async () => {
    await db.transaction('rw', [db.documents, db.groundTruths, db.imageVariants, db.runResults, db.prompts, db.promptTemplates, db.reviews], async () => {
      await db.documents.clear();
      await db.groundTruths.clear();
      await db.imageVariants.clear();
      await db.runResults.clear();
      await db.prompts.clear();
      await db.promptTemplates.clear();
      await db.reviews.clear();
    });
    setIsClearModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="font-serif text-3xl font-medium text-ink mb-8">Ajustes</h1>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-ink/5">
            <h2 className="text-lg font-medium mb-4">Configuración de API</h2>
            <p className="text-sm text-ink/60 mb-6">
              Configura tus claves de API para los diferentes modelos. Las claves se guardan localmente en tu navegador.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Clave de API de OpenAI</label>
                <input
                  type="password"
                  value={keys['gpt-5.2'] || ''}
                  onChange={(e) => handleChange('gpt-5.2', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Clave de API de Anthropic</label>
                <input
                  type="password"
                  value={keys['claude-4.6-sonnet'] || keys['claude-4.6-opus'] || ''}
                  onChange={(e) => {
                    handleChange('claude-4.6-sonnet', e.target.value);
                    handleChange('claude-4.6-opus', e.target.value);
                  }}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Clave de API de Google Gemini</label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={keys['gemini-3.1-pro-preview'] || ''}
                    onChange={(e) => handleChange('gemini-3.1-pro-preview', e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50"
                  />
                  <button
                    onClick={handleTestKey}
                    disabled={isTesting || !keys['gemini-3.1-pro-preview']}
                    className="px-4 py-2 bg-olive/10 text-olive rounded-md text-sm font-medium hover:bg-olive/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 shrink-0"
                  >
                    {isTesting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Probando…</span></>
                    ) : (
                      <span>Probar clave</span>
                    )}
                  </button>
                </div>

                {/* Key check result */}
                {keyCheck && (
                  <div className={`mt-2 flex items-start space-x-2 p-3 rounded-lg border text-sm ${keyCheck.ok
                    ? 'bg-olive/5 border-olive/20 text-olive'
                    : 'bg-burgundy/5 border-burgundy/20 text-burgundy'
                    }`}>
                    {keyCheck.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                    <div>
                      <div className="font-medium">{keyCheck.ok ? '✅ Clave válida' : `❌ ${keyCheck.status.toUpperCase()}`}</div>
                      <div className="text-xs opacity-80 mt-0.5">{keyCheck.message}</div>
                      <div className="text-[10px] opacity-50 mt-1">{new Date(keyCheck.at).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Demo Mode Toggle */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                <div>
                  <h2 className="text-lg font-medium">Modo Demo</h2>
                  <p className="text-sm text-ink/60 mt-1">
                    Cuando está activado, los benchmarks usan los datos de Ground Truth como predicciones en lugar de llamar a la API. Los resultados se etiquetan como <span className="font-mono text-amber-700 bg-amber-100 px-1 rounded text-xs">DEMO</span>.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={demoMode}
                  onChange={(e) => handleToggleDemo(e.target.checked)}
                />
                <div className="w-11 h-6 bg-ink/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            {demoMode && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Modo Demo ACTIVADO.</strong> Las ejecuciones de benchmark NO llamarán a ninguna API. En su lugar, usarán el texto modernizado de Ground Truth como predicciones (etiquetadas como <code>source: ground_truth_demo</code>).
              </div>
            )}
          </section>

          <PromptLibrary />

          <section className="bg-white p-6 rounded-xl shadow-sm border border-burgundy/20">
            <h2 className="text-lg font-medium mb-4 text-burgundy">Zona de peligro</h2>
            <p className="text-sm text-ink/60 mb-6">
              Borra permanentemente todos los documentos, variantes, resultados y plantillas de la base de datos local. Esta acción no se puede deshacer.
            </p>
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="px-4 py-2 bg-burgundy/10 text-burgundy rounded-md text-sm font-medium hover:bg-burgundy/20 transition-all"
            >
              Borrar todos los datos
            </button>
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Borrar todos los datos"
        message="¿Estás completamente seguro de que quieres borrar TODOS los datos? Esto incluye todos los documentos, variantes, resultados y plantillas personalizadas. Esta acción no se puede deshacer."
        confirmText="Sí, borrar todo"
        onConfirm={handleClearAllData}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}
