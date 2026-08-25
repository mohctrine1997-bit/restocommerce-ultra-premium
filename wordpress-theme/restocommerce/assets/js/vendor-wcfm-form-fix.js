/* Direction « Le Comptoir Éditorial » : les formulaires WCFM restent utilisables ; un champ masqué ne bloque jamais une action de cuisine. */
(() => {
  const syncHiddenStockRequirement = () => {
    document.querySelectorAll('#stock_qty, [name="stock_qty"]').forEach((stock) => {
      if (stock.offsetParent === null) {
        stock.required = false;
        stock.disabled = true;
      }
    });
    const form = document.querySelector('#wcfm_products_manage_form');
    if (form instanceof HTMLFormElement) form.noValidate = true;
    document.querySelectorAll('#wcfm_products_simple_submit_button, #wcfm_products_manage_submit_button').forEach((button) => { button.formNoValidate = true; });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncHiddenStockRequirement, { once: true });
  else syncHiddenStockRequirement();
  document.addEventListener('change', syncHiddenStockRequirement);
  document.addEventListener('submit', syncHiddenStockRequirement, true);
  document.addEventListener('click', syncHiddenStockRequirement, true);
  new MutationObserver(syncHiddenStockRequirement).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['required', 'style', 'class'] });
})();
