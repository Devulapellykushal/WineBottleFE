import './client-demo-try-links.css';

/**
 * Plain-language links so reviewers can open the product demos.
 */
export default function ClientDemoTryLinks({
  tone = 'dark',
  layout = 'inline',
  alignEnd = false,
  showConfigurator = true,
  showBottle = true,
  showConfigureBottle = false,
  showHome = false
}) {
  const rootClass = [
    'client-demo-try-links',
    tone === 'light' ? 'client-demo-try-links--tone-light' : 'client-demo-try-links--tone-dark',
    layout === 'fixed' ? 'client-demo-try-links--fixed' : 'client-demo-try-links--inline',
    alignEnd ? 'client-demo-try-links--align-end' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={rootClass} aria-label='Try the demos'>
      {showConfigurator ? (
        <p>
          <a href='/configurator'>Open the 3D studio</a> — spin the bottle and try colors in your browser.
        </p>
      ) : null}
      {showBottle ? (
        <p>
          <a href='/bottle'>Open the bottle mockup</a> — upload a logo and preview how it looks engraved.
        </p>
      ) : null}
      {showConfigureBottle ? (
        <p>
          <a href='/configurebottle'>All in one studio</a> — colors and logo together in one view.
        </p>
      ) : null}
      {showHome ? (
        <p>
          <a href='/'>Back to the main experience</a> — hold and explore the gallery.
        </p>
      ) : null}
    </nav>
  );
}
