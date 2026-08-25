<?php
/**
 * Enveloppe WooCommerce : les archives publiques sont traitées par RestoCommerce;
 * les autres écrans conservent le cycle WooCommerce natif.
 */
defined( 'ABSPATH' ) || exit;

if ( function_exists( 'is_shop' ) && is_shop() ) {
	require get_template_directory() . '/archive-product.php';
	return;
}

get_header();
?>
<section class="rc-wrap rc-shop-content">
	<?php woocommerce_content(); ?>
</section>
<?php get_footer();
