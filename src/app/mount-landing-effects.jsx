import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import FloatingLines from '@/features/landing/FloatingLines.jsx';
import { LANDING_PALETTE } from '@/features/landing/landing-palette.js';
import SplashCursor from '@/features/landing/SplashCursor.jsx';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mountLandingEffects() {
  const heroRoot = document.querySelector('#hero-floating-lines-root');
  if (heroRoot) {
    createRoot(heroRoot).render(
      <StrictMode>
        <FloatingLines
          linesGradient={LANDING_PALETTE.floatingHeroLinesGradient}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={8}
          lineDistance={8}
          animationSpeed={1}
          interactive
          interactivePointerTarget="window"
          bendRadius={8}
          bendStrength={-2}
          parallax
          mixBlendMode="normal"
        />
      </StrictMode>
    );
  }

  const cursorRoot = document.querySelector('#landing-cursor-root');
  if (cursorRoot && !prefersReducedMotion()) {
    createRoot(cursorRoot).render(
      <StrictMode>
        <SplashCursor
          DYE_RESOLUTION={720}
          SIM_RESOLUTION={128}
          SPLAT_FORCE={4800}
          SPLAT_RADIUS={0.22}
          TRANSPARENT
          RAINBOW_MODE={false}
          COLOR={LANDING_PALETTE.accent}
          BACK_COLOR={{ r: 0, g: 0, b: 0 }}
        />
      </StrictMode>
    );
  }
}
