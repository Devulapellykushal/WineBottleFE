import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@/features/bottle-engraving/styles/bottle-engraving.scss';
import '@/features/3d-configurator/styles/configurator.scss';

import ConfiguratorPage from '@/features/3d-configurator/pages/ConfiguratorPage.jsx';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Configurator root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename="/configurator">
      <Routes>
        <Route path="/" element={<ConfiguratorPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
