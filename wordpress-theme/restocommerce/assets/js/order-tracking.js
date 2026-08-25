(() => {
	const tracking = document.querySelector('[data-rc-order-tracking]');
	const config = window.restocommerceOrderTracking;
	if (!tracking || !config) return;
	const orderId = tracking.dataset.orderId || '';
	const orderKey = tracking.dataset.orderKey || '';
	const nonce = tracking.dataset.nonce || '';
	const announce = tracking.querySelector('[data-rc-tracking-status]');
	let timer = null;
	let lastState = '';
	const post = async () => {
		const body = new URLSearchParams({ action: 'restocommerce_order_tracking_data', nonce, order_id: orderId, order_key: orderKey });
		const response = await fetch(config.ajaxUrl, { method: 'POST', body, credentials: 'same-origin' });
		const result = await response.json();
		if (!result.success) throw new Error(result.data?.message || 'Le suivi est momentanément indisponible.');
		return result.data;
	};
	const render = (data) => {
		(data.vendors || []).forEach((vendor) => {
			const card = tracking.querySelector(`[data-rc-tracking-vendor="${CSS.escape(String(vendor.vendorId))}"]`);
			if (!card) return;
			const list = card.querySelector('.rc-order-tracking-steps');
			if (!list) return;
			list.innerHTML = (vendor.steps || []).map((step) => `<li class="${step.active ? 'is-active' : ''} ${step.current ? 'is-current' : ''}"><i aria-hidden="true"></i><span>${String(step.label || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]))}</span>${step.current ? '<b class="screen-reader-text">Étape actuelle</b>' : ''}</li>`).join('');
		});
		const state = (data.vendors || []).map((vendor) => `${vendor.vendorId}:${vendor.state}`).join('|');
		if (state && state !== lastState && lastState && announce) announce.textContent = 'Le suivi de votre commande vient d’être actualisé.';
		lastState = state;
	};
	const refresh = async () => { if (document.hidden) return; try { render(await post()); } catch (_) { /* Une erreur transitoire ne remplace pas le dernier état fiable. */ } };
	const start = () => { if (!timer) timer = window.setInterval(refresh, 15000); };
	const stop = () => { if (timer) { window.clearInterval(timer); timer = null; } };
	document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else { refresh(); start(); } });
	refresh();
	start();
})();
