import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/features/bottle-engraving/styles/bottle-engraving.scss';
import '@/features/3d-configurator/styles/configurator.scss';

import BottleEngravingPage from '@/features/bottle-engraving/pages/BottleEngravingPage.jsx';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root not found');
}

createRoot(root).render(
  <StrictMode>
    <BottleEngravingPage />
  </StrictMode>
);
