import { useState } from 'react';
import { db } from '../db/db';
import { X, CheckCircle2, UploadCloud, FolderUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentModal({ isOpen, onClose }: DocumentModalProps) {
  const [importMode, setImportMode] = useState<'single' | 'batch'>('single');
  const [title, setTitle] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [literal, setLiteral] = useState('');
  const [modernizada, setModernizada] = useState('');
  const [metadataJson, setMetadataJson] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ total: number; current: number; status: string } | null>(null);

  if (!isOpen) return null;

  const handleJsonPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMetadataJson(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed.transcripcion) {
        if (parsed.transcripcion.literal) setLiteral(parsed.transcripcion.literal);
        if (parsed.transcripcion.modernizada) setModernizada(parsed.transcripcion.modernizada);
      }
      if (parsed.nombre_carta && !title) {
        setTitle(parsed.nombre_carta);
      }
    } catch (err) {
      // Not valid JSON yet, ignore
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageFiles(Array.from(files));
      if (!title) {
        // Auto-fill title from first filename without extension
        setTitle(files[0].name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setImageFiles([]);
    }
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json'));
    const imageFilesList = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (jsonFiles.length === 0) {
      alert('No JSON files found in the selected folder.');
      return;
    }

    setIsSubmitting(true);
    setBatchProgress({ total: jsonFiles.length, current: 0, status: 'Parsing JSON files...' });

    try {
      let docsToAdd: any[] = [];
      let gtsToAdd: any[] = [];
      const now = Date.now();

      for (let i = 0; i < jsonFiles.length; i++) {
        const jsonFile = jsonFiles[i];
        const text = await jsonFile.text();
        try {
          const parsed = JSON.parse(text);
          const imagePaths: string[] = parsed.imagenes || [];
          
          let metadata = { ...parsed };
          delete metadata.transcripcion;
          delete metadata.imagenes;

          const literal = parsed.transcripcion?.literal || '';
          const modernizada = parsed.transcripcion?.modernizada || '';
          const baseTitle = parsed.nombre_carta || jsonFile.name.replace(/\.[^/.]+$/, "");

          const docPages: File[] = [];

          for (let j = 0; j < imagePaths.length; j++) {
            const imgPath = imagePaths[j];
            const imgFileName = imgPath.split('/').pop();
            
            // Match exactly the filename or the relative path
            const matchingImg = imageFilesList.find(f => 
              f.webkitRelativePath.endsWith(imgPath) || 
              f.name === imgFileName
            );

            if (matchingImg) {
              docPages.push(matchingImg);
            }
          }

          if (docPages.length > 0) {
            const docId = crypto.randomUUID();
            const gtId = crypto.randomUUID();
            
            docsToAdd.push({
              id: docId,
              title: baseTitle,
              pages: docPages,
              createdAt: now,
              archived: false,
            });

            gtsToAdd.push({
              id: gtId,
              docId,
              literal,
              modernizada,
              metadata,
              updatedAt: now,
            });
          }
        } catch (err) {
          console.warn(`Failed to parse ${jsonFile.name}`, err);
        }
        setBatchProgress({ total: jsonFiles.length, current: i + 1, status: `Processing ${jsonFile.name}...` });
      }

      if (docsToAdd.length > 0) {
        setBatchProgress({ total: docsToAdd.length, current: docsToAdd.length, status: `Saving ${docsToAdd.length} documents to database...` });
        await db.transaction('rw', db.documents, db.groundTruths, async () => {
          await db.documents.bulkAdd(docsToAdd);
          await db.groundTruths.bulkAdd(gtsToAdd);
        });
        alert(`Successfully imported ${docsToAdd.length} documents!`);
        onClose();
      } else {
        alert('No matching images found for the JSON files in the selected folder.');
      }
    } catch (error) {
      console.error('Batch import failed:', error);
      alert('Batch import failed');
    } finally {
      setIsSubmitting(false);
      setBatchProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || imageFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const docId = crypto.randomUUID();
      const gtId = crypto.randomUUID();
      const now = Date.now();

      let metadata = undefined;
      if (metadataJson) {
        try {
          const parsed = JSON.parse(metadataJson);
          metadata = { ...parsed };
          delete metadata.transcripcion;
          delete metadata.imagenes;
        } catch (e) {
          console.warn('Invalid metadata JSON');
        }
      }

      await db.transaction('rw', db.documents, db.groundTruths, async () => {
        await db.documents.add({
          id: docId,
          title,
          pages: imageFiles,
          createdAt: now,
          archived: false,
        });

        await db.groundTruths.add({
          id: gtId,
          docId,
          literal,
          modernizada,
          metadata,
          updatedAt: now,
        });
      });

      onClose();
      // Reset form
      setTitle('');
      setImageFiles([]);
      setLiteral('');
      setModernizada('');
      setMetadataJson('');
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
      <div className="bg-paper w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <h2 className="font-serif text-xl font-medium">Add Documents</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-ink/10">
          <button
            onClick={() => setImportMode('single')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${importMode === 'single' ? 'bg-stone/20 text-ink border-b-2 border-ink' : 'text-ink/60 hover:bg-stone/10'}`}
          >
            Single Document
          </button>
          <button
            onClick={() => setImportMode('batch')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${importMode === 'batch' ? 'bg-stone/20 text-ink border-b-2 border-ink' : 'text-ink/60 hover:bg-stone/10'}`}
          >
            Batch Folder Import
          </button>
        </div>
        
        {importMode === 'single' ? (
          <>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Images</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full flex items-center justify-between px-4 py-3 border rounded-md transition-colors ${imageFiles.length > 0 ? 'border-olive bg-olive/5' : 'border-ink/20 bg-white hover:border-ink/40'}`}>
                    <div className="flex items-center space-x-3">
                      {imageFiles.length > 0 ? <CheckCircle2 className="w-5 h-5 text-olive" /> : <UploadCloud className="w-5 h-5 text-ink/50" />}
                      <span className={`text-sm ${imageFiles.length > 0 ? 'text-olive font-medium' : 'text-ink/60'}`}>
                        {imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : 'Click or drag to select images...'}
                      </span>
                    </div>
                    {imageFiles.length > 0 && <span className="text-xs text-olive/70 bg-olive/10 px-2 py-1 rounded">Ready</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50 bg-white"
                  placeholder="e.g., Carta de Indias 1542"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Import from JSON (Optional)
                  <span className="text-xs text-ink/50 ml-2 font-normal">Pastes metadata and transcriptions</span>
                </label>
                <textarea
                  value={metadataJson}
                  onChange={handleJsonPaste}
                  rows={3}
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50 bg-stone/10 font-mono text-xs"
                  placeholder='{"id_carta": "1135", "transcripcion": { "literal": "...", "modernizada": "..." }}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Ground Truth (Literal)</label>
                <textarea
                  required
                  value={literal}
                  onChange={(e) => setLiteral(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50 bg-white font-serif"
                  placeholder="Enter the exact paleographic transcription..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Ground Truth (Modernizada)</label>
                <textarea
                  required
                  value={modernizada}
                  onChange={(e) => setModernizada(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-ink/20 rounded-md focus:outline-none focus:ring-2 focus:ring-olive/50 bg-white font-sans"
                  placeholder="Enter the modernized version..."
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-ink/10 bg-stone/20 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !title || imageFiles.length === 0}
                className="px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-ink/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center space-x-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />}
                <span>{isSubmitting ? 'Saving...' : 'Save Document'}</span>
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
            <div className="text-center max-w-md">
              <FolderUp className="w-12 h-12 text-ink/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ink mb-2">Import a Folder</h3>
              <p className="text-sm text-ink/70 mb-6">
                Select a folder containing your JSON files and an "images" subfolder. The system will automatically match the images referenced in the JSON files and create the documents.
              </p>
              
              <div className="relative inline-block">
                <input
                  type="file"
                  /* @ts-ignore - webkitdirectory is non-standard but widely supported */
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-ink text-paper rounded-md font-medium hover:bg-ink/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FolderUp className="w-4 h-4" />
                      <span>Select Folder</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {batchProgress && (
              <div className="w-full max-w-md bg-stone/10 p-4 rounded-lg border border-ink/10">
                <div className="flex justify-between text-xs font-medium text-ink/70 mb-2">
                  <span>{batchProgress.status}</span>
                  <span>{batchProgress.current} / {batchProgress.total}</span>
                </div>
                <div className="w-full bg-stone/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-olive h-full transition-all duration-300 ease-out"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
