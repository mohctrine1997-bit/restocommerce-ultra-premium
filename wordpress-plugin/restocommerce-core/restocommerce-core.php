<?php
/**
 * Plugin Name: RestoCommerce Core
 * Description: Logique métier durable de RestoCommerce : onboarding vendeur, profil éditorial et contrôles d’autorisation.
 * Version: 0.1.2
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Text Domain: restocommerce-core
 */

defined( 'ABSPATH' ) || exit;

function restocommerce_core_vendor_guard() : int {
	check_ajax_referer( 'restocommerce_vendor_dashboard', 'nonce' );
	if ( ! is_user_logged_in() || ! function_exists( 'wcfm_is_vendor' ) || ! wcfm_is_vendor() ) {
		wp_send_json_error( array( 'message' => __( 'Cette action est réservée au restaurateur connecté.', 'restocommerce-core' ) ), 403 );
	}
	return get_current_user_id();
}

function restocommerce_core_store_url( int $vendor_id ) : string {
	$vendor = get_userdata( $vendor_id );
	if ( ! $vendor instanceof WP_User ) {
		return home_url( '/' );
	}
	if ( function_exists( 'restocommerce_store_url_for_vendor' ) ) {
		return restocommerce_store_url_for_vendor( $vendor );
	}
	return home_url( '/restaurant/' . rawurlencode( $vendor->user_nicename ?: $vendor->user_login ) . '/' );
}

function restocommerce_vendor_has_published_product( int $vendor_id ) : bool {
	return $vendor_id > 0 && ! empty( get_posts( array( 'post_type' => 'product', 'post_status' => 'publish', 'author' => $vendor_id, 'posts_per_page' => 1, 'fields' => 'ids' ) ) );
}

function restocommerce_core_sanitize_timezone( string $timezone ) : string {
	$timezone = sanitize_text_field( $timezone );
	if ( in_array( $timezone, timezone_identifiers_list(), true ) ) { return $timezone; }
	$site_timezone = function_exists( 'wp_timezone_string' ) ? wp_timezone_string() : '';
	return in_array( $site_timezone, timezone_identifiers_list(), true ) ? $site_timezone : 'Africa/Casablanca';
}

function restocommerce_core_sanitize_phone( $phone ) : string {
	return trim( preg_replace( '/[^0-9+()\-\s]/', '', sanitize_text_field( (string) $phone ) ) );
}

function restocommerce_core_valid_phone( string $phone ) : bool {
	if ( '' === $phone ) { return true; }
	$digits = preg_replace( '/\D+/', '', $phone );
	return strlen( $digits ) >= 8 && strlen( $digits ) <= 15;
}

function restocommerce_vendor_onboarding_default_values( int $vendor_id ) : array {
	$profile = (array) get_user_meta( $vendor_id, 'wcfmmp_profile_settings', true );
	$address = isset( $profile['address'] ) && is_array( $profile['address'] ) ? $profile['address'] : array();
	$hours   = get_user_meta( $vendor_id, 'restocommerce_store_hours', true );
	if ( ! is_array( $hours ) ) {
		$hours = is_array( $profile['store_hours'] ?? null ) ? $profile['store_hours'] : array();
	}
	return array(
		'storeName' => sanitize_text_field( (string) ( $profile['store_name'] ?? get_user_meta( $vendor_id, 'store_name', true ) ?? '' ) ),
		'cuisine'   => sanitize_text_field( (string) get_user_meta( $vendor_id, 'restocommerce_cuisine', true ) ),
		'description' => sanitize_textarea_field( (string) ( $profile['description'] ?? get_user_meta( $vendor_id, 'restocommerce_store_description', true ) ?? '' ) ),
		'city'      => sanitize_text_field( (string) ( $address['city'] ?? '' ) ),
		'street'    => sanitize_text_field( (string) ( $address['street_1'] ?? '' ) ),
		'phone'     => sanitize_text_field( (string) ( $profile['mobile'] ?? $profile['phone'] ?? get_user_meta( $vendor_id, 'restocommerce_store_phone', true ) ?? '' ) ),
		'coverId'   => absint( $profile['list_banner'] ?? $profile['banner'] ?? 0 ),
		'timezone'  => restocommerce_core_sanitize_timezone( (string) get_user_meta( $vendor_id, 'restocommerce_store_timezone', true ) ),
		'hours'     => array(
			'open'  => sanitize_text_field( (string) ( $hours['open'] ?? '11:30' ) ),
			'close' => sanitize_text_field( (string) ( $hours['close'] ?? '22:30' ) ),
		),
	);
}

