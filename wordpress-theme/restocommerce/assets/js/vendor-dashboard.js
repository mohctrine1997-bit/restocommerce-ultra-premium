/*
 * Direction « Atelier du Service » : le dashboard rend les gestes du restaurant
 * immédiatement visibles, tandis que WCFM conserve les routes et la logique métier.
 */
(() => {
	const init = () => {
  const config = window.restocommerceVendorDashboard;
  const container = document.querySelector('#wcfm-main-contentainer');
  if (!config || !container) return;

  const icon = (name) => ({
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.4-6.4-1.4 1.4M7 16.4l-1.4 1.4m0-12.2L7 7m9.4 9.4 1.4 1.4"/><circle cx="12" cy="12" r="4"/></svg>',
    orders: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>',
    store: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4zM3 10l2-6h14l2 6M9 20v-6h6v6"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>',
  }[name] || '');

  const link = (href, label, glyph, className = '') => `<a class="${className}" href="${href}">${glyph ? icon(glyph) : ''}<span>${label}</span></a>`;
  const shell = document.createElement('section');
  shell.className = 'rc-vendor-service-shell';
  shell.innerHTML = `
    <header class="rc-vendor-service-header">
      <div><p>ESPACE RESTAURATEUR</p><h1>Bonjour, ${config.vendor || 'la maison'}.</h1></div>
      <button type="button" class="rc-vendor-status" data-rc-vendor-pause aria-pressed="${config.isPaused ? 'true' : 'false'}"><i></i><span></span></button>
    </header>
    <section class="rc-vendor-next-step" data-rc-vendor-next>
      <div class="rc-vendor-next-mark">${icon('orders')}</div>
      <div><p>LE PROCHAIN GESTE</p><h2></h2><span></span></div>
      <a href="${config.links.orders}">Voir les commandes <b>→</b></a>
    </section>
    <section class="rc-vendor-quick-actions" aria-label="Actions rapides">
      ${link(config.links.newDish, 'Ajouter un plat', 'plus', 'rc-vendor-action-card')}
      ${link(config.links.menu, 'Modifier le menu', 'menu', 'rc-vendor-action-card')}
      ${link(config.links.store, 'Voir ma boutique', 'store', 'rc-vendor-action-card')}
    </section>
    <nav class="rc-vendor-mobile-nav" aria-label="Navigation restaurateur">
      ${link(config.links.today, 'Aujourd’hui', 'sun', 'rc-vendor-nav-link')}
      ${link(config.links.orders, 'Commandes', 'orders', 'rc-vendor-nav-link')}
      ${link(config.links.menu, 'Menu', 'menu', 'rc-vendor-nav-link')}
      ${link(config.links.store, 'Boutique', 'store', 'rc-vendor-nav-link')}
      <button type="button" class="rc-vendor-nav-link" data-rc-vendor-more>${icon('more')}<span>Plus</span></button>
    </nav>
    <aside class="rc-vendor-more-sheet" data-rc-vendor-sheet aria-hidden="true">
      <div class="rc-vendor-sheet-backdrop" data-rc-vendor-sheet-close></div>
      <div class="rc-vendor-sheet-panel" role="dialog" aria-modal="true" aria-label="Autres réglages">
        <div class="rc-vendor-sheet-handle" aria-hidden="true"></div>
        <p>GESTION AVANCÉE</p><h2>Autres options</h2>
        <div>${link(config.links.settings, 'Réglages du restaurant', 'more')}${link(config.links.media, 'Photos et médias', 'more')}${link(config.links.reports, 'Voir les rapports', 'more')}</div>
        <button type="button" class="rc-vendor-sheet-close" data-rc-vendor-sheet-close>Fermer</button>
      </div>
    </aside>`;
  container.prepend(shell);

  const isCurrent = (href) => new URL(href, window.location.origin).pathname === window.location.pathname;
  shell.querySelectorAll('.rc-vendor-nav-link[href]').forEach((item) => item.classList.toggle('is-active', isCurrent(item.href)));

  const pauseButton = shell.querySelector('[data-rc-vendor-pause]');
  const next = shell.querySelector('[data-rc-vendor-next]');
  const setServiceState = (paused, message = '') => {
    config.isPaused = paused;
    shell.classList.toggle('is-paused', paused);
    pauseButton.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseButton.querySelector('span').textContent = paused ? 'Restaurant en pause' : 'Restaurant ouvert';
    next.querySelector('h2').textContent = paused ? 'Reprendre les commandes.' : 'Vérifier les commandes.';
    next.querySelector('span').textContent = message || (paused ? 'La carte est visible, mais aucune nouvelle commande ne peut être passée.' : 'Les nouvelles commandes apparaissent ici. Prenez-les en charge en un geste.');
    next.querySelector('a').textContent = paused ? 'Rouvrir le service →' : 'Voir les commandes →';
    next.querySelector('a').href = paused ? '#' : config.links.orders;
  };
  setServiceState(Boolean(config.isPaused));

  pauseButton.addEventListener('click', async () => {
    const paused = !config.isPaused;
    pauseButton.disabled = true;
    try {
      const data = new FormData();
      data.append('action', 'restocommerce_toggle_vendor_service');
      data.append('nonce', config.nonce);
      data.append('paused', paused ? '1' : '0');
      const response = await fetch(config.ajaxUrl, { method: 'POST', body: data, credentials: 'same-origin' });
      const result = await response.json();
      if (!result.success) throw new Error(result.data?.message || 'Impossible de modifier le statut maintenant.');
      setServiceState(Boolean(result.data.paused), result.data.message);
    } catch (error) {
      next.querySelector('span').textContent = error.message || 'Impossible de modifier le statut maintenant.';
    } finally {
      pauseButton.disabled = false;
    }
  });

  next.querySelector('a').addEventListener('click', (event) => {
    if (!config.isPaused) return;
    event.preventDefault();
    pauseButton.click();
  });

  const sheet = shell.querySelector('[data-rc-vendor-sheet]');
  const closeSheet = () => { sheet.setAttribute('aria-hidden', 'true'); document.body.classList.remove('rc-vendor-sheet-open'); };
  shell.querySelector('[data-rc-vendor-more]').addEventListener('click', () => { sheet.setAttribute('aria-hidden', 'false'); document.body.classList.add('rc-vendor-sheet-open'); });
  shell.querySelectorAll('[data-rc-vendor-sheet-close]').forEach((button) => button.addEventListener('click', closeSheet));

  document.querySelectorAll('#wcfm_menu .wcfm_menu_item').forEach((item) => {
    const href = item.querySelector('a')?.href || '';
    if (![config.links.today, config.links.orders, config.links.menu].some((primary) => href.startsWith(primary))) item.classList.add('rc-vendor-secondary-menu');
  });
	};
	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init, { once: true } );
	} else {
		init();
	}
})();
