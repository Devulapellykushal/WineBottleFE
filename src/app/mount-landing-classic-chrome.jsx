import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import LandingClassicChrome from '@/features/landing/LandingClassicChrome.jsx';

export function mountLandingClassicChrome() {
  const el = document.querySelector('#landing-chrome-root');
  if (!el) {
    return;
  }
  createRoot(el).render(
    <StrictMode>
      <LandingClassicChrome />
    </StrictMode>
  );
}
