<?php
/**
 * Template Name: Fiche restaurant RestoCommerce
 * Direction « Le Comptoir Éditorial » : la marketplace dirige vers une carte restaurant lisible et commandable.
 */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<section class="rc-hero">
	<div class="rc-wrap rc-hero-content">
		<p class="rc-eyebrow"><?php esc_html_e( 'Restaurant partenaire', 'restocommerce' ); ?></p>
		<h1><?php the_title(); ?></h1>
		<?php if ( has_excerpt() ) : ?><p class="rc-intro"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
		<?php if ( class_exists( 'WooCommerce' ) ) : ?><a class="rc-button" href="#menu"><?php esc_html_e( 'Ouvrir la carte', 'restocommerce' ); ?></a><?php endif; ?>
	</div>
</section>
<section id="menu" class="rc-wrap rc-menu-sequence">
	<?php while ( have_posts() ) : the_post(); ?>
		<div class="entry-content"><?php the_content(); ?></div>
	<?php endwhile; ?>
</section>
<?php get_footer();
