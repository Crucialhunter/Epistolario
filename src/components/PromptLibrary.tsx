import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDefaultPrompts } from '../db/db';
import { PromptTemplate } from '../types';
import { Plus, Trash2, Edit2, Save, X, Copy } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function PromptLibrary() {
  const templates = useLiveQuery(() => db.promptTemplates.toArray());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PromptTemplate>>({});
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleCreate = async () => {
    const newId = crypto.randomUUID();
    const newTemplate = {
      id: newId,
      name: 'Nueva versión de prompt',
      color: 'blue',
      engine: 'split' as const,
      systemPrompt: 'Eres un experto paleógrafo.',
      literalPrompt: '',
      modernizadaPrompt: '',
      unifiedPrompt: '',
      createdAt: Date.now(),
    };
    await db.promptTemplates.add(newTemplate);
    setFormData(newTemplate);
    setEditingId(newId);
  };

  const handleEdit = (template: PromptTemplate) => {
    setFormData(template);
    setEditingId(template.id);
  };

  const handleDuplicate = async (template: PromptTemplate) => {
    const newId = crypto.randomUUID();
    const newTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Copia)`,
      createdAt: Date.now(),
      isDefault: false
    };
    await db.promptTemplates.add(newTemplate);
    setFormData(newTemplate);
    setEditingId(newId);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name) return;

    await db.promptTemplates.put({
      ...formData,
      createdAt: formData.createdAt || Date.now(),
    } as PromptTemplate);

    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await db.promptTemplates.delete(templateToDelete);
      setTemplateToDelete(null);
    }
  };

  const handleRestoreDefault = async (templateId: string) => {
    if (confirm('¿Seguro que quieres restaurar la plantilla predeterminada? Se perderán los cambios.')) {
      await db.promptTemplates.delete(templateId);
      await initializeDefaultPrompts();
      setEditingId(null);
    }
  };

  const colors = ['stone', 'blue', 'emerald', 'amber', 'purple', 'rose'];

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-ink/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium">Biblioteca de prompts</h2>
          <p className="text-sm text-ink/60 mt-1">
            Gestiona tus versiones de prompt y motores de ejecución.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-ink text-paper px-3 py-1.5 rounded text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva versión</span>
        </button>
      </div>

      <div className="space-y-4">
        {templates?.map(template => {
          const isEditing = editingId === template.id;

          if (isEditing) {
            return (
              <div key={template.id} className="border border-ink/20 rounded-lg p-4 bg-stone/5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Editar versión de prompt</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingId(null)} className="p-1 text-ink/50 hover:text-ink">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Nombre de versión</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Color de etiqueta</label>
                    <div className="flex space-x-2 mt-2">
                      {colors.map(c => (
                        <button
                          key={c}
                          onClick={() => setFormData({ ...formData, color: c })}
                          className={`w-6 h-6 rounded-full border-2 ${formData.color === c ? 'border-ink' : 'border-transparent'}`}
                          style={{ backgroundColor: `var(--color-${c}-500, ${c === 'stone' ? '#78716c' : c === 'blue' ? '#3b82f6' : c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : c === 'purple' ? '#8b5cf6' : '#f43f5e'})` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Motor de ejecución</label>
                  <select
                    value={formData.engine || 'split'}
                    onChange={e => setFormData({ ...formData, engine: e.target.value as 'split' | 'unified' | 'fast' })}
                    className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm bg-white"
                  >
                    <option value="split">Motor Split (Heredado - 2 llamadas a API)</option>
                    <option value="unified">Motor Unified (Inteligente - 1 llamada a API para todo)</option>
                    <option value="fast">Motor FAST (Velocidad - Solo modernizada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Prompt de sistema</label>
                  <textarea
                    value={formData.systemPrompt || ''}
                    onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                  />
                </div>

                {formData.engine === 'split' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Prompt literal</label>
                      <textarea
                        value={formData.literalPrompt || ''}
                        onChange={e => setFormData({ ...formData, literalPrompt: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Prompt modernizada</label>
                      <textarea
                        value={formData.modernizadaPrompt || ''}
                        onChange={e => setFormData({ ...formData, modernizadaPrompt: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      />
                    </div>
                  </>
                ) : formData.engine === 'unified' ? (
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Prompt unificado (Debe pedir un JSON)</label>
                    <textarea
                      value={formData.unifiedPrompt || ''}
                      onChange={e => setFormData({ ...formData, unifiedPrompt: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      placeholder="Pide al LLM que devuelva un JSON con idioma, metadatos, literal, y modernizada"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Prompt FAST (Debe pedir un JSON mínimo)</label>
                    <textarea
                      value={formData.fastPrompt || ''}
                      onChange={e => setFormData({ ...formData, fastPrompt: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      placeholder="Pide al LLM que devuelva un JSON con idioma y modernizada solamente."
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Intentos máximos</label>
                    <input
                      type="number"
                      min="1" max="10"
                      value={formData.maxAttempts || 3}
                      onChange={e => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Incremento de espera (ms)</label>
                    <input
                      type="number"
                      min="0" step="500"
                      value={formData.backoffIncrementMs || 2000}
                      onChange={e => setFormData({ ...formData, backoffIncrementMs: parseInt(e.target.value) || 2000 })}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-olive text-white px-4 py-2 rounded text-sm font-medium hover:bg-olive/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar versión</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={template.id} className="border border-ink/10 rounded-lg p-4 flex items-center justify-between hover:bg-stone/5 transition-colors">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-ink">{template.name}</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-ink/10`}
                    style={{ backgroundColor: `var(--color-${template.color}-100, #f5f5f4)`, color: `var(--color-${template.color}-700, #444)` }}
                  >
                    {template.engine}
                  </span>
                  {template.isDefault && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-stone/20 text-ink/50">
                      Predeterminado
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink/50 mt-1 truncate max-w-xl">
                  {template.engine === 'split' ? template.literalPrompt : template.engine === 'fast' ? template.fastPrompt : template.unifiedPrompt}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDuplicate(template)}
                  className="p-2 text-ink/50 hover:text-ink hover:bg-stone/20 rounded transition-colors"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-ink/50 hover:text-ink hover:bg-stone/20 rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!template.isDefault ? (
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-ink/50 hover:text-burgundy hover:bg-burgundy/10 rounded transition-colors"
                    title="Borrar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestoreDefault(template.id)}
                    className="px-2 py-1 text-ink/50 hover:text-amber-600 hover:bg-amber-600/10 rounded transition-colors text-xs font-medium border border-transparent hover:border-amber-600/20"
                    title="Restaurar predeterminado"
                  >
                    Restaurar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-ink/10">
        <h3 className="text-sm font-semibold text-ink mb-3">📚 Mejores prácticas para Gemini 3.1 JSON Generation</h3>
        <div className="bg-stone/5 border border-ink/10 rounded-lg p-4 text-sm text-ink/80 space-y-3">
          <p>
            Para asegurar que <strong>Gemini 3.1 Pro</strong> devuelva JSON con un formato correcto y sin errores, se recomiendan las siguientes técnicas:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Configuración API:</strong> El sistema de forma automática configura <code>responseMimeType: "application/json"</code> en las peticiones. Esto fuerza al modelo a proporcionar texto que sea exclusivamente JSON válido.
            </li>
            <li>
              <strong>Schema explícito en el Prompt:</strong> Siempre proporciona el formato de json específico que deseas, en tu prompt. Por ejemplo:
              <pre className="mt-1 p-2 bg-white border border-ink/10 rounded text-xs font-mono overflow-x-auto">
                {`{
  "transcripcion": "text here",
  "metadatos": { "fecha": "...", "remitente": "..." }
}`}
              </pre>
            </li>
            <li>
              <strong>Evita ambigüedades:</strong> Dile al modelo de forma explícita: <em>"Devuelve UNICA y EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura. No incluyas ningún otro texto."</em>
            </li>
            <li>
              <strong>Motor unificado:</strong> Cuando utilices el motor unificado, asegúrate de que el modelo incluya todos los campos (literal, modernizada, metadatos) en el mismo JSON.
            </li>
          </ul>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!templateToDelete}
        title="Borrar versión de prompt"
        message="¿Seguro que quieres borrar esta versión de prompt? Esta acción no se puede deshacer."
        confirmText="Borrar"
        onConfirm={confirmDelete}
        onCancel={() => setTemplateToDelete(null)}
      />
    </section>
  );
}
