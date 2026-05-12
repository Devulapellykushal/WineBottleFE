import './styles/globals.css';
import './styles/globals.scss';

import { createRoot } from 'react-dom/client';

import { mountLandingEffects } from './app/mount-landing-effects.jsx';
import { mountLandingGallery } from './app/mount-landing-gallery.jsx';
import StudioReloadFab from './components/StudioReloadFab.jsx';

function mountNextChrome() {
  let host = document.getElementById('studio-next-chrome-root');
  if (!host) {
    host = document.createElement('div');
    host.id = 'studio-next-chrome-root';
    document.body.appendChild(host);
  }
  createRoot(host).render(<StudioReloadFab variant='fixed' />);
}

window.addEventListener('load', () => {
  mountLandingGallery();
  mountLandingEffects();
  mountNextChrome();
});
