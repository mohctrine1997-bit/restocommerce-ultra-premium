<?php
/**
 * Direction « Le Comptoir Éditorial » : pont de données minimal entre WCFM et la marketplace RestoCommerce.
 *
 * Plugin Name: RestoCommerce WCFM Bridge
 * Description: Expose les restaurants WCFM publiés à la home page RestoCommerce sans dépendance front-end lourde.
 * Version: 0.1.3
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Text Domain: restocommerce-wcfm-bridge
 */

defined( 'ABSPATH' ) || exit;

function restocommerce_wcfm_bridge_media_url( $value ) : string {
	if ( is_numeric( $value ) ) {
		$url = wp_get_attachment_image_url( (int) $value, 'large' );
		return $url ? $url : '';
	}

	return is_string( $value ) ? esc_url_raw( $value ) : '';
}

function restocommerce_wcfm_bridge_restaurants( array $restaurants ) : array {
	if ( ! empty( $restaurants ) || ! function_exists( 'wcfmmp_get_store' ) ) {
		return $restaurants;
	}

	$vendors = get_users(
		array(
			'role__in' => array( 'wcfm_vendor', 'vendor' ),
			'orderby'  => 'registered',
			'order'    => 'ASC',
		)
	);

	foreach ( $vendors as $vendor ) {
		$store    = wcfmmp_get_store( $vendor->ID );
		$settings = (array) get_user_meta( $vendor->ID, 'wcfmmp_profile_settings', true );

		if ( ! $store ) {
			continue;
		}

		if ( method_exists( $store, 'is_store_visible' ) && ! $store->is_store_visible() ) {
			continue;
		}

			$name = method_exists( $store, 'get_shop_name' ) ? $store->get_shop_name() : $vendor->display_name;
			$url  = home_url( '/restaurant/' . rawurlencode( $vendor->user_nicename ?: $vendor->user_login ) . '/' );

		$address = isset( $settings['address'] ) && is_array( $settings['address'] ) ? $settings['address'] : array();
		$area    = isset( $address['city'] ) ? (string) $address['city'] : '';
		$cuisine = (string) get_user_meta( $vendor->ID, 'restocommerce_cuisine', true );
		$image   = restocommerce_wcfm_bridge_media_url( $settings['list_banner'] ?? $settings['banner'] ?? '' );

		$restaurants[] = array(
'vendor_id' => (int) $vendor->ID,
				'name'    => $name,
				'url'     => $url,
			'cuisine' => $cuisine ? $cuisine : __( 'Restaurant indépendant', 'restocommerce-wcfm-bridge' ),
			'area'    => $area ? $area : __( 'À proximité', 'restocommerce-wcfm-bridge' ),
			'image'   => $image,
			'open'    => true,
		);
	}

	return $restaurants;
}
add_filter( 'restocommerce_marketplace_restaurants', 'restocommerce_wcfm_bridge_restaurants', 20 );

/**
 * Purge uniquement les URL concernées lorsqu’un profil restaurateur évolue.
 * L’action LiteSpeed est absente sans LiteSpeed Cache, ce qui garde ce pont portable.
 */
function restocommerce_wcfm_bridge_purge_marketplace_cache( int $user_id ) : void {
	$user = get_userdata( $user_id );

	if ( ! $user || ! array_intersect( array( 'wcfm_vendor', 'vendor' ), (array) $user->roles ) ) {
		return;
	}

	if ( did_action( 'litespeed_purge_url' ) || has_action( 'litespeed_purge_url' ) ) {
		do_action( 'litespeed_purge_url', home_url( '/' ) );

		do_action( 'litespeed_purge_url', home_url( '/restaurant/' . rawurlencode( $user->user_nicename ?: $user->user_login ) . '/' ) );
	}
}

function restocommerce_wcfm_bridge_purge_on_profile_update( int $meta_id, int $user_id, string $meta_key ) : void {
	if ( 'wcfmmp_profile_settings' === $meta_key || 'restocommerce_cuisine' === $meta_key ) {
		restocommerce_wcfm_bridge_purge_marketplace_cache( $user_id );
	}
}

add_action( 'user_register', 'restocommerce_wcfm_bridge_purge_marketplace_cache', 20 );
add_action( 'updated_user_meta', 'restocommerce_wcfm_bridge_purge_on_profile_update', 20, 3 );
