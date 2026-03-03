import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
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
      name: 'New Prompt Version',
      color: 'blue',
      engine: 'split' as const,
      systemPrompt: 'You are an expert paleographer.',
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
      name: `${template.name} (Copy)`,
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

  const colors = ['stone', 'blue', 'emerald', 'amber', 'purple', 'rose'];

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-ink/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium">Prompt Library</h2>
          <p className="text-sm text-ink/60 mt-1">
            Manage your prompt versions and execution engines.
          </p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-ink text-paper px-3 py-1.5 rounded text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Version</span>
        </button>
      </div>

      <div className="space-y-4">
        {templates?.map(template => {
          const isEditing = editingId === template.id;

          if (isEditing) {
            return (
              <div key={template.id} className="border border-ink/20 rounded-lg p-4 bg-stone/5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Edit Prompt Version</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingId(null)} className="p-1 text-ink/50 hover:text-ink">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Version Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Tag Color</label>
                    <div className="flex space-x-2 mt-2">
                      {colors.map(c => (
                        <button
                          key={c}
                          onClick={() => setFormData({...formData, color: c})}
                          className={`w-6 h-6 rounded-full border-2 ${formData.color === c ? 'border-ink' : 'border-transparent'}`}
                          style={{ backgroundColor: `var(--color-${c}-500, ${c === 'stone' ? '#78716c' : c === 'blue' ? '#3b82f6' : c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : c === 'purple' ? '#8b5cf6' : '#f43f5e'})` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Execution Engine</label>
                  <select 
                    value={formData.engine || 'split'}
                    onChange={e => setFormData({...formData, engine: e.target.value as 'split' | 'unified'})}
                    className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm bg-white"
                  >
                    <option value="split">Split Engine (Legacy - 2 API calls)</option>
                    <option value="unified">Unified Engine (Smart - 1 API call for everything)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">System Prompt</label>
                  <textarea 
                    value={formData.systemPrompt || ''}
                    onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                  />
                </div>

                {formData.engine === 'split' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Literal Prompt</label>
                      <textarea 
                        value={formData.literalPrompt || ''}
                        onChange={e => setFormData({...formData, literalPrompt: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Modernizada Prompt</label>
                      <textarea 
                        value={formData.modernizadaPrompt || ''}
                        onChange={e => setFormData({...formData, modernizadaPrompt: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Unified Prompt (Must request JSON)</label>
                    <textarea 
                      value={formData.unifiedPrompt || ''}
                      onChange={e => setFormData({...formData, unifiedPrompt: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-ink/20 rounded focus:outline-none focus:ring-1 focus:ring-olive text-sm font-mono"
                      placeholder="Ask the LLM to return a JSON with idioma, metadatos, literal, and modernizada."
                    />
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-olive text-white px-4 py-2 rounded text-sm font-medium hover:bg-olive/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Version</span>
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
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink/50 mt-1 truncate max-w-xl">
                  {template.engine === 'split' ? template.literalPrompt : template.unifiedPrompt}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDuplicate(template)}
                  className="p-2 text-ink/50 hover:text-ink hover:bg-stone/20 rounded transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {!template.isDefault && (
                  <>
                    <button 
                      onClick={() => handleEdit(template)}
                      className="p-2 text-ink/50 hover:text-ink hover:bg-stone/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-ink/50 hover:text-burgundy hover:bg-burgundy/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-6 border-t border-ink/10">
        <h3 className="text-sm font-semibold text-ink mb-3">📚 Best Practices for Gemini 3.1 JSON Generation</h3>
        <div className="bg-stone/5 border border-ink/10 rounded-lg p-4 text-sm text-ink/80 space-y-3">
          <p>
            To ensure <strong>Gemini 3.1 Pro</strong> returns well-formatted JSON without errors (avoiding "Invalid JSON response"), the following techniques are implemented and recommended:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>API Configuration:</strong> The system automatically sets <code>responseMimeType: "application/json"</code> in the API call. This forces the model to output <em>only</em> valid JSON, eliminating markdown blocks (like <code>```json</code>) and conversational filler.
            </li>
            <li>
              <strong>Explicit Schema in Prompt:</strong> Always provide a clear, exact JSON structure in your prompt. For example:
              <pre className="mt-1 p-2 bg-white border border-ink/10 rounded text-xs font-mono overflow-x-auto">
{`{
  "transcripcion": "text here",
  "metadatos": { "fecha": "...", "remitente": "..." }
}`}
              </pre>
            </li>
            <li>
              <strong>Avoid Ambiguity:</strong> Tell the model explicitly: <em>"Return ONLY a valid JSON object matching the following structure. Do not include any other text."</em>
            </li>
            <li>
              <strong>Unified Engine:</strong> When using the Unified Engine, ensure the prompt asks for all required fields (literal, modernizada, metadata) within a single JSON root object.
            </li>
          </ul>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!templateToDelete}
        title="Delete Prompt Version"
        message="Are you sure you want to delete this prompt version? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setTemplateToDelete(null)}
      />
    </section>
  );
}
