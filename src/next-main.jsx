import './styles/globals.css';
import './styles/globals.scss';

import { createRoot } from 'react-dom/client';

import ClientDemoTryLinks from './components/ClientDemoTryLinks.jsx';
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
  createRoot(host).render(
    <>
      <StudioReloadFab variant='fixed' />
      <ClientDemoTryLinks tone='dark' layout='fixed' alignEnd showConfigurator showBottle showHome />
    </>
  );
}

window.addEventListener('load', () => {
  mountLandingGallery();
  mountLandingEffects();
  mountNextChrome();
});
