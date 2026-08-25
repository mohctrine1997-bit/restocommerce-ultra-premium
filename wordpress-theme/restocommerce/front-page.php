<?php
/**
 * Direction « Le Comptoir Éditorial » : marketplace curatée et dynamique.
 * Les restaurants restent issus de WCFM ; le filtre est client-side et ne coûte aucune requête supplémentaire.
 */
defined( 'ABSPATH' ) || exit;
get_header();

$restaurants = apply_filters( 'restocommerce_marketplace_restaurants', array() );
$cuisines    = array();
foreach ( $restaurants as $restaurant ) {
	if ( ! empty( $restaurant['cuisine'] ) ) {
		$cuisines[ sanitize_title( $restaurant['cuisine'] ) ] = $restaurant['cuisine'];
	}
}
$featured_restaurants = array_slice( array_values( array_filter( $restaurants, static fn( $restaurant ) => ! empty( $restaurant['open'] ) ) ), 0, 3 );
$cities               = array();
foreach ( $restaurants as $restaurant ) {
	if ( ! empty( $restaurant['area'] ) ) {
		$cities[ sanitize_title( $restaurant['area'] ) ] = $restaurant['area'];
	}
}
?>
<section class="rc-marketplace-hero">
	<span class="rc-orbit rc-orbit-top" aria-hidden="true"></span><span class="rc-orbit rc-orbit-bottom" aria-hidden="true"></span>
	<div class="rc-wrap rc-marketplace-hero-grid">
		<div class="rc-marketplace-hero-copy">
			<p class="rc-eyebrow"><?php esc_html_e( 'Votre quartier, à votre table', 'restocommerce' ); ?></p>
			<h1><?php esc_html_e( 'Ce soir, le quartier vous régale.', 'restocommerce' ); ?></h1>
			<p class="rc-intro"><?php esc_html_e( 'Découvrez des restaurants indépendants, leur carte et leur disponibilité. Une commande directe, avec une confirmation humaine quand cela compte.', 'restocommerce' ); ?></p>
			<div class="rc-hero-proof"><span class="rc-hero-thumb" aria-hidden="true"><?php if ( has_post_thumbnail() ) { the_post_thumbnail( 'medium_large', array( 'fetchpriority' => 'high', 'alt' => '' ) ); } ?></span><span><b><?php esc_html_e( 'Une sélection prête à savourer', 'restocommerce' ); ?></b><small><?php esc_html_e( 'De la première envie à la bonne adresse.', 'restocommerce' ); ?></small></span></div>
		</div>
		<aside class="rc-promise-card"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Zm7 12 .8 3.2L23 19l-3.2.8L19 23l-.8-3.2L15 19l3.2-.8L19 15Z"/></svg><p><?php esc_html_e( 'Pas un annuaire. Une sélection locale.', 'restocommerce' ); ?></p><span class="rc-service-trace" aria-hidden="true"></span></aside>
	</div>
</section>

