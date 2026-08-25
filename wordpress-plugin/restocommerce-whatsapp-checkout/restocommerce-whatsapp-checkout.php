<?php
/**
 * Plugin Name: RestoCommerce WhatsApp Checkout
 * Description: Ajoute un moyen de commande WhatsApp à WooCommerce. À maintenir comme extension séparée du thème.
 * Version: 0.1.3
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Text Domain: restocommerce-whatsapp
 */

defined( 'ABSPATH' ) || exit;

function restocommerce_register_whatsapp_status() : void {
	register_post_status(
		'wc-whatsapp-pending',
		array(
			'label'                     => _x( 'En attente WhatsApp', 'Order status', 'restocommerce-whatsapp' ),
			'public'                    => true,
			'exclude_from_search'       => false,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			'label_count'               => _n_noop( 'En attente WhatsApp <span class="count">(%s)</span>', 'En attente WhatsApp <span class="count">(%s)</span>', 'restocommerce-whatsapp' ),
		)
	);
}
add_action( 'init', 'restocommerce_register_whatsapp_status' );

function restocommerce_add_whatsapp_status( array $statuses ) : array {
	$statuses['wc-whatsapp-pending'] = _x( 'En attente WhatsApp', 'Order status', 'restocommerce-whatsapp' );
	return $statuses;
}
add_filter( 'wc_order_statuses', 'restocommerce_add_whatsapp_status' );

function restocommerce_register_whatsapp_gateway( array $gateways ) : array {
	$gateways[] = 'RestoCommerce_WhatsApp_Gateway';
	return $gateways;
}

function restocommerce_load_whatsapp_gateway() : void {
	if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
		return;
	}

	class RestoCommerce_WhatsApp_Gateway extends WC_Payment_Gateway {
		public function __construct() {
			$this->id                 = 'restocommerce_whatsapp';
			$this->method_title       = __( 'Commande WhatsApp', 'restocommerce-whatsapp' );
			$this->method_description = __( 'Crée une commande WooCommerce puis ouvre WhatsApp avec un récapitulatif.', 'restocommerce-whatsapp' );
			$this->has_fields         = false;
			$this->supports           = array( 'products' );
			$this->init_form_fields();
			$this->init_settings();
			$this->title       = $this->get_option( 'title', __( 'Finaliser sur WhatsApp', 'restocommerce-whatsapp' ) );
			$this->description = $this->get_option( 'description', __( 'Votre commande sera envoyée au restaurant dans WhatsApp.', 'restocommerce-whatsapp' ) );
			$this->enabled     = $this->get_option( 'enabled', 'no' );
			add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		}

		public function init_form_fields() : void {
			$this->form_fields = array(
				'enabled' => array( 'title' => __( 'Activer', 'restocommerce-whatsapp' ), 'type' => 'checkbox', 'label' => __( 'Activer la finalisation WhatsApp', 'restocommerce-whatsapp' ), 'default' => 'no' ),
				'title' => array( 'title' => __( 'Titre', 'restocommerce-whatsapp' ), 'type' => 'text', 'default' => __( 'Finaliser sur WhatsApp', 'restocommerce-whatsapp' ) ),
				'description' => array( 'title' => __( 'Description', 'restocommerce-whatsapp' ), 'type' => 'textarea', 'default' => __( 'Votre commande sera envoyée au restaurant dans WhatsApp.', 'restocommerce-whatsapp' ) ),
				'whatsapp_number' => array( 'title' => __( 'Numéro WhatsApp', 'restocommerce-whatsapp' ), 'type' => 'text', 'description' => __( 'Format international sans le signe +, par exemple 33612345678.', 'restocommerce-whatsapp' ), 'default' => '' ),
			);
		}

		public function process_payment( $order_id ) : array {
			$order = wc_get_order( $order_id );
			if ( ! $order ) {
				return array( 'result' => 'failure' );
			}
			$order->update_status( 'whatsapp-pending', __( 'Commande à confirmer dans WhatsApp.', 'restocommerce-whatsapp' ) );
			wc_reduce_stock_levels( $order_id );
			WC()->cart->empty_cart();
			return array( 'result' => 'success', 'redirect' => $this->get_return_url( $order ) );
		}
	}

	add_filter( 'woocommerce_payment_gateways', 'restocommerce_register_whatsapp_gateway' );
}
add_action( 'plugins_loaded', 'restocommerce_load_whatsapp_gateway', 20 );

function restocommerce_whatsapp_default_number() : string {
	$settings = (array) get_option( 'woocommerce_restocommerce_whatsapp_settings', array() );
	return preg_replace( '/[^0-9]/', '', (string) ( $settings['whatsapp_number'] ?? '' ) );
}

