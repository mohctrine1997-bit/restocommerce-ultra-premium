/* Direction « Le Comptoir Éditorial » : retour vérifié, une action calme et explicite, sans créer de contenu fictif. */
(() => {
	const config = window.restocommerceReview;
	if (!config) return;
	document.querySelectorAll('[data-rc-vendor-review]').forEach((form) => form.addEventListener('submit', async (event) => {
		event.preventDefault(); const button = form.querySelector('button[type="submit"]'); const feedback = form.querySelector('[data-rc-review-feedback]');
		button.disabled = true; button.setAttribute('aria-busy', 'true'); if (feedback) feedback.textContent = 'Publication de votre avis…';
		try { const body = new FormData(form); body.append('action', 'restocommerce_submit_vendor_review'); body.append('nonce', config.nonce); const response = await fetch(config.ajaxUrl, { method: 'POST', body, credentials: 'same-origin' }); const result = await response.json(); if (!result.success) throw new Error(result.data?.message || 'Votre avis ne peut pas être publié pour le moment.'); if (feedback) feedback.textContent = result.data?.message || 'Merci pour votre retour.'; form.querySelectorAll('input, textarea, button').forEach((field) => field.disabled = true); }
		catch (error) { if (feedback) feedback.textContent = error.message; button.disabled = false; button.removeAttribute('aria-busy'); }
	}));
})();
