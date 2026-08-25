/* Direction « Le Comptoir Éditorial » : filtres instantanés et surfaces de commande courtes, sans framework. */
(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
		const body = document.body;
		const feedbackStack = qs('[data-rc-feedback-stack]');
		const showFeedback = (message, kind = 'success', retry = null) => {
			if (!feedbackStack || !message) return () => {};
			const notice = document.createElement('section');
			notice.className = 'rc-feedback'; notice.dataset.kind = kind;
			notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
			notice.innerHTML = `<i aria-hidden="true">${kind === 'error' ? '!' : kind === 'loading' ? '…' : '✓'}</i><p></p>${retry ? '<button type="button">Réessayer</button>' : ''}`;
			qs('p', notice).textContent = message;
			const dismiss = () => notice.remove();
			qs('button', notice)?.addEventListener('click', () => { dismiss(); retry?.(); });
			feedbackStack.append(notice);
			if (kind !== 'loading') window.setTimeout(dismiss, 5200);
			return dismiss;
		};
		const queryParams = new URLSearchParams(window.location.search);
		const requestedState = queryParams.has('rcqa') ? (queryParams.get('rc_ui') || '') : '';
	const drawer = qs('[data-rc-cart-drawer]');
	const layer = qs('[data-rc-cart-layer]');
	let lastCartTrigger = null;
	const openCart = (trigger = document.activeElement) => { if (!drawer || !layer) return; lastCartTrigger = trigger instanceof HTMLElement ? trigger : null; drawer.inert = false; drawer.removeAttribute('inert'); drawer.setAttribute('aria-hidden', 'false'); layer.hidden = false; body.classList.add('rc-cart-open'); qs('[data-rc-close-cart]', drawer)?.focus(); };
	const closeCart = () => { if (!drawer || !layer) return; const wasOpen = drawer.getAttribute('aria-hidden') === 'false'; drawer.setAttribute('aria-hidden', 'true'); drawer.inert = true; layer.hidden = true; body.classList.remove('rc-cart-open'); if (wasOpen) lastCartTrigger?.focus(); };
  const paintCartDrawer = (payload) => { if (!payload) return; qsa('[data-rc-cart-count]').forEach((count) => { count.textContent = payload.count; }); qsa('[data-rc-cart-summary]').forEach((summary) => { summary.textContent = payload.summary; }); qsa('[data-rc-mini-cart]').forEach((mini) => { mini.innerHTML = payload.html; }); };
  const refreshCartDrawer = async () => { if (!window.restocommerceTheme) return; try { const data = new FormData(); data.append('action', 'restocommerce_cart_drawer'); data.append('nonce', window.restocommerceTheme.nonce); const response = await fetch(window.restocommerceTheme.ajaxUrl, { method: 'POST', body: data, credentials: 'same-origin' }); const payload = await response.json(); if (payload.success) paintCartDrawer(payload.data); } catch {} };
	qsa('[data-rc-open-cart]').forEach((button) => button.addEventListener('click', () => openCart(button)));
  qs('[data-rc-close-cart]')?.addEventListener('click', closeCart); layer?.addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); quickView?.close(); } });

  const marketplace = qs('[data-rc-marketplace]');
	  if (marketplace) {
	    const search = qs('[data-rc-search]', marketplace); const clear = qs('[data-rc-clear-search]', marketplace); const cards = qsa('[data-rc-restaurant]', marketplace); const cuisineButtons = qsa('[data-rc-cuisine]', marketplace); const openOnly = qs('[data-rc-open-only]', marketplace); const result = qs('[data-rc-result-count]', marketplace); const empty = qs('[data-rc-empty]', marketplace); const grid = qs('[data-rc-restaurant-grid]', marketplace); const loading = qs('[data-rc-marketplace-loading]', marketplace); const error = qs('[data-rc-marketplace-error]', marketplace); const success = qs('[data-rc-marketplace-success]', marketplace);
	    let cuisine = 'all'; let onlyOpen = false;
	    const setMarketplaceState = (state = '') => { const isLoading = state === 'loading'; const isError = state === 'error'; const isSuccess = state === 'success'; const isEmpty = state === 'empty'; if (loading) loading.hidden = !isLoading; if (error) error.hidden = !isError; if (success) success.hidden = !isSuccess; if (empty) empty.hidden = !isEmpty; if (grid) grid.hidden = isLoading || isError || isSuccess || isEmpty; if (isLoading || isError || isSuccess || isEmpty) { cards.forEach((card) => { card.hidden = true; }); } };
	    const apply = () => { const query = (search?.value || '').trim().toLocaleLowerCase('fr'); let visible = 0; cards.forEach((card) => { const matches = (!query || card.dataset.search.includes(query)) && (cuisine === 'all' || card.dataset.cuisine === cuisine) && (!onlyOpen || card.dataset.open === 'true'); card.hidden = !matches; if (matches) visible += 1; }); if (result) result.innerHTML = `<b>${visible}</b> restaurant${visible > 1 ? 's' : ''} ${onlyOpen ? (visible > 1 ? 'ouverts' : 'ouvert') : 'dans la sélection'}`; if (empty) empty.hidden = visible !== 0; if (clear) clear.hidden = !(search?.value); };
	    search?.addEventListener('input', apply); clear?.addEventListener('click', () => { search.value = ''; apply(); search.focus(); });
	    cuisineButtons.forEach((button) => button.addEventListener('click', () => { cuisine = button.dataset.rcCuisine || 'all'; cuisineButtons.forEach((item) => item.classList.toggle('is-active', item === button)); apply(); }));
	    openOnly?.addEventListener('click', () => { onlyOpen = !onlyOpen; openOnly.classList.toggle('is-active', onlyOpen); apply(); });
			qs('[data-rc-reset-search]', marketplace)?.addEventListener('click', () => { cuisine = 'all'; onlyOpen = false; if (search) search.value = ''; cuisineButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.rcCuisine === 'all')); openOnly?.classList.remove('is-active'); apply(); search?.focus(); });
			qs('[data-rc-retry-marketplace]', marketplace)?.addEventListener('click', () => { setMarketplaceState('success'); }); qs('[data-rc-dismiss-marketplace-success]', marketplace)?.addEventListener('click', () => { setMarketplaceState(''); apply(); search?.focus(); });
			if (/^marketplace-(loading|error|success|empty)$/.test(requestedState)) setMarketplaceState(requestedState.replace('marketplace-', ''));
	  }

	  const normalizeLoopVendorMarkup = () => { qsa('.wcfmmp_sold_by_container').forEach((container) => { const label = qs('.wcfmmp_sold_by_label', container)?.textContent.replace(/[:\\s]+$/u, '').trim() || 'Restaurant partenaire'; const links = qsa('a', container); links.forEach((link) => { const image = qs('img', link); const text = link.textContent.replace(/\\s+/gu, ' ').trim(); if (!text && !image) { link.remove(); return; } link.classList.remove('woocommerce-LoopProduct-link', 'woocommerce-loop-product__link'); link.classList.add('rc-sold-by-link'); if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', label); if (image) image.alt = ''; }); }); };
	  normalizeLoopVendorMarkup();

  const storeMenu = qs('[data-rc-store-menu]');
	  if (storeMenu) {
	    const filters = qsa('[data-rc-menu-filter]', storeMenu); const products = qsa('[data-rc-menu-product]', storeMenu); const menuGrid = qs('[data-rc-store-product-grid]', storeMenu); const empty = qs('[data-rc-menu-empty]', storeMenu); const loading = qs('[data-rc-menu-loading]', storeMenu); const error = qs('[data-rc-menu-error]', storeMenu); const success = qs('[data-rc-menu-success]', storeMenu);
			const setMenuState = (state = '') => { const isLoading = state === 'loading'; const isError = state === 'error'; const isSuccess = state === 'success'; const isEmpty = state === 'empty'; if (loading) loading.hidden = !isLoading; if (error) error.hidden = !isError; if (success) success.hidden = !isSuccess; if (empty) empty.hidden = !isEmpty; if (menuGrid) menuGrid.hidden = isLoading || isError || isSuccess || isEmpty; if (isLoading || isError || isSuccess || isEmpty) products.forEach((product) => { product.hidden = true; }); };
			const applyMenuFilter = (category = 'all') => { let visible = 0; products.forEach((product) => { const match = category === 'all' || product.dataset.rcMenuCategory === category; product.hidden = !match; if (match) visible += 1; }); if (empty) empty.hidden = visible !== 0; };
	    filters.forEach((button) => button.addEventListener('click', () => { const category = button.dataset.rcMenuFilter || 'all'; filters.forEach((item) => item.classList.toggle('is-active', item === button)); applyMenuFilter(category); }));
			qs('[data-rc-retry-menu]', storeMenu)?.addEventListener('click', () => { setMenuState('success'); }); qs('[data-rc-dismiss-menu-success]', storeMenu)?.addEventListener('click', () => { setMenuState(''); applyMenuFilter('all'); filters[0]?.focus(); });
			if (/^menu-(loading|error|success|empty)$/.test(requestedState)) setMenuState(requestedState.replace('menu-', ''));
	  }

	const quickView = qs('[data-rc-quick-view]'); const quickContent = qs('[data-rc-quick-view-content]');
		const updateQuickConfigurator = (form) => {
			const variationId = qs('[data-rc-variation-id]', form); const price = qs('[data-rc-quick-price]', form); const submit = qs('[data-rc-quick-submit]', form); const sets = qsa('[data-rc-option-set]:not([data-rc-extra-option-set])', form); const extraSets = qsa('[data-rc-extra-option-set]', form); const supplementInputs = qsa('[data-rc-supplement-price]', form);
			let variations = []; try { variations = JSON.parse(form.dataset.rcVariations || '[]'); } catch { variations = []; }
			const selection = Object.fromEntries(qsa('[data-rc-option-set] input:checked', form).map((input) => [input.name, input.value]));
			const selected = variations.find((variation) => Object.entries(variation.attributes || {}).every(([attribute, value]) => selection[attribute] === value));
			if (variationId) variationId.value = selected?.id || '0';
			const baseAmount = Number(selected?.priceAmount || form.dataset.rcBaseAmount || 0); const supplementTotal = supplementInputs.filter((input) => input.checked).reduce((sum, input) => sum + Number(input.dataset.rcSupplementPrice || 0), 0); if (price) { const amount = baseAmount + supplementTotal; price.textContent = amount > 0 ? `${new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} MAD` : (selected?.price || form.dataset.rcBasePrice || price.textContent); }
			const extraComplete = extraSets.every((set) => set.dataset.rcExtraRequired !== '1' || qsa('input:checked', set).length > 0);
			if (submit) { const complete = sets.every((set) => qs('input:checked', set)); const ready = complete && extraComplete && (variations.length === 0 || !!selected); submit.disabled = !ready; const label = qs('[data-rc-quick-add-label]', submit); const priceLabel = qs('[data-rc-quick-add-price]', submit); if (label) label.textContent = ready ? 'Ajouter au panier' : 'Choisissez vos options'; if (priceLabel) { const total = baseAmount + supplementTotal; priceLabel.textContent = ready ? (total > 0 ? `${new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} MAD` : (selected?.price || form.dataset.rcBasePrice || '')) : ''; } }
		};
		let lastQuickTrigger = null;
		const quickLoadingMarkup = '<section class="rc-ui-state rc-ui-state--loading" role="status"><div><span class="rc-ui-state-mark" aria-hidden="true"><i></i><i></i><i></i></span><h3>Le plat arrive.</h3><p>Nous préparons ses options.</p></div></section>';
		const quickErrorMarkup = (message) => `<section class="rc-ui-state rc-ui-state--error" role="alert"><div><span class="rc-ui-state-mark" aria-hidden="true">!</span><h3>Impossible d’ouvrir ce plat.</h3><p>${message}</p><button type="button" class="rc-ui-state-action" data-rc-quick-retry>Réessayer</button></div></section>`;
		const openQuickView = async (button) => { if (!quickView || !quickContent || !window.restocommerceTheme) return; lastQuickTrigger = button; quickContent.innerHTML = quickLoadingMarkup; quickView.showModal(); try { const form = new FormData(); form.append('action', 'restocommerce_quick_view'); form.append('nonce', window.restocommerceTheme.nonce); form.append('product_id', button.dataset.rcQuickProduct); const response = await fetch(window.restocommerceTheme.ajaxUrl, { method: 'POST', body: form, credentials: 'same-origin' }); const payload = await response.json(); if (!payload.success) throw new Error(payload.data?.message || 'Ce plat est indisponible pour le moment.'); quickContent.innerHTML = payload.data.html; const configurator = qs('[data-rc-quick-order-form]', quickContent); if (configurator) updateQuickConfigurator(configurator); } catch (error) { quickContent.innerHTML = quickErrorMarkup(error.message || 'Vérifiez votre connexion puis réessayez.'); qs('[data-rc-quick-retry]', quickContent)?.addEventListener('click', () => { if (lastQuickTrigger) openQuickView(lastQuickTrigger); }); } };
	qsa('[data-rc-quick-product]').forEach((button) => button.addEventListener('click', () => openQuickView(button)));
		qsa('[data-rc-quick-order-form]').forEach(updateQuickConfigurator);
			document.addEventListener('change', (event) => { const form = event.target.closest?.('[data-rc-quick-order-form]'); if (!form) return; const extraSet = event.target.closest?.('[data-rc-extra-option-set]'); if (extraSet && event.target.matches('input[type="checkbox"]')) { const max = extraSet.dataset.rcExtraMax; const selected = qsa('input:checked', extraSet); if (max !== 'unlimited' && selected.length > Number(max)) { event.target.checked = false; showFeedback(`Choisissez au maximum ${max} option${Number(max) > 1 ? 's' : ''}.`, 'error'); } } updateQuickConfigurator(form); });
			document.addEventListener('submit', async (event) => { const form = event.target.closest?.('[data-rc-quick-order-form]'); if (!form || !window.restocommerceTheme) return; event.preventDefault(); if (!form.reportValidity()) return; const submit = qs('[data-rc-quick-submit]', form); const status = qs('[data-rc-quick-status]', form); if (submit) { submit.disabled = true; submit.setAttribute('aria-busy', 'true'); } if (status) status.textContent = 'Ajout au panier…'; const dismissLoading = showFeedback('Ajout de votre plat au panier…', 'loading'); try { const data = new FormData(form); data.append('action', 'restocommerce_quick_add_to_cart'); data.append('nonce', window.restocommerceTheme.nonce); const response = await fetch(window.restocommerceTheme.ajaxUrl, { method: 'POST', body: data, credentials: 'same-origin' }); const payload = await response.json(); if (!payload.success) throw new Error(payload.data?.message || 'Impossible d’ajouter ce plat.'); paintCartDrawer({ count: payload.data.count, summary: payload.data.summary || '', html: payload.data.mini_cart }); refreshCartDrawer(); if (status) status.textContent = payload.data.message; dismissLoading(); showFeedback(payload.data.message || 'Plat ajouté au panier.', 'success'); quickView?.close(); openCart(); } catch (error) { dismissLoading(); if (status) status.textContent = error.message || 'Impossible d’ajouter ce plat.'; showFeedback(error.message || 'Impossible d’ajouter ce plat.', 'error', () => form.requestSubmit()); if (submit) updateQuickConfigurator(form); } finally { submit?.removeAttribute('aria-busy'); } });
  qs('[data-rc-close-quick-view]')?.addEventListener('click', () => quickView?.close());
  quickView?.addEventListener('click', (event) => { if (event.target === quickView) quickView.close(); });
	  refreshCartDrawer();
	  if (window.jQuery) window.jQuery(document.body).on('added_to_cart', () => { refreshCartDrawer(); openCart(); });
})();
