import { useState, useEffect } from 'react';
import PromptLibrary from '../components/PromptLibrary';
import { db } from '../db/db';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const [keys, setKeys] = useState({
    'gpt-4o': '',
    'claude-3-5-sonnet': ''
  });
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('paleobench_api_keys');
    if (saved) {
      try {
        setKeys(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleChange = (id: string, value: string) => {
    const newKeys = { ...keys, [id]: value };
    setKeys(newKeys);
    localStorage.setItem('paleobench_api_keys', JSON.stringify(newKeys));
  };

  const handleClearAllData = async () => {
    await db.transaction('rw', [db.documents, db.groundTruths, db.imageVariants, db.runResults, db.prompts, db.promptTemplates], async () => {
      await db.documents.clear();
      await db.groundTruths.clear();
      await db.imageVariants.clear();
      await db.runResults.clear();
      await db.prompts.clear();
      await db.promptTemplates.clear();
    });
    setIsClearModalOpen(false);
    // Reload to ensure everything is reset
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="font-serif text-3xl font-medium text-ink mb-8">Settings</h1>
        
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-ink/5">
            <h2 className="text-lg font-medium mb-4">API Configuration</h2>
            <p className="text-sm text-ink/60 mb-6">
              Configure your API keys for the different models. Keys are stored locally in your browser.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">OpenAI API Key</label>
                <input 
                  type="password" 
                  value={keys['gpt-4o'] || ''}
                  onChange={(e) => handleChange('gpt-4o', e.target.value)}
                  placeholder="sk-..." 
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Anthropic API Key</label>
                <input 
                  type="password" 
                  value={keys['claude-3-5-sonnet'] || ''}
                  onChange={(e) => handleChange('claude-3-5-sonnet', e.target.value)}
                  placeholder="sk-ant-..." 
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50" 
                />
              </div>
            </div>
          </section>

          <PromptLibrary />

          <section className="bg-white p-6 rounded-xl shadow-sm border border-burgundy/20">
            <h2 className="text-lg font-medium mb-4 text-burgundy">Danger Zone</h2>
            <p className="text-sm text-ink/60 mb-6">
              Permanently delete all documents, variants, run results, and prompt templates from your local database. This action cannot be undone.
            </p>
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="px-4 py-2 bg-burgundy/10 text-burgundy rounded-md text-sm font-medium hover:bg-burgundy/20 transition-all"
            >
              Clear All Data
            </button>
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear All Data"
        message="Are you absolutely sure you want to delete ALL data? This includes all documents, variants, run results, and custom prompt templates. This action cannot be undone."
        confirmText="Yes, delete everything"
        onConfirm={handleClearAllData}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}
