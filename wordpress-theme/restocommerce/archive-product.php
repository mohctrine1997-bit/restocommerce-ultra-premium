<?php
/**
 * Archive produits publique : coque RestoCommerce, boucle WooCommerce native.
 * WCFM reste la source vendeur, mais son archive technique ne s’affiche pas ici.
 */
defined( 'ABSPATH' ) || exit;

get_header( 'shop' );
?>
<section class="rc-shop-archive-hero">
	<div class="rc-wrap rc-shop-archive-hero-inner">
		<div>
			<p class="rc-eyebrow"><?php esc_html_e( 'La carte du quartier', 'restocommerce' ); ?></p>
			<h1><?php esc_html_e( 'Des plats choisis pour votre table.', 'restocommerce' ); ?></h1>
			<p class="rc-intro"><?php esc_html_e( 'Parcourez les cartes de nos restaurants partenaires et composez votre commande à votre rythme.', 'restocommerce' ); ?></p>
		</div>
		<a class="rc-text-action" href="<?php echo esc_url( home_url( '/' ) ); ?>#restaurants"><?php esc_html_e( 'Explorer les restaurants', 'restocommerce' ); ?><i aria-hidden="true">→</i></a>
	</div>
</section>
<section class="rc-wrap rc-shop-archive" aria-labelledby="rc-shop-title">
	<header class="rc-shop-heading">
		<div><p class="rc-eyebrow"><?php esc_html_e( 'Tous les plats', 'restocommerce' ); ?></p><h2 id="rc-shop-title"><?php esc_html_e( 'Choisissez ce qui vous ressemble.', 'restocommerce' ); ?></h2></div>
		<p class="rc-shop-heading-note"><?php esc_html_e( 'Chaque fiche indique le restaurant partenaire et les options disponibles.', 'restocommerce' ); ?></p>
	</header>
	<div class="rc-shop-toolbar">
		<?php do_action( 'woocommerce_before_shop_loop' ); ?>
	</div>
	<?php if ( woocommerce_product_loop() ) : ?>
		<?php woocommerce_product_loop_start(); ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<?php wc_get_template_part( 'content', 'product' ); ?>
		<?php endwhile; ?>
		<?php woocommerce_product_loop_end(); ?>
		<?php do_action( 'woocommerce_after_shop_loop' ); ?>
	<?php else : ?>
		<?php do_action( 'woocommerce_no_products_found' ); ?>
	<?php endif; ?>
</section>
<?php get_footer( 'shop' );
