<?php
/** Direction « Le Comptoir Éditorial » : contenu WordPress sémantique, lisible et sans mise en page inutile. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
	<main class="rc-page-content">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
			<article <?php post_class(); ?>><p class="rc-eyebrow"><?php esc_html_e( 'RestoCommerce', 'restocommerce' ); ?></p><h1><?php the_title(); ?></h1><div class="entry-content"><?php the_content(); ?></div></article>
		<?php endwhile; else : ?>
			<section class="rc-ui-state rc-page-empty"><div><span class="rc-ui-state-mark" aria-hidden="true">⌁</span><h3><?php esc_html_e( 'Cette page se prépare.', 'restocommerce' ); ?></h3><p><?php esc_html_e( 'Retrouvez les restaurants et leurs menus depuis la sélection principale.', 'restocommerce' ); ?></p><a class="rc-ui-state-action" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Retour à la sélection', 'restocommerce' ); ?></a></div></section>
		<?php endif; ?>
	</main>
<?php get_footer();
