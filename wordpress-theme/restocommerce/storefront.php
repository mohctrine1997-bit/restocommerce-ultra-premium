<?php
/**
 * Direction « Le Comptoir Éditorial » : fiche restaurant avec la géométrie narrative de React,
 * alimentée par WCFM et WooCommerce sans conserver le chrome de la boutique plugin.
 */
defined( 'ABSPATH' ) || exit;

$vendor = restocommerce_current_store_vendor();
if ( ! $vendor ) { status_header( 404 ); get_template_part( 'index' ); return; }

$profile    = (array) get_user_meta( $vendor->ID, 'wcfmmp_profile_settings', true );
$store_name = $profile['store_name'] ?? $vendor->display_name;
$description = $profile['description'] ?? '';
$address    = (array) ( $profile['address'] ?? array() );
$city       = $address['city'] ?? '';
$street     = $address['street_1'] ?? '';
$cuisine    = (string) get_user_meta( $vendor->ID, 'restocommerce_cuisine', true );
$hero_title = (string) get_user_meta( $vendor->ID, 'restocommerce_hero_title', true );
$phone      = $profile['mobile'] ?? $profile['phone'] ?? '';
$banner_id  = absint( $profile['banner'] ?? $profile['list_banner'] ?? 0 );
$hours      = get_user_meta( $vendor->ID, 'restocommerce_store_hours', true );
$hours      = is_array( $hours ) ? $hours : ( is_array( $profile['store_hours'] ?? null ) ? $profile['store_hours'] : array() );
$hours_line = ! empty( $hours['open'] ) && ! empty( $hours['close'] ) ? sprintf( __( '%1$s – %2$s', 'restocommerce' ), $hours['open'], $hours['close'] ) : '';
$products   = restocommerce_vendor_products( (int) $vendor->ID );
$is_paused  = restocommerce_vendor_service_is_paused( (int) $vendor->ID );
$review_summary = function_exists( 'restocommerce_vendor_review_summary' ) ? restocommerce_vendor_review_summary( (int) $vendor->ID ) : array( 'count' => 0, 'average' => 0.0 );
$hero_attachment_id = $banner_id;
if ( ! $hero_attachment_id && $products ) { $hero_attachment_id = (int) get_post_thumbnail_id( $products[0]->get_id() ); }
$hero_image = $hero_attachment_id ? wp_get_attachment_image_url( $hero_attachment_id, 'full' ) : '';
$hero_media = $hero_attachment_id ? wp_get_attachment_image( $hero_attachment_id, 'full', false, array( 'class' => 'rc-store-hero-media', 'alt' => '', 'aria-hidden' => 'true', 'fetchpriority' => 'high', 'loading' => 'eager', 'decoding' => 'sync', 'sizes' => '100vw' ) ) : '';

$groups = array();
foreach ( $products as $menu_product ) {
	$terms = get_the_terms( $menu_product->get_id(), 'product_cat' );
	$label = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : __( 'La carte', 'restocommerce' );
	$groups[ sanitize_title( $label ) ] = $label;
}

