import { Outlet, Link, useLocation } from 'react-router';
import { Settings, Home, Download, Upload, Activity } from 'lucide-react';
import { exportData, importData } from '../utils/exportImport';
import { useRef } from 'react';
import { useBenchmarkStore } from '../store/benchmarkStore';
import TaskDrawer from './TaskDrawer';

export default function Layout() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useBenchmarkStore();

  const handleExport = async () => {
    const includeImages = confirm('¿Incluir imágenes en la exportación? (Hace el archivo más grande)');
    await exportData(includeImages);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importData(file);
        alert('¡Datos importados correctamente!');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Error al importar datos.');
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <header className="border-b border-ink/10 bg-paper shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="font-serif font-semibold text-xl tracking-tight text-ink">
              PaleoBench
            </Link>
            <nav className="flex space-x-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-stone text-ink' : 'text-ink/70 hover:bg-stone/50 hover:text-ink'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Panel de control</span>
                </div>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => store.setDrawerOpen(!store.isDrawerOpen)}
              className={`p-2 rounded-md transition-colors flex items-center space-x-2 ${store.isRunning ? 'bg-olive/10 text-olive' : 'text-ink/70 hover:bg-stone'
                }`}
              title="Cola de tareas"
            >
              <Activity className={`w-4 h-4 ${store.isRunning ? 'animate-pulse' : ''}`} />
              {store.isRunning && (
                <span className="text-xs font-medium">
                  {store.tasks.filter(t => t.status === 'success' || t.status === 'error').length} / {store.tasks.length}
                </span>
              )}
            </button>
            <div className="w-px h-4 bg-ink/20 mx-2" />
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
            <button onClick={handleImportClick} className="p-2 text-ink/70 hover:bg-stone rounded-md transition-colors" title="Importar JSON">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={handleExport} className="p-2 text-ink/70 hover:bg-stone rounded-md transition-colors" title="Exportar JSON">
              <Download className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-ink/20 mx-2" />
            <Link
              to="/settings"
              className={`p-2 rounded-md transition-colors ${location.pathname === '/settings' ? 'bg-stone text-ink' : 'text-ink/70 hover:bg-stone/50 hover:text-ink'
                }`}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>

      <TaskDrawer />
    </div>
  );
}
