import DomeGallery from './DomeGallery';
import InfiniteMenu from './InfiniteMenu';
import { LANDING_PALETTE } from './landing-palette.js';

import './landing-visual-sections.css';

const P4AI = 'https://p4ai.in';

const INFINITE_MENU_ITEMS = [
  {
    image: 'https://picsum.photos/seed/studio-a/600/600?grayscale',
    link: '/bottle',
    title: 'Bottle mockup',
    description: 'Label, glass, and engraving preview.'
  },
  {
    image: 'https://picsum.photos/seed/studio-b/600/600?grayscale',
    link: P4AI,
    title: 'P4AI',
    description: 'Visit p4ai.in for the main experience.'
  },
  {
    image: 'https://picsum.photos/seed/studio-c/600/600?grayscale',
    link: '/bottle',
    title: 'Bottle flow',
    description: 'Open the in-app bottle demo.'
  },
  {
    image: 'https://picsum.photos/seed/studio-d/600/600?grayscale',
    link: P4AI,
    title: 'P4AI hub',
    description: 'External site — opens in a new tab.'
  }
];

export default function LandingVisualSections({ mode = 'next' }) {
  const showDome = mode === 'dome';

  return (
    <div className='flex flex-col'>
      {showDome ? (
        <section
          className='relative isolate min-h-dvh shrink-0 snap-start snap-always overflow-hidden border-t border-white/5'
          aria-label='Dome gallery background'
        >
          <div className='absolute inset-0 z-0'>
            <DomeGallery
              fit={0.72}
              fitBasis='auto'
              minRadius={420}
              maxRadius={Infinity}
              padFactor={0.25}
              overlayBlurColor={LANDING_PALETTE.domeOverlayBlur}
              maxVerticalRotationDeg={0}
              segments={34}
              dragDampening={2}
              grayscale
              dragSensitivity={20}
              enlargeTransitionMs={300}
              openedImageWidth='min(92vw, 400px)'
              openedImageHeight='min(70vh, 400px)'
              imageBorderRadius='20px'
              openedImageBorderRadius='24px'
            />
          </div>
          <div className='pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/22 to-black/88' />
          <p className='landing-visual-hint landing-visual-hint--over-gradient'>
            Hold and drag horizontally
          </p>
        </section>
      ) : (
        <section
          className='relative isolate min-h-dvh shrink-0 snap-start snap-always overflow-hidden border-t border-white/5'
          aria-label='Infinite menu background'
        >
          <div className='absolute inset-0 z-0 bg-black'>
            <InfiniteMenu items={INFINITE_MENU_ITEMS} scale={1} />
          </div>
          <p className='landing-visual-hint landing-visual-hint--over-gradient'>
            Hold and drag to explore
          </p>
        </section>
      )}
    </div>
  );
}