<section id="restaurants" class="rc-wrap rc-marketplace-list" data-rc-marketplace>
	<header class="rc-marketplace-heading">
		<div><p class="rc-eyebrow"><?php esc_html_e( 'À proximité', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'Choisissez votre table.', 'restocommerce' ); ?></h2></div>
		<label class="rc-search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.4-4.4m2.1-5.1a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z"/></svg><input type="search" data-rc-search placeholder="<?php esc_attr_e( 'Une cuisine, un restaurant, une ville…', 'restocommerce' ); ?>" aria-label="<?php esc_attr_e( 'Rechercher un restaurant', 'restocommerce' ); ?>"><button type="button" data-rc-clear-search aria-label="<?php esc_attr_e( 'Effacer la recherche', 'restocommerce' ); ?>" hidden>×</button></label>
	</header>
	<div class="rc-filter-bar" aria-label="<?php esc_attr_e( 'Filtres restaurants', 'restocommerce' ); ?>"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10m-7 5h4"/></svg><?php esc_html_e( 'Filtres', 'restocommerce' ); ?></span><button type="button" class="is-active" data-rc-cuisine="all"><?php esc_html_e( 'Toutes', 'restocommerce' ); ?></button><?php foreach ( $cuisines as $cuisine_slug => $cuisine ) : ?><button type="button" data-rc-cuisine="<?php echo esc_attr( $cuisine_slug ); ?>"><?php echo esc_html( $cuisine ); ?></button><?php endforeach; ?><button type="button" data-rc-open-only><i aria-hidden="true"></i><?php esc_html_e( 'Ouverts maintenant', 'restocommerce' ); ?></button></div>
		<div class="rc-results-meta"><p data-rc-result-count><b><?php echo esc_html( count( $restaurants ) ); ?></b> <?php esc_html_e( 'restaurants dans la sélection', 'restocommerce' ); ?></p><span class="rc-service-trace" aria-hidden="true"></span></div>
		<section class="rc-ui-state rc-ui-state--loading" data-rc-marketplace-loading role="status" aria-live="polite" hidden><div><span class="rc-ui-state-mark" aria-hidden="true"><i></i><i></i><i></i></span><h3><?php esc_html_e( 'Nous préparons les bonnes adresses.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Un instant, la sélection arrive.', 'restocommerce' ); ?></p></div></section>
		<section class="rc-ui-state rc-ui-state--error" data-rc-marketplace-error role="alert" hidden><div><span class="rc-ui-state-mark" aria-hidden="true">!</span><h3><?php esc_html_e( 'La sélection ne répond pas encore.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Votre recherche est conservée. Essayez à nouveau dans un instant.', 'restocommerce' ); ?></p><button type="button" class="rc-ui-state-action" data-rc-retry-marketplace><?php esc_html_e( 'Réessayer', 'restocommerce' ); ?></button></div></section>
		<section class="rc-ui-state rc-ui-state--success" data-rc-marketplace-success role="status" hidden><div><span class="rc-ui-state-mark" aria-hidden="true">✓</span><h3><?php esc_html_e( 'Votre sélection est prête.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Les tables correspondent à vos choix. Vous pouvez continuer à explorer.', 'restocommerce' ); ?></p><button type="button" class="rc-ui-state-action" data-rc-dismiss-marketplace-success><?php esc_html_e( 'Voir les tables', 'restocommerce' ); ?></button></div></section>
		<?php if ( $restaurants ) : ?>
		<div class="rc-restaurant-grid" data-rc-restaurant-grid>
			<?php foreach ( $restaurants as $index => $restaurant ) : ?>
				<?php
				$name        = $restaurant['name'] ?? '';
				$url         = $restaurant['url'] ?? '';
				$cuisine     = $restaurant['cuisine'] ?? __( 'Restaurant indépendant', 'restocommerce' );
				$area        = $restaurant['area'] ?? __( 'À proximité', 'restocommerce' );
				$image       = $restaurant['image'] ?? '';
				$open        = ! empty( $restaurant['open'] );