function restocommerce_vendor_whatsapp_number( int $vendor_id ) : string {
	$profile = $vendor_id ? (array) get_user_meta( $vendor_id, 'wcfmmp_profile_settings', true ) : array();
	$candidates = array(
		$profile['whatsapp_number'] ?? '',
		$profile['mobile'] ?? '',
		$profile['phone'] ?? '',
		$vendor_id ? get_user_meta( $vendor_id, 'restocommerce_whatsapp_number', true ) : '',
		restocommerce_whatsapp_default_number(),
	);

	foreach ( $candidates as $candidate ) {
		$sanitized = preg_replace( '/[^0-9]/', '', (string) $candidate );
		if ( $sanitized ) {
			return $sanitized;
		}
	}

	return '';
}

function restocommerce_vendor_whatsapp_support_url( int $vendor_id, string $message ) : string {
	$number = restocommerce_vendor_whatsapp_number( $vendor_id );
	return $number ? 'https://wa.me/' . rawurlencode( $number ) . '?text=' . rawurlencode( $message ) : '';
}

function restocommerce_order_whatsapp_number( WC_Order $order ) : string {
	$number = restocommerce_whatsapp_default_number();
	/**
	 * WCFM/Dokan : retourner ici le numéro du restaurant propriétaire de la sous-commande.
	 * Le filtre évite de coupler ce plugin à un seul marketplace.
	 */
	$number = apply_filters( 'restocommerce_order_whatsapp_number', $number, $order );
	return preg_replace( '/[^0-9]/', '', $number );
}

/**
 * Direction « Le Comptoir Éditorial » : privilégier le contact direct du restaurateur propriétaire du produit.
 */
function restocommerce_wcfm_whatsapp_number( string $number, WC_Order $order ) : string {
	if ( ! function_exists( 'wcfm_get_vendor_id_by_post' ) ) {
		return $number;
	}

	foreach ( $order->get_items() as $item ) {
		$vendor_id = (int) wcfm_get_vendor_id_by_post( $item->get_product_id() );
		if ( ! $vendor_id ) {
			continue;
		}

		$vendor_number = restocommerce_vendor_whatsapp_number( $vendor_id );
		if ( $vendor_number ) {
			return $vendor_number;
		}
	}

	return $number;
}
add_filter( 'restocommerce_order_whatsapp_number', 'restocommerce_wcfm_whatsapp_number', 20, 2 );

function restocommerce_whatsapp_message( WC_Order $order ) : string {
	$lines = array( sprintf( __( 'Bonjour, je souhaite confirmer la commande %s :', 'restocommerce-whatsapp' ), $order->get_order_number() ) );
	foreach ( $order->get_items() as $item ) {
		$lines[] = sprintf( '• %d × %s', $item->get_quantity(), $item->get_name() );
	}
	$lines[] = '';
	$formatted_total = html_entity_decode( wp_strip_all_tags( $order->get_formatted_order_total() ), ENT_QUOTES | ENT_HTML5, get_bloginfo( 'charset' ) ?: 'UTF-8' );
	$formatted_total = preg_replace( '/\\s+/u', ' ', trim( $formatted_total ) );
	$lines[] = sprintf( __( 'Total : %s', 'restocommerce-whatsapp' ), $formatted_total );
	$lines[] = sprintf( __( 'Client : %s %s', 'restocommerce-whatsapp' ), $order->get_billing_first_name(), $order->get_billing_last_name() );
	$lines[] = sprintf( __( 'Téléphone : %s', 'restocommerce-whatsapp' ), $order->get_billing_phone() );
	return implode( "\n", $lines );
}

function restocommerce_render_whatsapp_cta( $order_id ) : void {
	$order = wc_get_order( $order_id );
	if ( ! $order || 'restocommerce_whatsapp' !== $order->get_payment_method() ) {
		return;
	}
	$number = restocommerce_order_whatsapp_number( $order );
	if ( ! $number ) {
		wc_print_notice( __( 'Le numéro WhatsApp du restaurant doit être configuré avant de pouvoir confirmer la commande.', 'restocommerce-whatsapp' ), 'notice' );
		return;
	}
	$url = 'https://wa.me/' . rawurlencode( $number ) . '?text=' . rawurlencode( restocommerce_whatsapp_message( $order ) );
	printf( '<p><a class="button alt" href="%1$s" target="_blank" rel="noopener noreferrer">%2$s</a></p>', esc_attr( $url ), esc_html__( 'Confirmer la commande sur WhatsApp', 'restocommerce-whatsapp' ) );
}
add_action( 'woocommerce_thankyou_restocommerce_whatsapp', 'restocommerce_render_whatsapp_cta' );
