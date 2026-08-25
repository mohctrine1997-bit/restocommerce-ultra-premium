/* Direction « Le Comptoir Éditorial » : interactions brèves, accessibles et réellement synchronisées à WooCommerce. */
(() => {
	const app = document.querySelector('[data-rc-vendor-app]');
	const config = window.restocommerceVendorApp;
	if (!app || !config) return;
	const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
	const feedbackHost = document.querySelector('[data-rc-vendor-feedback]');
	const notify = (message, kind = 'success', retry = null) => {
		if (!feedbackHost || !message) return () => {};
		const item = document.createElement('section');
		item.className = 'rc-feedback is-visible'; item.dataset.kind = kind; item.setAttribute('role', kind === 'error' ? 'alert' : 'status');
		item.innerHTML = `<i aria-hidden="true">${kind === 'error' ? '!' : kind === 'loading' ? '…' : '✓'}</i><p></p>${retry ? '<button type="button">Réessayer</button>' : ''}`;
		item.querySelector('p').textContent = message;
		const dismiss = () => item.remove(); item.querySelector('button')?.addEventListener('click', () => { dismiss(); retry?.(); }); feedbackHost.replaceChildren(item); if (kind !== 'loading') window.setTimeout(dismiss, 5200); return dismiss;
	};
	const queryParams = new URLSearchParams(window.location.search);
	const requestedState = queryParams.has('rcqa') ? (queryParams.get('rc_ui') || '') : '';

  const labels = { overview: 'Vue d’ensemble', orders: 'Commandes', menu: 'Mon menu', hours: 'Horaires', profile: 'Profil restaurant' };
  const post = async (action, fields = {}) => {
    const form = new FormData();
    form.append('action', action);
    form.append('nonce', config.nonce);
    Object.entries(fields).forEach(([key, value]) => form.append(key, String(value)));
    const response = await fetch(config.ajaxUrl, { method: 'POST', body: form, credentials: 'same-origin' });
    const result = await response.json();
    if (!result.success) throw new Error(result.data?.message || 'Une mise à jour est impossible pour le moment.');
    return result.data;
  };

  const activate = (section) => {
    if (!labels[section]) return;
    app.querySelectorAll('[data-rc-panel]').forEach((panel) => { panel.hidden = panel.dataset.rcPanel !== section; });
    app.querySelectorAll('[data-rc-tab]').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.rcTab === section));
    const title = app.querySelector('[data-rc-section-title]');
    if (title) title.textContent = labels[section];
    window.history.replaceState(null, '', `${window.location.pathname}#${section}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  app.querySelectorAll('[data-rc-tab], [data-rc-go]').forEach((control) => control.addEventListener('click', () => activate(control.dataset.rcTab || control.dataset.rcGo)));
	const initial = window.location.hash.slice(1);
	if (labels[initial]) activate(initial);
	const setListState = (name, state = '') => { const shell = app.querySelector(`[data-rc-${name}-shell]`); const list = app.querySelector(`[data-rc-${name}-list]`); const loading = app.querySelector(`[data-rc-${name}-loading]`); const error = app.querySelector(`[data-rc-${name}-error]`); const success = app.querySelector(`[data-rc-${name}-success]`); const empty = app.querySelector(`[data-rc-${name}-empty]`); if (!shell) return; shell.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false'); if (loading) loading.hidden = state !== 'loading'; if (error) error.hidden = state !== 'error'; if (success) success.hidden = state !== 'success'; if (empty) empty.hidden = state !== 'empty'; if (list) list.hidden = state === 'loading' || state === 'error' || state === 'success' || state === 'empty'; };
	if (/^orders-(loading|error|success|empty)$/.test(requestedState)) { activate('orders'); setListState('orders', requestedState.replace('orders-', '')); }
	if (/^menu-(loading|error|success|empty)$/.test(requestedState)) { activate('menu'); setListState('menu', requestedState.replace('menu-', '')); }
	app.querySelectorAll('[data-rc-retry-list]').forEach((button) => button.addEventListener('click', () => { const name = button.dataset.rcRetryList; setListState(name, 'success'); }));
	app.querySelectorAll('[data-rc-dismiss-list-success]').forEach((button) => button.addEventListener('click', () => { const name = button.dataset.rcDismissListSuccess; setListState(name); app.querySelector(`[data-rc-${name}-list]`)?.focus?.(); }));

	const service = app.querySelector('[data-rc-service-toggle]');
	if (service) service.addEventListener('click', async () => {
		const paused = service.getAttribute('aria-pressed') !== 'true';
		service.disabled = true; service.setAttribute('aria-busy', 'true'); const dismissLoading = notify(paused ? 'Mise en pause du restaurant…' : 'Réouverture du restaurant…', 'loading');
		try {
			const data = await post('restocommerce_toggle_vendor_service', { paused: paused ? 1 : 0 });
			service.classList.toggle('is-paused', Boolean(data.paused));
			service.setAttribute('aria-pressed', data.paused ? 'true' : 'false');
			const label = service.querySelector('span'); if (label) label.textContent = data.paused ? 'Fermé' : 'Ouvert'; dismissLoading(); notify(data.message || 'Statut du restaurant mis à jour.', 'success');
		} catch (error) { dismissLoading(); notify(error.message, 'error', () => service.click()); } finally { service.disabled = false; service.removeAttribute('aria-busy'); }
	});

  const statusClass = (state) => `rc-vendor-order-row`;
  app.querySelectorAll('[data-rc-order-advance]').forEach((button) => button.addEventListener('click', async () => {
    const row = button.closest('[data-rc-order]'); if (!row) return;
		button.disabled = true; button.setAttribute('aria-busy', 'true'); const dismissLoading = notify('Mise à jour de la commande…', 'loading');
    try {
      const data = await post('restocommerce_vendor_advance_order', { order_id: row.dataset.rcOrder });
      const status = row.querySelector('[data-rc-order-status]');
      if (status) { status.dataset.rcOrderStatus = data.state; status.textContent = data.label; }
      if (data.action) button.childNodes[0].nodeValue = data.action; else button.remove();
			if (data.state === 'completed') {
				app.querySelectorAll('[data-rc-active-orders], [data-rc-order-count]').forEach((counter) => { const value = Math.max(0, Number(counter.textContent || 0) - 1); counter.textContent = String(value); if (!value && counter.matches('[data-rc-order-count]')) counter.remove(); });
			}
			dismissLoading(); notify(`Commande ${data.label.toLowerCase()}.`, 'success');
		} catch (error) { dismissLoading(); notify(error.message, 'error', () => button.click()); } finally { if (button.isConnected) { button.disabled = false; button.removeAttribute('aria-busy'); } }
	}));

	const bindProductToggle = (button) => {
		if (!button || button.dataset.rcProductToggleBound === 'true') return;
		button.dataset.rcProductToggleBound = 'true';
		button.addEventListener('click', async () => {
	  const row = button.closest('[data-rc-product]'); if (!row) return;
			const available = button.dataset.rcAvailable !== '1'; button.disabled = true; button.setAttribute('aria-busy', 'true'); const dismissLoading = notify('Mise à jour de la disponibilité…', 'loading');
    try {
      const data = await post('restocommerce_vendor_toggle_product', { product_id: row.dataset.rcProduct, available: available ? 1 : 0 });
      button.dataset.rcAvailable = data.available ? '1' : '0'; button.classList.toggle('is-available', Boolean(data.available)); button.classList.toggle('is-unavailable', !data.available);
			const label = button.querySelector('span'); if (label) label.textContent = data.label; dismissLoading(); notify(`Plat ${data.label.toLowerCase()}.`, 'success');
		} catch (error) { dismissLoading(); notify(error.message, 'error', () => button.click()); } finally { button.disabled = false; button.removeAttribute('aria-busy'); }
		});
	};
	const bindProductToggles = (scope = app) => scope.querySelectorAll('[data-rc-product-toggle]').forEach(bindProductToggle);
	bindProductToggles();
	const menuMarkup = (products) => products.length ? products.map((product) => `<article data-rc-product="${escapeHtml(product.id)}"><div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.category)} · ${escapeHtml(product.price)}</p><div class="rc-vendor-product-tools"><button type="button" data-rc-edit-product>Modifier</button><button type="button" data-rc-duplicate-product>Dupliquer</button></div></div><button type="button" data-rc-product-toggle data-rc-available="${product.available ? '1' : '0'}" class="${product.available ? 'is-available' : 'is-unavailable'}"><i></i><span>${product.available ? 'Disponible' : 'Indisponible'}</span></button></article>`).join('') : '<section class="rc-ui-state"><div><span class="rc-ui-state-mark" aria-hidden="true">⌁</span><h3>Votre menu attend son premier plat.</h3><p>Ajoutez un plat quand vous êtes prêt. Vous pourrez le mettre en pause en un geste.</p><button type="button" class="rc-ui-state-action" data-rc-open-product-wizard>Ajouter un plat</button></div></section>';
	window.addEventListener('restocommerce:product-saved', async (event) => {
		activate('menu'); setListState('menu', 'loading');
		try {
			const data = await post('restocommerce_vendor_menu_data');
			const list = app.querySelector('[data-rc-menu-list]');
			if (list) { list.innerHTML = menuMarkup(Array.isArray(data.products) ? data.products : []); list.tabIndex = -1; bindProductToggles(list); }
			setListState('menu'); list?.focus(); notify(event.detail?.message || 'Le plat est publié. Votre menu est maintenant à jour.', 'success');
		} catch (error) { setListState('menu', 'error'); notify(error.message || 'Le plat est publié, mais le menu ne peut pas être relu pour le moment.', 'error'); }
		});
		const guidance = config.guidance || {};
		const helpDialog = app.querySelector('[data-rc-guidance-dialog]');
		const openHelpButtons = app.querySelectorAll('[data-rc-open-help]');
		let lastGuidanceFocus = null;
		const openHelp = () => {
			if (!helpDialog) return;
			lastGuidanceFocus = document.activeElement;
			const section = app.querySelector('[data-rc-section-title]')?.textContent || 'ce cockpit';
			const context = helpDialog.querySelector('[data-rc-help-context]');
			if (context) context.textContent = `Vous êtes dans « ${section} ». Prenez une action à la fois : le statut ouvre ou met en pause le service, les commandes avancent une par une et le menu se met à jour sans rechargement.`;
			const whatsapp = helpDialog.querySelector('[data-rc-help-whatsapp]');
			if (whatsapp) { whatsapp.hidden = !guidance.supportUrl; if (guidance.supportUrl) whatsapp.href = guidance.supportUrl; }
			helpDialog.hidden = false;
			helpDialog.querySelector('[data-rc-close-help]')?.focus();
		};
		const closeHelp = () => { if (!helpDialog) return; helpDialog.hidden = true; lastGuidanceFocus?.focus?.(); };
		openHelpButtons.forEach((button) => button.addEventListener('click', openHelp));
		helpDialog?.querySelector('[data-rc-close-help]')?.addEventListener('click', closeHelp);
		helpDialog?.addEventListener('click', (event) => { if (event.target === helpDialog) closeHelp(); });

		const tour = app.querySelector('[data-rc-guidance-tour]');
		const tourSteps = [
			{ section: 'overview', target: '[data-rc-service-toggle]', title: 'Votre restaurant est ouvert ?', copy: 'Ce bouton indique aux clients si vous servez. Un toucher suffit pour mettre le service en pause ou le reprendre.' },
			{ section: 'orders', target: '[data-rc-tab="orders"]', title: 'Les commandes restent visibles.', copy: 'Retrouvez chaque commande ici et faites-la avancer au rythme de votre cuisine.' },
			{ section: 'menu', target: '[data-rc-open-product-wizard]', title: 'Ajoutez un plat simplement.', copy: 'L’assistant vous guide en petites étapes. Votre menu se met à jour sans recharger la page.' }
		];
		let tourStep = 0;
		let highlighted = null;
		const clearHighlight = () => { highlighted?.classList.remove('is-rc-tour-target'); highlighted = null; };
		const finishTour = async () => {
			try { await post('restocommerce_vendor_dismiss_guidance_tour'); clearHighlight(); tour.hidden = true; lastGuidanceFocus?.focus?.(); }
			catch (error) { notify(error.message || 'Le guide reste ouvert. Réessayez dans un instant.', 'error'); }
		};
		const renderTour = () => {
			if (!tour) return;
			const step = tourSteps[tourStep]; activate(step.section); clearHighlight();
			window.setTimeout(() => {
				const target = app.querySelector(step.target); highlighted = target; target?.classList.add('is-rc-tour-target'); target?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
			}, 80);
			tour.querySelector('[data-rc-tour-count]').textContent = `Repère ${tourStep + 1} sur ${tourSteps.length}`;
			tour.querySelector('[data-rc-tour-title]').textContent = step.title;
			tour.querySelector('[data-rc-tour-copy]').textContent = step.copy;
			tour.querySelector('[data-rc-tour-next]').textContent = tourStep === tourSteps.length - 1 ? 'Terminer le guide' : 'Continuer';
		};
		const beginTour = () => { if (!tour || guidance.tourDismissed || document.querySelector('[data-rc-vendor-onboarding][open]')) return; lastGuidanceFocus = document.activeElement; tour.hidden = false; renderTour(); };
		tour?.querySelector('[data-rc-tour-next]')?.addEventListener('click', () => { if (tourStep >= tourSteps.length - 1) finishTour(); else { tourStep += 1; renderTour(); } });
			tour?.querySelector('[data-rc-tour-skip]')?.addEventListener('click', finishTour);
			tour?.addEventListener('click', (event) => { if (event.target === tour) finishTour(); });
			window.setTimeout(beginTour, 600);

			const notificationConfig = config.notifications || {};
			const notificationDrawer = app.querySelector('[data-rc-notification-drawer]');
			const notificationTrigger = app.querySelector('[data-rc-notifications-trigger]');
			const notificationList = app.querySelector('[data-rc-notifications-list]');
			const notificationBadge = app.querySelector('[data-rc-notification-badge]');
			const notificationSound = app.querySelector('[data-rc-notification-sound]');
			const notificationVibration = app.querySelector('[data-rc-notification-vibration]');
			let knownUnreadCount = null;
			let notificationFocus = null;
			const renderNotifications = (records, unreadCount) => {
				if (notificationBadge) notificationBadge.hidden = !unreadCount;
				if (notificationList) notificationList.innerHTML = records.length ? records.map((record) => `<article class="rc-vendor-notification-item${record.isNew ? ' is-new' : ''}" data-rc-notification-id="${escapeHtml(record.id)}"><strong>${escapeHtml(record.title)}</strong><p>${escapeHtml(record.message)}</p><time>${escapeHtml(record.time || '')}</time></article>`).join('') : '<p class="rc-vendor-empty">Aucune nouvelle commande à signaler.</p>';
			};
			const playNotificationSignal = () => {
				if (notificationConfig.preferences?.vibration && navigator.vibrate) navigator.vibrate([90, 45, 90]);
				if (!notificationConfig.preferences?.sound) return;
				try { const AudioCtx = window.AudioContext || window.webkitAudioContext; const context = new AudioCtx(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 660; gain.gain.setValueAtTime(.025, context.currentTime); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .12); oscillator.addEventListener('ended', () => context.close()); } catch (_) { /* Le navigateur peut refuser un son sans geste utilisateur. */ }
			};
			const loadNotifications = async ({ announce = false } = {}) => {
				try { const data = await post('restocommerce_vendor_notifications_data'); const records = Array.isArray(data.notifications) ? data.notifications : []; const unread = Number(data.unreadCount || 0); if (knownUnreadCount !== null && unread > knownUnreadCount) { playNotificationSignal(); if ('Notification' in window && Notification.permission === 'granted') { const latest = records.find((record) => record.isNew); const browserAlert = new Notification(latest?.title || 'Nouvelle commande', { body: latest?.message || 'Une commande demande votre attention.' }); window.setTimeout(() => browserAlert.close(), 6000); } if (announce) notify('Une nouvelle commande est arrivée.', 'success'); } knownUnreadCount = unread; renderNotifications(records, unread); }
				catch (error) { if (notificationDrawer && !notificationDrawer.hidden) notify(error.message || 'Les alertes ne sont pas disponibles pour le moment.', 'error'); }
			};
			const openNotifications = async () => { if (!notificationDrawer) return; notificationFocus = document.activeElement; notificationDrawer.hidden = false; notificationTrigger?.setAttribute('aria-expanded', 'true'); notificationDrawer.querySelector('[data-rc-notifications-close]')?.focus(); await loadNotifications(); };
			const closeNotifications = () => { if (!notificationDrawer) return; notificationDrawer.hidden = true; notificationTrigger?.setAttribute('aria-expanded', 'false'); notificationFocus?.focus?.(); };
			const refreshOrderCounters = async () => { const data = await post('restocommerce_vendor_orders_summary'); const active = String(Math.max(0, Number(data.activeOrders || 0))); app.querySelectorAll('[data-rc-active-orders], [data-rc-order-count]').forEach((counter) => { counter.textContent = active; counter.hidden = active === '0'; }); const total = app.querySelector('[data-rc-total-orders]'); if (total) total.textContent = `${Number(data.totalOrders || 0)} commande${Number(data.totalOrders || 0) > 1 ? 's' : ''}`; };
			if (notificationSound) notificationSound.checked = Boolean(notificationConfig.preferences?.sound);
			if (notificationVibration) notificationVibration.checked = Boolean(notificationConfig.preferences?.vibration);
			const saveNotificationPreferences = async () => { const data = await post('restocommerce_vendor_notification_preferences', { sound: notificationSound?.checked ? 1 : 0, vibration: notificationVibration?.checked ? 1 : 0 }); notificationConfig.preferences = data.preferences || {}; };
			notificationSound?.addEventListener('change', () => saveNotificationPreferences().catch((error) => notify(error.message || 'Préférence non enregistrée.', 'error')));
			notificationVibration?.addEventListener('change', () => saveNotificationPreferences().catch((error) => notify(error.message || 'Préférence non enregistrée.', 'error')));
			notificationTrigger?.addEventListener('click', openNotifications);
			notificationDrawer?.querySelector('[data-rc-notifications-close]')?.addEventListener('click', closeNotifications);
			notificationDrawer?.querySelector('[data-rc-notifications-refresh]')?.addEventListener('click', () => loadNotifications({ announce: true }));
			notificationDrawer?.querySelector('[data-rc-notifications-read]')?.addEventListener('click', async () => { const ids = [...app.querySelectorAll('[data-rc-notification-id]')].map((node) => node.dataset.rcNotificationId).filter(Boolean); if (!ids.length) return; try { await post('restocommerce_vendor_mark_notifications_seen', { notification_ids: ids }); await loadNotifications(); } catch (error) { notify(error.message || 'Impossible de marquer les alertes.', 'error'); } });
			notificationDrawer?.querySelector('[data-rc-notification-browser]')?.addEventListener('click', async () => { if (!('Notification' in window)) return notify('Les alertes du navigateur ne sont pas prises en charge sur cet appareil.', 'error'); const permission = await Notification.requestPermission(); notify(permission === 'granted' ? 'Les alertes du navigateur sont autorisées.' : 'Les alertes du navigateur ne sont pas autorisées.', permission === 'granted' ? 'success' : 'error'); });
			const notificationWhatsapp = app.querySelector('[data-rc-notification-whatsapp]');
			const notificationSupportNote = app.querySelector('[data-rc-notification-support-note]');
			if (notificationWhatsapp) { notificationWhatsapp.hidden = !notificationConfig.supportUrl; if (notificationConfig.supportUrl) notificationWhatsapp.href = notificationConfig.supportUrl; }
			if (notificationSupportNote && !notificationConfig.supportUrl) { notificationSupportNote.hidden = false; notificationSupportNote.textContent = notificationConfig.supportUnavailableMessage || 'L’aide WhatsApp n’est pas configurée.'; }
			const reviewDrawer = app.querySelector('[data-rc-review-drawer]'); const reviewList = app.querySelector('[data-rc-reviews-list]'); const reviewSummary = app.querySelector('[data-rc-review-summary]'); const reviewTriggers = app.querySelectorAll('[data-rc-open-reviews]'); let reviewFocus = null;
			const renderReviews = (records, summary) => { if (reviewSummary) reviewSummary.textContent = Number(summary?.count || 0) ? `${summary.average}/5 · ${summary.count} avis vérifié${Number(summary.count) > 1 ? 's' : ''}` : 'Aucun avis vérifié pour le moment.'; if (reviewList) reviewList.innerHTML = records.length ? records.map((record) => `<article class="rc-vendor-review-item${record.flagged ? ' is-flagged' : ''}" data-rc-review-id="${escapeHtml(record.id)}"><strong>${'★'.repeat(Number(record.rating || 0))}${'☆'.repeat(Math.max(0, 5 - Number(record.rating || 0)))}</strong><p>${escapeHtml(record.content)}</p><time>${escapeHtml(record.date || '')}</time><button type="button" data-rc-review-flag ${record.flagged ? 'disabled' : ''}>${record.flagged ? 'Signalé pour modération' : 'Signaler pour modération'}</button></article>`).join('') : '<p class="rc-vendor-empty">Les avis vérifiés apparaîtront ici après une commande terminée.</p>'; };
			const loadReviews = async () => { try { const data = await post('restocommerce_vendor_reviews_data'); renderReviews(Array.isArray(data.records) ? data.records : [], data.summary || {}); } catch (error) { notify(error.message || 'Les avis ne sont pas disponibles pour le moment.', 'error'); } };
			const openReviews = async (event) => { if (!reviewDrawer) return; reviewFocus = event.currentTarget; reviewDrawer.hidden = false; reviewTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'true')); reviewDrawer.querySelector('[data-rc-reviews-close]')?.focus(); await loadReviews(); };
			const closeReviews = () => { if (!reviewDrawer) return; reviewDrawer.hidden = true; reviewTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false')); reviewFocus?.focus?.(); };
			reviewTriggers.forEach((trigger) => trigger.addEventListener('click', openReviews)); reviewDrawer?.querySelector('[data-rc-reviews-close]')?.addEventListener('click', closeReviews);
			if (initial === 'reviews' && reviewTriggers[0]) { activate('profile'); window.setTimeout(() => openReviews({ currentTarget: reviewTriggers[0] }), 0); } reviewDrawer?.querySelector('[data-rc-reviews-refresh]')?.addEventListener('click', loadReviews); reviewDrawer?.addEventListener('click', async (event) => { const button = event.target.closest('[data-rc-review-flag]'); if (!button) return; const item = button.closest('[data-rc-review-id]'); if (!item) return; button.disabled = true; try { const data = await post('restocommerce_vendor_flag_review', { comment_id: item.dataset.rcReviewId }); notify(data.message || 'Avis signalé pour modération.', 'success'); await loadReviews(); } catch (error) { button.disabled = false; notify(error.message || 'Signalement impossible.', 'error'); } });
			const paletteConfig = config.palettes || {}; const paletteDrawer = app.querySelector('[data-rc-palette-drawer]'); const paletteTriggers = app.querySelectorAll('[data-rc-open-palette]'); let paletteFocus = null;
			const applyPalette = (palette) => { document.body.classList.remove(...[...document.body.classList].filter((name) => name.startsWith('rc-vendor-palette-'))); document.body.classList.add(`rc-vendor-palette-${palette}`); paletteDrawer?.querySelectorAll('[data-rc-palette]').forEach((card) => card.setAttribute('aria-pressed', String(card.dataset.rcPalette === palette))); };
			const openPalette = (event) => { if (!paletteDrawer) return; paletteFocus = event.currentTarget; paletteDrawer.hidden = false; paletteDrawer.querySelector('[data-rc-palette-close]')?.focus(); };
			const closePalette = () => { if (!paletteDrawer) return; paletteDrawer.hidden = true; paletteFocus?.focus?.(); };
			paletteTriggers.forEach((trigger) => trigger.addEventListener('click', openPalette)); paletteDrawer?.querySelector('[data-rc-palette-close]')?.addEventListener('click', closePalette); paletteDrawer?.querySelectorAll('[data-rc-palette]').forEach((card) => card.addEventListener('click', async () => { const palette = card.dataset.rcPalette; if (!palette) return; card.disabled = true; try { const data = await post('restocommerce_vendor_save_palette', { palette }); paletteConfig.current = data.palette || palette; applyPalette(paletteConfig.current); const feedback = paletteDrawer.querySelector('[data-rc-palette-feedback]'); if (feedback) feedback.textContent = data.message || 'Ambiance enregistrée.'; notify(data.message || 'Ambiance enregistrée.', 'success'); } catch (error) { notify(error.message || 'Palette non enregistrée.', 'error'); } finally { card.disabled = false; } }));
			loadNotifications(); refreshOrderCounters().catch(() => {});
			window.setInterval(() => { if (!document.hidden) { loadNotifications({ announce: true }); refreshOrderCounters().catch(() => {}); } }, Math.max(15000, Number(notificationConfig.pollInterval || 45000)));
		})();
