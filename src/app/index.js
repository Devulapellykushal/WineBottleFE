import '../styles/globals.css';
import '../styles/globals.scss';
/* reload-loader.css is linked from index.html <head> so it applies before first paint (no FOUC). */

import { mountLandingClassicChrome } from './mount-landing-classic-chrome.jsx';
import { mountLandingEffects } from './mount-landing-effects.jsx';
import { mountLandingGallery } from './mount-landing-gallery.jsx';

const MIN_RELOAD_MS = 3000;
const HOME_PATH = '/';
const NEXT_PATH = '/next';
const DOME_PATH = '/dome';

function getLandingMode(pathname) {
  if (pathname === DOME_PATH || pathname === `${DOME_PATH}/`) return 'dome';
  if (pathname === NEXT_PATH || pathname === `${NEXT_PATH}/`) return 'next';
  return 'home';
}

function notifyLandingPath() {
  window.dispatchEvent(new CustomEvent('studio:landing-path'));
}

function hideReloadLoader() {
  const el = document.querySelector('#reload-loader');
  const main = document.querySelector('main.landing-root');
  main?.classList.remove('landing-root--boot-hidden');

  if (!el) {
    return;
  }
  el.setAttribute('aria-busy', 'false');
  el.classList.add('reload-loader--exiting');
  const done = () => {
    el.remove();
  };
  el.addEventListener('transitionend', done, { once: true });
  setTimeout(done, 650);
}

document.addEventListener('DOMContentLoaded', () => {});

let galleryMounted = false;
function ensureGalleryMounted(mode) {
  mountLandingGallery(mode);
  galleryMounted = true;
}

function applyLandingMode(mode, updateHistory = true) {
  const main = document.querySelector('main.landing-root');
  const visuals = document.querySelector('#landing-visuals-root');
  const heroShell = document.querySelector('#landing-hero-shell');
  if (!main || !visuals) return;

  if (mode !== 'home') {
    ensureGalleryMounted(mode);
    main.classList.remove('landing-root--cinematic-transition');
    main.classList.add('landing-root--next-mode');
    main.setAttribute('data-landing-mode', mode);
    visuals.classList.remove('landing-visuals--transitioning');
    visuals.classList.remove('hidden');
    visuals.classList.add('flex');
    const targetPath = mode === 'dome' ? DOME_PATH : NEXT_PATH;
    if (updateHistory && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    notifyLandingPath();
    return;
  }

  if (galleryMounted) {
    mountLandingGallery('next');
  }
  main.classList.remove('landing-root--next-mode');
  main.classList.remove('landing-root--cinematic-transition');
  main.setAttribute('data-landing-mode', 'home');
  heroShell?.classList.remove('landing-hero--transitioning');
  visuals.classList.remove('landing-visuals--transitioning');
  visuals.classList.add('hidden');
  visuals.classList.remove('flex');
  if (updateHistory && window.location.pathname !== HOME_PATH) {
    window.history.pushState({}, '', HOME_PATH);
  }
  notifyLandingPath();
}

window.addEventListener('load', () => {
  const bootStartedAt = performance.now();
  const mode = getLandingMode(window.location.pathname);

  mountLandingClassicChrome();
  mountLandingEffects();
  applyLandingMode(mode, false);

  window.__enterNextExperience = () => {
    applyLandingMode('next', true);
  };
  window.__enterDomeExperience = () => {
    applyLandingMode('dome', true);
  };
  window.__navigateLandingPath = (path) => {
    const targetMode = getLandingMode(path);
    applyLandingMode(targetMode, true);
  };

  window.addEventListener('popstate', () => {
    const nextMode = getLandingMode(window.location.pathname);
    applyLandingMode(nextMode, false);
  });

  const elapsed = performance.now() - bootStartedAt;
  const remaining = Math.max(0, MIN_RELOAD_MS - elapsed);
  setTimeout(hideReloadLoader, remaining);
});