function restocommerce_vendor_onboarding_state( int $vendor_id ) : array {
	$defaults = array( 'version' => 1, 'status' => 'draft', 'step' => 1, 'values' => restocommerce_vendor_onboarding_default_values( $vendor_id ), 'updatedAt' => 0 );
	$stored   = get_user_meta( $vendor_id, 'restocommerce_vendor_onboarding', true );
	$state    = is_array( $stored ) ? wp_parse_args( $stored, $defaults ) : $defaults;
	$state['values'] = wp_parse_args( is_array( $state['values'] ?? null ) ? $state['values'] : array(), $defaults['values'] );
	$state['values']['hours'] = wp_parse_args( is_array( $state['values']['hours'] ?? null ) ? $state['values']['hours'] : array(), $defaults['values']['hours'] );
	$state['step'] = min( 6, max( 1, absint( $state['step'] ?? 1 ) ) );
	$state['completed'] = 'yes' === get_user_meta( $vendor_id, 'restocommerce_onboarding_completed', true ) || 'complete' === $state['status'];
	$state['hasFirstProduct'] = restocommerce_vendor_has_published_product( $vendor_id );
	$state['coverUrl'] = ! empty( $state['values']['coverId'] ) ? (string) wp_get_attachment_image_url( absint( $state['values']['coverId'] ), 'medium_large' ) : '';
	$state['shouldAutoOpen'] = ! $state['completed'] && ( empty( $state['values']['storeName'] ) || empty( $state['values']['cuisine'] ) || empty( $state['values']['city'] ) || empty( $state['values']['coverId'] ) || ! $state['hasFirstProduct'] );
	$state['storeUrl'] = restocommerce_core_store_url( $vendor_id );
	return $state;
}

function restocommerce_vendor_onboarding_store_state( int $vendor_id, array $state ) : array {
	$state['version'] = 1;
	$state['updatedAt'] = current_time( 'timestamp' );
	update_user_meta( $vendor_id, 'restocommerce_vendor_onboarding', $state );
	return restocommerce_vendor_onboarding_state( $vendor_id );
}

function restocommerce_vendor_onboarding_sanitize_time( $value, string $fallback ) : string {
	$value = sanitize_text_field( (string) $value );
	return preg_match( '/^(?:[01]?[0-9]|2[0-3]):[0-5][0-9]$/', $value ) ? $value : $fallback;
}

function restocommerce_core_valid_hours( array $hours ) : bool {
	return ! empty( $hours['open'] ) && ! empty( $hours['close'] ) && $hours['open'] < $hours['close'];
}

