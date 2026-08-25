<?php
/**
 * Direction « Le Comptoir Éditorial » : fiche plat concentrée, optionnable et reliée à sa maison.
 */
defined( 'ABSPATH' ) || exit;
global $product;
$product = $product instanceof WC_Product ? $product : wc_get_product( get_queried_object_id() );
if ( ! $product instanceof WC_Product ) { get_header(); get_template_part( 'index' ); get_footer(); return; }
$vendor       = get_userdata( (int) get_post_field( 'post_author', $product->get_id() ) );
$store_url    = $vendor ? restocommerce_store_url_for_vendor( $vendor ) : home_url( '/' );
$store_name   = $vendor ? ( (array) get_user_meta( $vendor->ID, 'wcfmmp_profile_settings', true ) )['store_name'] ?? $vendor->display_name : get_bloginfo( 'name' );
$terms        = get_the_terms( $product->get_id(), 'product_cat' );
$category     = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : __( 'À la carte', 'restocommerce' );
$other_items  = $vendor ? array_slice( restocommerce_vendor_products( (int) $vendor->ID, $product->get_id() ), 0, 3 ) : array();
get_header();
?>
<main class="rc-product-page"><div class="rc-wrap rc-product-breadcrumb"><a href="<?php echo esc_url( $store_url ); ?>"><?php echo esc_html( $store_name ); ?></a><span aria-hidden="true">/</span><span><?php echo esc_html( $category ); ?></span></div><section class="rc-wrap rc-product-hero"><div class="rc-product-media"><?php echo wp_kses_post( wp_get_attachment_image( $product->get_image_id(), 'woocommerce_single', false, array( 'alt' => '' ) ) ?: wc_placeholder_img() ); ?><span><?php echo esc_html( $category ); ?></span></div><div class="rc-product-summary"><p class="rc-eyebrow"><?php esc_html_e( 'À la carte', 'restocommerce' ); ?></p><h1><?php echo esc_html( $product->get_name() ); ?></h1><div class="rc-product-price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div><p class="rc-product-description"><?php echo esc_html( $product->get_short_description() ?: $product->get_description() ); ?></p><div class="rc-product-options"><p><?php esc_html_e( 'Personnalisez votre commande', 'restocommerce' ); ?></p><?php echo restocommerce_render_product_configurator( $product, 'inline' ); ?></div><div class="rc-product-from"><span><?php esc_html_e( 'Préparé par', 'restocommerce' ); ?></span><a href="<?php echo esc_url( $store_url ); ?>"><?php echo esc_html( $store_name ); ?><i aria-hidden="true">↗</i></a></div></div></section><?php if ( $other_items ) : ?><section class="rc-wrap rc-product-more"><div><p class="rc-eyebrow"><?php esc_html_e( 'Sur la même table', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'Continuez votre sélection.', 'restocommerce' ); ?></h2></div><div class="rc-product-more-grid"><?php foreach ( $other_items as $item ) : ?><a href="<?php echo esc_url( $item->get_permalink() ); ?>"><span><?php echo wp_kses_post( wp_get_attachment_image( $item->get_image_id(), 'woocommerce_thumbnail', false, array( 'alt' => '' ) ) ?: wc_placeholder_img() ); ?></span><b><?php echo esc_html( $item->get_name() ); ?></b><small><?php echo wp_kses_post( $item->get_price_html() ); ?></small></a><?php endforeach; ?></div></section><?php endif; ?></main>
<?php get_footer();