get_header();
?>
<main class="rc-storefront">
		<section class="rc-store-hero<?php echo $is_paused ? ' rc-store-hero--paused' : ''; ?>">
			<?php echo $hero_media; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML généré exclusivement par wp_get_attachment_image(). ?>
		<div class="rc-store-hero-wash" aria-hidden="true"></div><span class="rc-store-hero-orbit" aria-hidden="true"></span>
		<div class="rc-wrap rc-store-hero-inner">
			<div class="rc-store-hero-copy">
					<p class="rc-store-open"><i aria-hidden="true"></i><?php echo esc_html( $is_paused ? __( 'Les commandes sont en pause', 'restocommerce' ) : __( 'Ouvert aujourd’hui', 'restocommerce' ) ); ?></p>
				<p class="rc-eyebrow"><?php echo esc_html( $store_name . ( $cuisine ? ' · ' . $cuisine : '' ) ); ?></p>
					<h1><?php echo esc_html( $hero_title ?: __( 'Le bon dîner commence ici.', 'restocommerce' ) ); ?></h1>
					<p class="rc-store-description"><?php echo esc_html( $description ?: __( 'Des assiettes généreuses, faites au rythme de la saison. Commandez simplement, puis échangez directement avec notre équipe.', 'restocommerce' ) ); ?></p>
					<?php if ( ! empty( $review_summary['count'] ) ) : ?><p class="rc-store-review-summary"><strong aria-label="<?php echo esc_attr( sprintf( __( 'Note moyenne %1$s sur 5', 'restocommerce' ), $review_summary['average'] ) ); ?>">★ <?php echo esc_html( number_format_i18n( (float) $review_summary['average'], 1 ) ); ?></strong><span><?php echo esc_html( sprintf( _n( '%d avis vérifié', '%d avis vérifiés', (int) $review_summary['count'], 'restocommerce' ), (int) $review_summary['count'] ) ); ?></span></p><?php endif; ?>
					<div class="rc-store-hero-actions"><?php if ( $is_paused ) : ?><span class="rc-store-hero-paused-message"><?php esc_html_e( 'La carte reste visible, mais les nouvelles commandes reprendront lorsque le restaurant sera ouvert.', 'restocommerce' ); ?></span><?php else : ?><a class="rc-store-hero-button" href="#menu"><?php esc_html_e( 'Ouvrir la carte', 'restocommerce' ); ?><span aria-hidden="true">→</span></a><span><?php esc_html_e( 'Panier rapide, confirmation sur WhatsApp.', 'restocommerce' ); ?></span><?php endif; ?></div>
			</div>
			<aside class="rc-store-hero-note"><span><?php esc_html_e( 'La maison du jour', 'restocommerce' ); ?></span><strong><?php echo esc_html( $city ?: __( 'À proximité', 'restocommerce' ) ); ?></strong><p><?php esc_html_e( 'Une carte courte, des choix simples, un échange direct avec la cuisine.', 'restocommerce' ); ?></p></aside>
		</div>
	</section>

		<section id="menu" class="rc-wrap rc-store-menu" data-rc-store-menu>
			<header><div><p class="rc-eyebrow"><?php echo esc_html( $is_paused ? __( 'Carte momentanément indisponible', 'restocommerce' ) : __( 'À la carte', 'restocommerce' ) ); ?></p><h2><?php esc_html_e( 'Le menu du comptoir.', 'restocommerce' ); ?></h2></div><p><?php echo esc_html( $is_paused ? __( 'Le restaurant ne prend pas de nouvelle commande pour le moment. Vous pouvez revenir prochainement.', 'restocommerce' ) : __( 'Choisissez un plat, ouvrez son aperçu ou composez directement ses options avant de l’ajouter au panier.', 'restocommerce' ) ); ?></p></header>
			<div class="rc-store-menu-layout">
				<aside class="rc-store-menu-nav"><button type="button" class="is-active" data-rc-menu-filter="all"><?php esc_html_e( 'Tous les plats', 'restocommerce' ); ?></button><?php foreach ( $groups as $group_slug => $group_label ) : ?><button type="button" data-rc-menu-filter="<?php echo esc_attr( $group_slug ); ?>"><?php echo esc_html( $group_label ); ?></button><?php endforeach; ?><div class="rc-store-menu-tip"><b><?php esc_html_e( 'À votre rythme.', 'restocommerce' ); ?></b><p><?php esc_html_e( 'Les options de sauce sont affichées sur chaque plat avant la commande.', 'restocommerce' ); ?></p></div></aside>
				<?php if ( $products ) : ?><div class="rc-store-menu-grid" data-rc-store-product-grid>
				<?php foreach ( $products as $menu_product ) : ?>
					<?php $terms = get_the_terms( $menu_product->get_id(), 'product_cat' ); $group = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : __( 'La carte', 'restocommerce' ); $image = wp_get_attachment_image( $menu_product->get_image_id(), 'woocommerce_single', false, array( 'alt' => '' ) ); ?>
						<article class="rc-store-menu-card<?php echo $is_paused ? ' is-unavailable' : ''; ?>" data-rc-menu-product data-rc-menu-category="<?php echo esc_attr( sanitize_title( $group ) ); ?>"><?php if ( $is_paused ) : ?><div class="rc-store-menu-image" aria-hidden="true"><?php echo $image ? wp_kses_post( $image ) : wc_placeholder_img(); ?><span><?php echo esc_html( $group ); ?></span></div><?php else : ?><button type="button" class="rc-store-menu-image" data-rc-quick-product="<?php echo esc_attr( (string) $menu_product->get_id() ); ?>"><?php echo $image ? wp_kses_post( $image ) : wc_placeholder_img(); ?><span><?php echo esc_html( $group ); ?></span></button><?php endif; ?><div class="rc-store-menu-copy"><div><p class="rc-eyebrow"><?php esc_html_e( 'Feuille du chef', 'restocommerce' ); ?></p><h3><?php echo esc_html( $menu_product->get_name() ); ?></h3></div><strong><?php echo wp_kses_post( $menu_product->get_price_html() ); ?></strong></div><p class="rc-store-menu-description"><?php echo esc_html( wp_trim_words( $menu_product->get_short_description() ?: $menu_product->get_description(), 18 ) ); ?></p><div class="rc-store-menu-actions"><?php if ( $is_paused ) : ?><span><?php esc_html_e( 'Indisponible pour le moment', 'restocommerce' ); ?></span><?php else : ?><button type="button" data-rc-quick-product="<?php echo esc_attr( (string) $menu_product->get_id() ); ?>"><?php esc_html_e( 'Voir le plat', 'restocommerce' ); ?><span aria-hidden="true">↗</span></button><a href="<?php echo esc_url( $menu_product->get_permalink() ); ?>"><?php echo esc_html( $menu_product->is_type( 'variable' ) ? __( 'Choisir mes options', 'restocommerce' ) : __( 'Ajouter au panier', 'restocommerce' ) ); ?></a><?php endif; ?></div></article>
					<?php endforeach; ?>
				</div><?php endif; ?>
				<section class="rc-ui-state rc-ui-state--loading rc-store-menu-loading" data-rc-menu-loading role="status" aria-live="polite" hidden><div><span class="rc-ui-state-mark" aria-hidden="true"><i></i><i></i><i></i></span><h3><?php esc_html_e( 'La carte arrive.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Nous préparons les plats de la maison.', 'restocommerce' ); ?></p></div></section>
				<section class="rc-ui-state rc-ui-state--error rc-store-menu-error" data-rc-menu-error role="alert" hidden><div><span class="rc-ui-state-mark" aria-hidden="true">!</span><h3><?php esc_html_e( 'La carte ne répond pas encore.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'La maison est peut-être en train de la mettre à jour.', 'restocommerce' ); ?></p><button type="button" class="rc-ui-state-action" data-rc-retry-menu><?php esc_html_e( 'Réessayer', 'restocommerce' ); ?></button></div></section>
				<section class="rc-ui-state rc-ui-state--success" data-rc-menu-success role="status" hidden><div><span class="rc-ui-state-mark" aria-hidden="true">✓</span><h3><?php esc_html_e( 'La carte est à jour.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Les plats disponibles sont prêts à être découverts.', 'restocommerce' ); ?></p><button type="button" class="rc-ui-state-action" data-rc-dismiss-menu-success><?php esc_html_e( 'Voir la carte', 'restocommerce' ); ?></button></div></section>
				<section class="rc-ui-state rc-store-menu-empty" data-rc-menu-empty<?php echo $products ? ' hidden' : ''; ?>><div><span class="rc-ui-state-mark" aria-hidden="true">⌁</span><h3><?php esc_html_e( 'Cette carte se prépare.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'La maison n’a pas encore publié de plat. Revenez bientôt ou découvrez une autre table.', 'restocommerce' ); ?></p><a class="rc-ui-state-action" href="<?php echo esc_url( home_url( '/#restaurants' ) ); ?>"><?php esc_html_e( 'Découvrir les autres tables', 'restocommerce' ); ?></a></div></section>
		</div>
	</section>

		<section id="infos" class="rc-store-info rc-store-info--after-menu"><div class="rc-wrap rc-store-info-grid"><article><b><?php esc_html_e( 'Adresse', 'restocommerce' ); ?></b><p><?php echo esc_html( trim( $street . ( $city ? ', ' . $city : '' ) ) ?: __( 'Adresse communiquée après commande', 'restocommerce' ) ); ?></p></article><article><b><?php esc_html_e( 'Cuisine', 'restocommerce' ); ?></b><p><?php echo esc_html( $cuisine ?: __( 'Carte du restaurant', 'restocommerce' ) ); ?></p></article><?php if ( $hours_line ) : ?><article><b><?php esc_html_e( 'Horaires', 'restocommerce' ); ?></b><p><?php echo esc_html( $hours_line ); ?></p></article><?php endif; ?><article><b><?php esc_html_e( 'Commande', 'restocommerce' ); ?></b><p><?php esc_html_e( 'Ajoutez vos plats, puis finalisez avec le restaurant.', 'restocommerce' ); ?></p></article><?php if ( $phone ) : ?><a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>" class="rc-store-contact"><?php esc_html_e( 'Contacter la maison', 'restocommerce' ); ?><span aria-hidden="true">↗</span></a><?php endif; ?></div></section>
	<section class="rc-wrap rc-store-closing"><div><p class="rc-eyebrow"><?php esc_html_e( 'Retrait ou livraison', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'Votre table préférée, prête à emporter.', 'restocommerce' ); ?></h2></div><button type="button" data-rc-open-cart><?php esc_html_e( 'Préparer ma commande', 'restocommerce' ); ?><span aria-hidden="true">→</span></button></section>
</main>
<?php get_footer();