function restocommerce_core_upload_cover( int $vendor_id, string $store_name ) {
	if ( empty( $_FILES['cover'] ) || ! is_array( $_FILES['cover'] ) || UPLOAD_ERR_OK !== (int) ( $_FILES['cover']['error'] ?? UPLOAD_ERR_NO_FILE ) ) {
		return new WP_Error( 'restocommerce_cover_upload', __( 'La photo n’a pas pu être reçue. Réessayez avec une image PNG, JPEG ou WebP.', 'restocommerce-core' ) );
	}
	if ( empty( $_FILES['cover']['size'] ) || (int) $_FILES['cover']['size'] > 5 * MB_IN_BYTES ) {
		return new WP_Error( 'restocommerce_cover_size', __( 'Choisissez une image de couverture de 5 Mo maximum.', 'restocommerce-core' ) );
	}
	$allowed_mimes = array( 'jpg|jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
	$checked = wp_check_filetype_and_ext( (string) $_FILES['cover']['tmp_name'], (string) $_FILES['cover']['name'], $allowed_mimes );
	if ( empty( $checked['type'] ) || ! in_array( $checked['type'], $allowed_mimes, true ) || ! @getimagesize( (string) $_FILES['cover']['tmp_name'] ) ) {
		return new WP_Error( 'restocommerce_cover_type', __( 'Choisissez une image PNG, JPEG ou WebP valide.', 'restocommerce-core' ) );
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	$cover_id = media_handle_upload( 'cover', 0, array(), array( 'test_form' => false, 'mimes' => array( 'jpg|jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' ) ) );
	if ( ! is_wp_error( $cover_id ) ) {
		update_post_meta( $cover_id, '_wp_attachment_image_alt', sanitize_text_field( $store_name ? $store_name . ' – couverture' : __( 'Couverture du restaurant', 'restocommerce-core' ) ) );
	}
	return $cover_id;
}

function restocommerce_ajax_vendor_onboarding_data() : void {
	wp_send_json_success( array( 'state' => restocommerce_vendor_onboarding_state( restocommerce_core_vendor_guard() ) ) );
}
add_action( 'wp_ajax_restocommerce_vendor_onboarding_data', 'restocommerce_ajax_vendor_onboarding_data' );

function restocommerce_ajax_vendor_save_onboarding() : void {
	$vendor_id = restocommerce_core_vendor_guard();
	$state = restocommerce_vendor_onboarding_state( $vendor_id );
	if ( $state['completed'] ) {
		wp_send_json_error( array( 'message' => __( 'Votre restaurant est déjà publié. Ouvrez son profil pour le modifier.', 'restocommerce-core' ) ), 409 );
	}
	$values = $state['values'];
	if ( isset( $_POST['store_name'] ) ) { $values['storeName'] = sanitize_text_field( wp_unslash( $_POST['store_name'] ) ); }
	if ( isset( $_POST['cuisine'] ) ) { $values['cuisine'] = sanitize_text_field( wp_unslash( $_POST['cuisine'] ) ); }
	if ( isset( $_POST['description'] ) ) { $values['description'] = sanitize_textarea_field( wp_unslash( $_POST['description'] ) ); }
	if ( isset( $_POST['city'] ) ) { $values['city'] = sanitize_text_field( wp_unslash( $_POST['city'] ) ); }
	if ( isset( $_POST['street'] ) ) { $values['street'] = sanitize_text_field( wp_unslash( $_POST['street'] ) ); }
	if ( isset( $_POST['phone'] ) ) { $values['phone'] = restocommerce_core_sanitize_phone( wp_unslash( $_POST['phone'] ) ); }
	if ( isset( $_POST['timezone'] ) ) { $values['timezone'] = restocommerce_core_sanitize_timezone( wp_unslash( $_POST['timezone'] ) ); }
	if ( isset( $_POST['open_time'] ) ) { $values['hours']['open'] = restocommerce_vendor_onboarding_sanitize_time( wp_unslash( $_POST['open_time'] ), '11:30' ); }
	if ( isset( $_POST['close_time'] ) ) { $values['hours']['close'] = restocommerce_vendor_onboarding_sanitize_time( wp_unslash( $_POST['close_time'] ), '22:30' ); }
	if ( ! empty( $_FILES['cover']['name'] ) ) {
		$cover_id = restocommerce_core_upload_cover( $vendor_id, $values['storeName'] );
		if ( is_wp_error( $cover_id ) ) { wp_send_json_error( array( 'message' => $cover_id->get_error_message() ), 422 ); }
		$values['coverId'] = (int) $cover_id;
	}
	if ( ! restocommerce_core_valid_phone( (string) $values['phone'] ) ) { wp_send_json_error( array( 'message' => __( 'Indiquez un numéro de téléphone valide ou laissez ce champ vide.', 'restocommerce-core' ) ), 422 ); }
	$next_step = min( 6, max( 1, absint( $_POST['step'] ?? $state['step'] ) ) );
	if ( $next_step >= 2 && ( empty( $values['storeName'] ) || empty( $values['cuisine'] ) ) ) { wp_send_json_error( array( 'message' => __( 'Indiquez le nom et la cuisine principale de votre restaurant.', 'restocommerce-core' ) ), 422 ); }
	if ( $next_step >= 3 && empty( $values['city'] ) ) { wp_send_json_error( array( 'message' => __( 'Indiquez au moins votre quartier ou votre ville.', 'restocommerce-core' ) ), 422 ); }
	if ( $next_step >= 4 && empty( $values['coverId'] ) ) { wp_send_json_error( array( 'message' => __( 'Ajoutez une couverture pour que les clients reconnaissent votre restaurant.', 'restocommerce-core' ) ), 422 ); }
	if ( $next_step >= 5 && ! restocommerce_core_valid_hours( $values['hours'] ) ) { wp_send_json_error( array( 'message' => __( 'Indiquez des horaires d’ouverture cohérents avant de continuer.', 'restocommerce-core' ) ), 422 ); }
	$state['values'] = $values;
	$state['step'] = $next_step;
	$state['status'] = 'draft';
	wp_send_json_success( array( 'state' => restocommerce_vendor_onboarding_store_state( $vendor_id, $state ), 'message' => __( 'Votre avancée est enregistrée.', 'restocommerce-core' ) ) );
}
add_action( 'wp_ajax_restocommerce_vendor_save_onboarding', 'restocommerce_ajax_vendor_save_onboarding' );

function restocommerce_ajax_vendor_complete_onboarding() : void {
	$vendor_id = restocommerce_core_vendor_guard();
	$state = restocommerce_vendor_onboarding_state( $vendor_id );
	$values = $state['values'];
	if ( empty( $values['storeName'] ) || empty( $values['cuisine'] ) || empty( $values['city'] ) || empty( $values['coverId'] ) || ! restocommerce_core_valid_hours( $values['hours'] ) ) {
		wp_send_json_error( array( 'message' => __( 'Reprenez les étapes précédentes : il manque une information importante.', 'restocommerce-core' ) ), 422 );
	}
	if ( ! restocommerce_vendor_has_published_product( $vendor_id ) ) {
		wp_send_json_error( array( 'message' => __( 'Ajoutez votre premier plat avant de publier votre restaurant.', 'restocommerce-core' ) ), 422 );
	}
	if ( ! metadata_exists( 'user', $vendor_id, 'restocommerce_onboarding_backup' ) ) {
		$backup = array();
		foreach ( array( 'wcfmmp_profile_settings', 'store_name', 'restocommerce_cuisine', 'restocommerce_store_description', 'restocommerce_store_phone', 'restocommerce_store_timezone', 'restocommerce_store_hours', 'restocommerce_onboarding_completed', 'restocommerce_vendor_onboarding' ) as $key ) {
			$backup[ $key ] = array( 'exists' => metadata_exists( 'user', $vendor_id, $key ), 'value' => get_user_meta( $vendor_id, $key, true ) );
		}
		update_user_meta( $vendor_id, 'restocommerce_onboarding_backup', $backup );
	}
	$profile = (array) get_user_meta( $vendor_id, 'wcfmmp_profile_settings', true );
	$address = isset( $profile['address'] ) && is_array( $profile['address'] ) ? $profile['address'] : array();
	$address['city'] = $values['city'];
	$address['street_1'] = $values['street'];
	$profile['store_name'] = $values['storeName'];
	$profile['description'] = $values['description'];
	$profile['mobile'] = $values['phone'];
	$profile['address'] = $address;
	$profile['banner'] = absint( $values['coverId'] );
	$profile['list_banner'] = absint( $values['coverId'] );
	$profile['store_hours'] = $values['hours'];
	update_user_meta( $vendor_id, 'wcfmmp_profile_settings', $profile );
	update_user_meta( $vendor_id, 'store_name', $values['storeName'] );
	update_user_meta( $vendor_id, 'restocommerce_cuisine', $values['cuisine'] );
	update_user_meta( $vendor_id, 'restocommerce_store_description', $values['description'] );
	update_user_meta( $vendor_id, 'restocommerce_store_phone', $values['phone'] );
	update_user_meta( $vendor_id, 'restocommerce_store_timezone', restocommerce_core_sanitize_timezone( (string) $values['timezone'] ) );
	update_user_meta( $vendor_id, 'restocommerce_store_hours', $values['hours'] );
	update_user_meta( $vendor_id, 'restocommerce_onboarding_completed', 'yes' );
	$state['status'] = 'complete';
	$state['step'] = 6;
	$state = restocommerce_vendor_onboarding_store_state( $vendor_id, $state );
	if ( has_action( 'litespeed_purge_url' ) ) {
		do_action( 'litespeed_purge_url', home_url( '/' ) );
		do_action( 'litespeed_purge_url', restocommerce_core_store_url( $vendor_id ) );
	}
	wp_send_json_success( array( 'state' => $state, 'storeUrl' => restocommerce_core_store_url( $vendor_id ), 'message' => __( 'Votre restaurant est publié. Les clients peuvent maintenant le découvrir.', 'restocommerce-core' ) ) );
}
add_action( 'wp_ajax_restocommerce_vendor_complete_onboarding', 'restocommerce_ajax_vendor_complete_onboarding' );

function restocommerce_ajax_vendor_restore_onboarding_backup() : void {
	restocommerce_core_vendor_guard();
	wp_send_json_error( array( 'message' => __( 'La restauration automatique est désactivée pour préserver les données existantes. Contactez le support avant toute modification de profil.', 'restocommerce-core' ) ), 409 );
}
add_action( 'wp_ajax_restocommerce_vendor_restore_onboarding_backup', 'restocommerce_ajax_vendor_restore_onboarding_backup' );

function restocommerce_ajax_vendor_reset_incomplete_onboarding() : void {
	restocommerce_core_vendor_guard();
	wp_send_json_error( array( 'message' => __( 'La réinitialisation est désactivée pour préserver les données existantes. Contactez le support avant toute modification de profil.', 'restocommerce-core' ) ), 409 );
}
add_action( 'wp_ajax_restocommerce_vendor_reset_incomplete_onboarding', 'restocommerce_ajax_vendor_reset_incomplete_onboarding' );