$description = sprintf( __( 'Découvrez la carte et les spécialités de %s.', 'restocommerce' ), $name );
					$vendor_id  = absint( $restaurant['vendor_id'] ?? 0 );
					$review_summary = $vendor_id && function_exists( 'restocommerce_vendor_review_summary' ) ? restocommerce_vendor_review_summary( $vendor_id ) : array( 'count' => 0, 'average' => 0.0 );
					$prep        = 20 + ( (int) $index % 3 ) * 5;
				?>
				<article class="rc-restaurant-card" data-rc-restaurant data-cuisine="<?php echo esc_attr( sanitize_title( $cuisine ) ); ?>" data-open="<?php echo $open ? 'true' : 'false'; ?>" data-search="<?php echo esc_attr( strtolower( $name . ' ' . $cuisine . ' ' . $area . ' ' . $description ) ); ?>">
					<a href="<?php echo esc_url( $url ); ?>" class="rc-restaurant-image" aria-label="<?php echo esc_attr( sprintf( __( 'Voir %s', 'restocommerce' ), $name ) ); ?>"><?php if ( $image ) : ?><img src="<?php echo esc_url( $image ); ?>" alt="" loading="lazy"><?php endif; ?><span class="rc-image-wash" aria-hidden="true"></span><span class="rc-restaurant-status <?php echo $open ? 'is-open' : 'is-closed'; ?>"><?php echo esc_html( $open ? __( 'Ouvert', 'restocommerce' ) : __( 'Ouvre demain', 'restocommerce' ) ); ?></span><span class="rc-restaurant-area"><?php echo esc_html( $area ); ?></span></a>
					<div class="rc-restaurant-copy"><div class="rc-restaurant-title-row"><div><p class="rc-eyebrow"><?php echo esc_html( $cuisine ); ?></p><h3><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $name ); ?></a></h3></div><a class="rc-card-arrow" href="<?php echo esc_url( $url ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Voir %s', 'restocommerce' ), $name ) ); ?>">→</a></div><p class="rc-card-description"><?php echo esc_html( $description ); ?></p><?php if ( ! empty( $review_summary['count'] ) ) : ?><p class="rc-card-review"><strong aria-label="<?php echo esc_attr( sprintf( __( 'Note moyenne %1$s sur 5', 'restocommerce' ), $review_summary['average'] ) ); ?>">★ <?php echo esc_html( number_format_i18n( (float) $review_summary['average'], 1 ) ); ?></strong><span><?php echo esc_html( sprintf( _n( '%d avis vérifié', '%d avis vérifiés', (int) $review_summary['count'], 'restocommerce' ), (int) $review_summary['count'] ) ); ?></span></p><?php endif; ?><p class="rc-prep-time"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg><?php echo esc_html( sprintf( __( 'Préparation estimée : %d–%d min', 'restocommerce' ), $prep, $prep + 10 ) ); ?></p></div>
				</article>
			<?php endforeach; ?>
		</div>
			<section class="rc-ui-state rc-marketplace-empty" data-rc-empty hidden><div><span class="rc-ui-state-mark" aria-hidden="true">⌁</span><h3><?php esc_html_e( 'Aucune table dans cette envie.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Essayez une autre cuisine ou revenez à toute la sélection.', 'restocommerce' ); ?></p><button type="button" class="rc-ui-state-action" data-rc-reset-search><?php esc_html_e( 'Voir toutes les tables', 'restocommerce' ); ?></button></div></section>
		<?php else : ?>
			<section class="rc-ui-state rc-marketplace-empty"><div><span class="rc-ui-state-mark" aria-hidden="true">⌁</span><h3><?php esc_html_e( 'Les tables arrivent bientôt.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Les restaurants publiés apparaîtront ici dès que leur fiche sera prête.', 'restocommerce' ); ?></p><a class="rc-ui-state-action" href="#comment-ca-marche"><?php esc_html_e( 'Comprendre le service', 'restocommerce' ); ?></a></div></section>
		<?php endif; ?>
	</section>

	<?php if ( $featured_restaurants ) : ?>
		<section class="rc-home-editors-choice">
			<div class="rc-wrap">
				<div class="rc-home-section-heading"><div><p class="rc-eyebrow"><?php esc_html_e( 'À commander ce soir', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'Trois tables, trois façons de se régaler.', 'restocommerce' ); ?></h2></div><p><?php esc_html_e( 'Des cartes disponibles maintenant, sélectionnées depuis les restaurants publiés de la marketplace.', 'restocommerce' ); ?></p></div>
				<div class="rc-home-editors-grid">
					<?php foreach ( $featured_restaurants as $feature_index => $restaurant ) : ?>
						<article class="rc-home-editor-card rc-home-editor-card-<?php echo esc_attr( (string) ( $feature_index + 1 ) ); ?>">
							<a href="<?php echo esc_url( $restaurant['url'] ?? '#' ); ?>" class="rc-home-editor-image" aria-label="<?php echo esc_attr( sprintf( __( 'Voir %s', 'restocommerce' ), $restaurant['name'] ?? '' ) ); ?>"><?php if ( ! empty( $restaurant['image'] ) ) : ?><img src="<?php echo esc_url( $restaurant['image'] ); ?>" alt="" loading="lazy"><?php endif; ?><span><?php echo esc_html( $restaurant['area'] ?? __( 'À proximité', 'restocommerce' ) ); ?></span></a>
							<div><p class="rc-eyebrow"><?php echo esc_html( $restaurant['cuisine'] ?? __( 'Restaurant indépendant', 'restocommerce' ) ); ?></p><h3><?php echo esc_html( $restaurant['name'] ?? '' ); ?></h3><a href="<?php echo esc_url( $restaurant['url'] ?? '#' ); ?>" class="rc-text-action"><?php esc_html_e( 'Découvrir la carte', 'restocommerce' ); ?><i aria-hidden="true">→</i></a></div>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php if ( $cities ) : ?>
		<section class="rc-home-city-guide"><div class="rc-wrap rc-home-city-guide-inner"><div><p class="rc-eyebrow"><?php esc_html_e( 'Explorer par ville', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'Le goût du quartier, partout où vous êtes.', 'restocommerce' ); ?></h2></div><div class="rc-home-city-list"><?php foreach ( $cities as $city ) : ?><a href="#restaurants" data-rc-city-filter="<?php echo esc_attr( strtolower( $city ) ); ?>"><span><?php echo esc_html( $city ); ?></span><i aria-hidden="true">↗</i></a><?php endforeach; ?></div></div></section>
	<?php endif; ?>

	<section class="rc-home-assurances"><div class="rc-wrap rc-home-assurances-grid"><div class="rc-home-assurances-lead"><p class="rc-eyebrow"><?php esc_html_e( 'Pensé pour commander sans friction', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'Du menu au message, sans quitter votre envie.', 'restocommerce' ); ?></h2><span class="rc-service-trace" aria-hidden="true"></span></div><article><b>01</b><h3><?php esc_html_e( 'Menus en direct', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Chaque restaurant garde sa carte, ses options et ses disponibilités à jour dans son espace dédié.', 'restocommerce' ); ?></p></article><article><b>02</b><h3><?php esc_html_e( 'Vos choix sont visibles', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Les sauces et variations s’ouvrent avant l’ajout au panier, pour commander sans ambiguïté.', 'restocommerce' ); ?></p></article><article><b>03</b><h3><?php esc_html_e( 'Une confirmation humaine', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Le récapitulatif part sur WhatsApp vers le restaurant concerné, avec les détails de votre commande.', 'restocommerce' ); ?></p></article></div></section>
	<section id="comment-ca-marche" class="rc-how-it-works"><div class="rc-wrap rc-how-it-works-grid"><div><p class="rc-eyebrow"><?php esc_html_e( 'En trois temps', 'restocommerce' ); ?></p><h2><?php esc_html_e( 'De la bonne adresse à la bonne commande.', 'restocommerce' ); ?></h2><span class="rc-service-trace" aria-hidden="true"></span></div><div class="rc-steps"><article><b>01</b><h3><?php esc_html_e( 'Choisissez', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Une maison selon votre envie, son menu et sa disponibilité.', 'restocommerce' ); ?></p></article><article><b>02</b><h3><?php esc_html_e( 'Composez', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Ajoutez vos plats et ajustez les options depuis le menu.', 'restocommerce' ); ?></p></article><article><b>03</b><h3><?php esc_html_e( 'Confirmez', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Le restaurant reçoit un récapitulatif clair sur WhatsApp.', 'restocommerce' ); ?></p></article></div></div></section>
<?php get_footer();
