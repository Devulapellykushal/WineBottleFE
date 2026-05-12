import { useCallback, useEffect, useRef, useState } from 'react';

import './landing-classic-chrome.css';

import StudioReloadFab from '@/components/StudioReloadFab.jsx';

import { playHoldMilestoneTick, playUnlockChime } from './landing-sfx.js';

function ArrowUpRightGlyph() {
  return (
    <svg
      className='landing-classic-chrome__arrow-ne'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      <path d='M8 16L16 8' stroke='currentColor' strokeWidth='1.65' strokeLinecap='round' />
      <path d='M9.5 8H16V14.5' stroke='currentColor' strokeWidth='1.65' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

const STORAGE_KEY = 'landing-classic-sound';
const HOLD_MS = 1000;
const NEXT_TO_DOME_HOLD_MS = 3000;

const MENU_LINKS = [
  {
    href: '/configurator',
    title: '3D studio',
    description: 'Spin the bottle and try colors in your browser.',
    external: false
  },
  {
    href: '/bottle',
    title: 'Bottle mockup',
    description: 'Upload a logo and preview how it looks engraved.',
    external: false
  },
  {
    href: '/configurebottle',
    title: 'All in one',
    description: 'Colors and logo on the same 3D bottle.',
    external: false
  },
  {
    href: 'https://p4ai.in',
    title: 'p4ai.in',
    description: 'Main experience — opens in a new tab.',
    external: true
  }
];
const RESET_MS = 280;
const TRANSITION_MS = 860;

function isLandingRootHome(pathname) {
  const p = pathname || '';
  if (p === '/' || p === '') return true;
  return /^\/index\.html$/i.test(p);
}

function shouldCountAsHoldStart(target) {
  if (!target) return false;
  if (typeof Element !== 'undefined' && target instanceof Element) {
    // Hold gesture is valid on hero and visuals containers, but not chrome/controls.
    const inHero = Boolean(target.closest('#landing-hero-section'));
    const inVisuals = Boolean(target.closest('#landing-visuals-root'));
    if (!inHero && !inVisuals) return false;
    if (target.closest('#landing-chrome-root')) return false;
    if (target.closest('#reload-loader')) return false;
    if (target.closest('a[href], button, input, textarea, select, label, [role="button"]')) return false;
  }
  return true;
}

export default function LandingClassicChrome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [landingPathname, setLandingPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const loopAudioRef = useRef(null);
  const holdRafRef = useRef(null);
  const holdActiveRef = useRef(false);
  const holdProgressRef = useRef(0);
  const holdMilestonesRef = useRef(new Set());

  const stopLoopAudio = useCallback(() => {
    const audio = loopAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const startLoopAudio = useCallback(() => {
    const existing = window.__landingLoopAudio;
    if (existing) {
      loopAudioRef.current = existing;
    }

    if (!loopAudioRef.current) {
      const audio = new Audio('/sound.wav');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0.45;
      audio.muted = false;
      try {
        audio.setAttribute('playsinline', '');
      } catch {
        /* */
      }
      if ('playsInline' in audio) {
        audio.playsInline = true;
      }
      loopAudioRef.current = audio;
      window.__landingLoopAudio = audio;
    }

    const audio = loopAudioRef.current;
    audio.muted = false;
    void audio.play().catch(() => {
      /* Browser may block until a gesture or file may be missing. */
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, soundOn ? '1' : '0');
    } catch {
      /* */
    }
  }, [soundOn]);

  useEffect(() => {
    if (!soundOn) {
      stopLoopAudio();
      return;
    }
    // Do not stop in cleanup: React Strict Mode remount would pause playback
    // right after start. User gesture to enable sound calls startLoopAudio in toggleSound.
    startLoopAudio();
  }, [soundOn, startLoopAudio, stopLoopAudio]);

  useEffect(() => {
    const syncPath = () => setLandingPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    window.addEventListener('studio:landing-path', syncPath);
    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('studio:landing-path', syncPath);
    };
  }, []);

  const transitionToPath = useCallback((path) => {
    if (!path || transitioning) return;
    setTransitioning(true);
    const heroShell = document.querySelector('#landing-hero-shell');
    const main = document.querySelector('main.landing-root');
    const visuals = document.querySelector('#landing-visuals-root');
    heroShell?.classList.add('landing-hero--transitioning');
    visuals?.classList.add('landing-visuals--transitioning');
    main?.classList.add('landing-root--cinematic-transition');
    playUnlockChime();
    window.setTimeout(() => {
      if (typeof window.__navigateLandingPath === 'function') {
        window.__navigateLandingPath(path);
      } else {
        window.location.assign(path);
      }
      holdProgressRef.current = 0;
      setHoldProgress(0);
      setHolding(false);
      // In SPA mode this component persists across route-state changes,
      // so we must explicitly unlock transitions for the next hold.
      window.setTimeout(() => {
        setTransitioning(false);
      }, 40);
    }, TRANSITION_MS);
  }, [transitioning]);

  const getHoldTargetPath = useCallback(() => {
    const path = window.location.pathname;
    if (path === '/next' || path === '/next/') return '/dome';
    if (path === '/dome' || path === '/dome/') return null;
    return '/next';
  }, []);

  const getHoldDurationMs = useCallback(() => {
    const path = window.location.pathname;
    if (path === '/next' || path === '/next/') return NEXT_TO_DOME_HOLD_MS;
    return HOLD_MS;
  }, []);

  const stopRaf = useCallback(() => {
    if (holdRafRef.current !== null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
  }, []);

  const runForwardHold = useCallback(
    (fromProgress) => {
      const holdMs = getHoldDurationMs();
      const startedAt = performance.now() - fromProgress * holdMs;
      const tick = (now) => {
        if (!holdActiveRef.current) return;
        const elapsed = now - startedAt;
        const p = Math.min(1, elapsed / holdMs);
        holdProgressRef.current = p;
        setHoldProgress(p);

        const milestones = [0.25, 0.5, 0.75];
        for (const m of milestones) {
          if (p >= m && !holdMilestonesRef.current.has(m)) {
            holdMilestonesRef.current.add(m);
            if (soundOn) {
              playHoldMilestoneTick();
            }
          }
        }

        if (p >= 1) {
          holdActiveRef.current = false;
          stopRaf();
          setHolding(false);
          setHoldProgress(1);
          holdProgressRef.current = 1;
          holdMilestonesRef.current = new Set();
          const targetPath = getHoldTargetPath();
          transitionToPath(targetPath);
          return;
        }
        holdRafRef.current = requestAnimationFrame(tick);
      };
      holdRafRef.current = requestAnimationFrame(tick);
    },
    [getHoldDurationMs, getHoldTargetPath, soundOn, stopRaf, transitionToPath]
  );

  const runReverseReset = useCallback(() => {
    stopRaf();
    const from = holdProgressRef.current;
    if (from <= 0) {
      setHoldProgress(0);
      holdProgressRef.current = 0;
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / RESET_MS);
      const eased = 1 - Math.pow(1 - t, 2);
      const p = from * (1 - eased);
      holdProgressRef.current = p;
      setHoldProgress(p);
      if (t >= 1) {
        holdProgressRef.current = 0;
        setHoldProgress(0);
        stopRaf();
        return;
      }
      holdRafRef.current = requestAnimationFrame(tick);
    };
    holdRafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  const startHold = useCallback(
    (target) => {
      if (transitioning) return;
      if (!shouldCountAsHoldStart(target)) return;
      if (holdProgressRef.current >= 0.999) {
        holdProgressRef.current = 0;
        setHoldProgress(0);
      }
      stopRaf();
      holdActiveRef.current = true;
      holdMilestonesRef.current = new Set();
      setHolding(true);
      runForwardHold(holdProgressRef.current);
      if (soundOn) {
        startLoopAudio();
      }
    },
    [runForwardHold, soundOn, startLoopAudio, stopRaf, transitioning]
  );

  const stopHold = useCallback(() => {
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;
    setHolding(false);
    holdMilestonesRef.current = new Set();
    runReverseReset();
  }, [runReverseReset]);

  useEffect(() => {
    const root = document.querySelector('main.landing-root');
    if (!root) return undefined;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      startHold(e.target);
    };
    const onMouseUp = () => stopHold();
    const onMouseLeave = () => stopHold();
    const onTouchStart = (e) => {
      if (e.cancelable) e.preventDefault();
      startHold(e.target);
    };
    const onTouchEnd = () => stopHold();

    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('mouseup', onMouseUp);
    root.addEventListener('mouseleave', onMouseLeave);
    root.addEventListener('touchstart', onTouchStart, { passive: false });
    root.addEventListener('touchend', onTouchEnd);
    root.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('mouseup', onMouseUp, true);
    window.addEventListener('touchend', onTouchEnd, true);
    window.addEventListener('touchcancel', onTouchEnd, true);
    const onBlur = () => stopHold();
    window.addEventListener('blur', onBlur);

    return () => {
      root.removeEventListener('mousedown', onMouseDown);
      root.removeEventListener('mouseup', onMouseUp);
      root.removeEventListener('mouseleave', onMouseLeave);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('mouseup', onMouseUp, true);
      window.removeEventListener('touchend', onTouchEnd, true);
      window.removeEventListener('touchcancel', onTouchEnd, true);
      window.removeEventListener('blur', onBlur);
      stopRaf();
    };
  }, [startHold, stopHold, stopRaf]);

  useEffect(() => {
    const blockScroll = (ev) => {
      ev.preventDefault();
    };

    const main = document.querySelector('main.landing-root');
    main?.addEventListener('wheel', blockScroll, { passive: false });
    main?.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      main?.removeEventListener('wheel', blockScroll);
      main?.removeEventListener('touchmove', blockScroll);
    };
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      if (!prev) {
        startLoopAudio();
      } else {
        stopLoopAudio();
      }
      return !prev;
    });
  }, [startLoopAudio, stopLoopAudio]);

  const goBottle = useCallback(() => {
    window.location.assign('/bottle');
  }, []);

  const goConfigurator = useCallback(() => {
    window.location.assign('/configurator');
  }, []);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign('/');
  }, []);

  const onRootHome = isLandingRootHome(landingPathname);

  return (
    <>
      <div className='landing-classic-chrome' aria-hidden={menuOpen}>
        <div className='landing-classic-chrome__top'>
          {onRootHome ? (
            <button
              type='button'
              className='landing-classic-chrome__plus'
              onClick={goConfigurator}
              aria-label='Open 3D studio'
            >
              <ArrowUpRightGlyph />
            </button>
          ) : (
            <button type='button' className='landing-classic-chrome__logo' aria-label='Go back' onClick={goBack}>
              <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
                <path d='M14.8 5.6L8.4 12L14.8 18.4' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M9 12H20' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
              </svg>
            </button>
          )}
          <div className='landing-classic-chrome__top-actions'>
            <StudioReloadFab className='landing-classic-chrome__reload' />
            <button
              type='button'
              className='landing-classic-chrome__menu-btn'
              aria-expanded={menuOpen}
              aria-controls='landing-classic-menu'
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className='landing-classic-chrome__bottom'>
          <div className='landing-classic-chrome__bottom-left'>
            <button
              type='button'
              className='landing-classic-chrome__sound'
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Mute ambient sound' : 'Play ambient sound'}
            >
              <span className='landing-classic-chrome__sound-icon' aria-hidden='true'>
                {soundOn ? (
                  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M5 14H8L12.5 18V6L8 10H5V14Z'
                      stroke='white'
                      strokeWidth='1.4'
                      fill='none'
                      strokeLinejoin='round'
                      strokeLinecap='round'
                    />
                    <path d='M15.4 9.2C16.3 10 16.8 11 16.8 12C16.8 13 16.3 14 15.4 14.8' stroke='white' strokeWidth='1.4' />
                    <path d='M17.8 7C19.4 8.4 20.3 10.1 20.3 12C20.3 13.9 19.4 15.6 17.8 17' stroke='white' strokeWidth='1.4' />
                  </svg>
                ) : (
                  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M5 14H8L12.5 18V6L8 10H5V14Z'
                      stroke='white'
                      strokeWidth='1.4'
                      fill='none'
                      strokeLinejoin='round'
                      strokeLinecap='round'
                    />
                    <path d='M15.2 9.2L20.3 14.3' stroke='white' strokeWidth='1.6' strokeLinecap='round' />
                    <path d='M20.3 9.2L15.2 14.3' stroke='white' strokeWidth='1.6' strokeLinecap='round' />
                  </svg>
                )}
              </span>
              <span className='landing-classic-chrome__sound-label'>
                {soundOn ? 'SOUND ON' : 'SOUND OFF'}
              </span>
            </button>
          </div>

          <div className='landing-classic-chrome__hold-col'>
            <p
              className={`landing-classic-chrome__hold ${holding ? 'landing-classic-chrome__hold--active' : ''} landing-classic-chrome__hold--gated`}
            >
              <span className='landing-classic-chrome__hold-line'>CLICK</span>
              <span> &amp; HOLD</span>
            </p>
            <div className='landing-classic-chrome__hold-meter' aria-hidden='true'>
              <div
                className='landing-classic-chrome__hold-meter-fill'
                style={{ transform: `scaleX(${holdProgress || 0})` }}
              />
            </div>
          </div>

          <div className='landing-classic-chrome__bottom-right'>
            <button
              type='button'
              className='landing-classic-chrome__plus'
              onClick={goBottle}
              aria-label='Open bottle mockup'
            >
              <ArrowUpRightGlyph />
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div
          id='landing-classic-menu'
          className='landing-classic-chrome__overlay'
          role='dialog'
          aria-modal='true'
          aria-label='Site menu'
        >
          <button
            type='button'
            className='landing-classic-chrome__overlay-close'
            onClick={() => setMenuOpen(false)}
            aria-label='Close menu'
          >
            <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
              <path d='M6 6L18 18' stroke='currentColor' strokeWidth='1.85' strokeLinecap='round' />
              <path d='M18 6L6 18' stroke='currentColor' strokeWidth='1.85' strokeLinecap='round' />
            </svg>
          </button>

          <div className='landing-classic-chrome__overlay-panel'>
            <p className='landing-classic-menu__eyebrow'>Navigate</p>
            <h2 className='landing-classic-menu__title'>Studio</h2>
            <nav className='landing-classic-menu' aria-label='Destinations'>
              <ul className='landing-classic-menu__list'>
                {MENU_LINKS.map((item) => (
                  <li key={item.href} className='landing-classic-menu__item'>
                    <a
                      className='landing-classic-menu__link'
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className='landing-classic-menu__link-main'>
                        <span className='landing-classic-menu__link-title'>{item.title}</span>
                        {item.external ? (
                          <span className='landing-classic-menu__link-badge' aria-hidden='true'>
                            ↗
                          </span>
                        ) : null}
                      </span>
                      <span className='landing-classic-menu__link-desc'>{item.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
