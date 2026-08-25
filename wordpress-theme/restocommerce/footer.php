<?php
/** Direction « Le Comptoir Éditorial » : un tiroir panier rapide préserve la continuité de découverte. */
defined( 'ABSPATH' ) || exit;
?></main>
<?php if ( class_exists( 'WooCommerce' ) ) : ?>
	<div class="rc-cart-layer" data-rc-cart-layer hidden></div>
		<aside class="rc-cart-drawer" data-rc-cart-drawer aria-hidden="true" inert aria-label="<?php esc_attr_e( 'Votre panier', 'restocommerce' ); ?>">
			<header class="rc-cart-drawer-header"><span class="rc-cart-drawer-mark" aria-hidden="true">⌁</span><span class="rc-cart-drawer-heading"><strong><?php esc_html_e( 'Votre comptoir', 'restocommerce' ); ?></strong><small data-rc-cart-summary><?php echo esc_html( restocommerce_cart_summary() ); ?></small></span><button type="button" class="rc-icon-button" data-rc-close-cart aria-label="<?php esc_attr_e( 'Fermer le panier', 'restocommerce' ); ?>">×</button></header>
			<div class="rc-cart-drawer-body" data-rc-mini-cart><?php echo restocommerce_render_cart_drawer(); ?></div>
	</aside>
	<dialog class="rc-quick-view" data-rc-quick-view aria-label="<?php esc_attr_e( 'Aperçu du plat', 'restocommerce' ); ?>"><button type="button" class="rc-icon-button" data-rc-close-quick-view aria-label="<?php esc_attr_e( 'Fermer', 'restocommerce' ); ?>">×</button><div data-rc-quick-view-content></div></dialog>
	<?php endif; ?>
	<div class="rc-feedback-stack" data-rc-feedback-stack aria-live="polite" aria-atomic="true"></div>
	<footer class="rc-site-footer">
	<div class="rc-wrap rc-footer-inner"><span>RestoCommerce — <?php esc_html_e( 'Des restaurants indépendants, une expérience cohérente.', 'restocommerce' ); ?></span><span><?php esc_html_e( 'Commande directe avec confirmation WhatsApp.', 'restocommerce' ); ?></span></div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
