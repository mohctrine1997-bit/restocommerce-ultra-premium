<?php
/**
 * Direction « Le Comptoir Éditorial » : une navigation de 76 px, éditoriale,
 * stable et immédiatement reconnaissable, transposée de la référence React.
 */
defined( 'ABSPATH' ) || exit;
$rc_store_vendor  = function_exists( 'restocommerce_current_store_vendor' ) ? restocommerce_current_store_vendor() : null;
if ( ! $rc_store_vendor && function_exists( 'is_product' ) && is_product() ) {
	$rc_product_author = (int) get_post_field( 'post_author', get_queried_object_id() );
	$rc_store_vendor  = $rc_product_author ? get_user_by( 'id', $rc_product_author ) : null;
}
$rc_store_context = $rc_store_vendor instanceof WP_User;
$rc_store_profile = $rc_store_context ? (array) get_user_meta( $rc_store_vendor->ID, 'wcfmmp_profile_settings', true ) : array();
$rc_brand_name    = $rc_store_context ? ( $rc_store_profile['store_name'] ?? $rc_store_vendor->display_name ) : 'RestoCommerce';
$rc_brand_tagline = $rc_store_context ? __( 'Restaurant partenaire', 'restocommerce' ) : __( 'Les tables du quartier', 'restocommerce' );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="rc-site-header<?php echo $rc_store_context ? ' rc-site-header--store' : ''; ?>">
	<div class="rc-wrap rc-header-inner">
		<a class="rc-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php esc_attr_e( 'RestoCommerce, accueil', 'restocommerce' ); ?>">
			<span class="rc-brand-mark" aria-hidden="true">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<span class="rc-brand-fallback">C</span>
				<?php endif; ?>
			</span>
				<span class="rc-brand-copy"><strong><?php echo esc_html( $rc_brand_name ); ?></strong><small><?php echo esc_html( $rc_brand_tagline ); ?></small></span>
			</a>
			<nav class="rc-primary-nav" aria-label="<?php esc_attr_e( 'Navigation principale', 'restocommerce' ); ?>">
				<?php if ( $rc_store_context ) : ?>
					<a href="<?php echo esc_url( home_url( '/#restaurants' ) ); ?>"><?php esc_html_e( 'Tous les restaurants', 'restocommerce' ); ?></a>
					<a href="#menu"><?php esc_html_e( 'Le menu', 'restocommerce' ); ?></a>
					<a href="#infos"><?php esc_html_e( 'Le restaurant', 'restocommerce' ); ?></a>
				<?php else : ?>
					<a href="<?php echo esc_url( home_url( '/#restaurants' ) ); ?>"><?php esc_html_e( 'Explorer', 'restocommerce' ); ?></a>
					<a href="<?php echo esc_url( home_url( '/#comment-ca-marche' ) ); ?>"><?php esc_html_e( 'Comment ça marche', 'restocommerce' ); ?></a>
				<?php endif; ?>
				<?php if ( function_exists( 'wcfm_is_vendor' ) ) : ?><a href="<?php echo esc_url( home_url( '/store-manager/' ) ); ?>"><?php esc_html_e( 'Espace restaurateur', 'restocommerce' ); ?></a><?php endif; ?>
			</nav>
			<div class="rc-header-actions">
				<?php if ( ! $rc_store_context ) : ?><span class="rc-location-pill" aria-label="<?php esc_attr_e( 'Marketplace Maroc', 'restocommerce' ); ?>"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Zm0-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg> Maroc</span><?php endif; ?>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?>
					<button class="<?php echo $rc_store_context ? 'rc-cart-button' : 'rc-cart-medallion'; ?>" type="button" data-rc-open-cart aria-label="<?php esc_attr_e( 'Ouvrir le panier', 'restocommerce' ); ?>">
						<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L20 8H7M10 20.2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>
						<span class="rc-cart-button-label"><?php esc_html_e( 'Mon panier', 'restocommerce' ); ?></span>
						<span data-rc-cart-count><?php echo esc_html( restocommerce_cart_count() ); ?></span>
				</button>
			<?php endif; ?>
		</div>
	</div>
</header>
<main id="content" class="rc-site-content">
