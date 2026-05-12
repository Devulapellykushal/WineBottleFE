import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/features/bottle-engraving/styles/bottle-engraving.scss';
import '@/features/3d-configurator/styles/configurator.scss';

import ConfigureBottlePage from '@/features/product-studio/ConfigureBottlePage.jsx';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root not found');
}

createRoot(root).render(
  <StrictMode>
    <ConfigureBottlePage />
  </StrictMode>
);
