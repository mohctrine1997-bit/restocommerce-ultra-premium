<?php
/** Direction « Le Comptoir Éditorial » : l’impasse devient une sortie claire, calme et immédiatement actionnable. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main class="rc-page-content rc-page-not-found">
	<section class="rc-ui-state rc-ui-state--error"><div><span class="rc-ui-state-mark" aria-hidden="true">↗</span><p class="rc-eyebrow"><?php esc_html_e( 'Page introuvable', 'restocommerce' ); ?></p><h1><?php esc_html_e( 'Cette table a changé de place.', 'restocommerce' ); ?></h1><p><?php esc_html_e( 'Revenez à la sélection pour retrouver les restaurants ouverts et leurs cartes.', 'restocommerce' ); ?></p><a class="rc-ui-state-action" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Retour aux restaurants', 'restocommerce' ); ?></a></div></section>
</main>
<?php get_footer();
