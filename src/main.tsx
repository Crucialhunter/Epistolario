import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Settings from './pages/Settings';
import { initializeDefaultPrompts } from './db/db';
import './index.css';

initializeDefaultPrompts().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workspace/:docId" element={<Workspace />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
