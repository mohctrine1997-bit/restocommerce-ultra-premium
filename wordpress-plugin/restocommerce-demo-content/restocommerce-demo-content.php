<?php
/**
 * Plugin Name: RestoCommerce Demo Content
 * Description: Génère une démonstration réversible de restaurants, menus WooCommerce et options de sauces pour RestoCommerce.
 * Version: 0.1.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Text Domain: restocommerce-demo-content
 */

defined( 'ABSPATH' ) || exit;

/**
 * Catalogue fictif de démonstration. Aucun avis ni note client n’est généré.
 */
function restocommerce_demo_catalog() : array {
	return array(
		'safran-medina' => array(
			'name' => 'Le Safran de la Médina', 'email' => 'safran-demo@restocommerce.test', 'cuisine' => 'Marocain contemporain', 'city' => 'Marrakech', 'image' => 'demo-safran-medina',
			'description' => 'Cuisine marocaine de saison, généreuse et contemporaine.',
			'products' => array(
				array( 'name' => 'Tajine poulet citron confit', 'price' => '89', 'sauces' => array( 'Chermoula', 'Harissa douce', 'Zaalouk' ) ),
				array( 'name' => 'Kefta fumée', 'price' => '82', 'sauces' => array( 'Harissa douce', 'Chermoula' ) ),
				array( 'name' => 'Pastilla végétale', 'price' => '76', 'sauces' => array( 'Zaalouk', 'Chermoula' ) ),
			),
		),
		'smash-atelier' => array(
			'name' => 'Smash Atelier', 'email' => 'smash-demo@restocommerce.test', 'cuisine' => 'Burgers artisanaux', 'city' => 'Casablanca', 'image' => 'demo-smash-atelier',
			'description' => 'Smash burgers, potatoes croustillantes et sauces maison.',
			'products' => array(
				array( 'name' => 'Smash signature', 'price' => '69', 'sauces' => array( 'Maison', 'Barbecue fumé', 'Algérienne' ) ),
				array( 'name' => 'Chicken crispy', 'price' => '65', 'sauces' => array( 'Cheddar', 'Maison', 'Barbecue fumé' ) ),
				array( 'name' => 'Loaded fries', 'price' => '42', 'sauces' => array( 'Cheddar', 'Algérienne' ) ),
			),
		),
		'casa-napoli' => array(
			'name' => 'Casa Napoli', 'email' => 'napoli-demo@restocommerce.test', 'cuisine' => 'Pizza napolitaine', 'city' => 'Rabat', 'image' => 'demo-casa-napoli',
			'description' => 'Pizzas à longue fermentation, produits italiens et feu vif.',
			'products' => array(
				array( 'name' => 'Margherita', 'price' => '72', 'sauces' => array( 'Basilic', 'Huile pimentée', 'Parmesan' ) ),
				array( 'name' => 'Diavola', 'price' => '84', 'sauces' => array( 'Huile pimentée', 'Parmesan' ) ),
				array( 'name' => 'Burrata verde', 'price' => '96', 'sauces' => array( 'Basilic', 'Huile pimentée' ) ),
			),
		),
		'tokyo-bento' => array(
			'name' => 'Tokyo Bento', 'email' => 'tokyo-demo@restocommerce.test', 'cuisine' => 'Japonais', 'city' => 'Casablanca', 'image' => 'demo-tokyo-bento',
			'description' => 'Bentos japonais, bowls frais et sauces soignées.',
			'products' => array(
				array( 'name' => 'Chicken katsu curry', 'price' => '88', 'sauces' => array( 'Curry doux', 'Spicy mayo', 'Teriyaki' ) ),
				array( 'name' => 'Salmon poké', 'price' => '94', 'sauces' => array( 'Ponzu', 'Spicy mayo', 'Teriyaki' ) ),
				array( 'name' => 'Gyozas grillés', 'price' => '48', 'sauces' => array( 'Ponzu', 'Teriyaki' ) ),
			),
		),
		'levant-table' => array(
			'name' => 'Levant Table', 'email' => 'levant-demo@restocommerce.test', 'cuisine' => 'Levantin', 'city' => 'Rabat', 'image' => 'demo-levant-table',
			'description' => 'Mezze, shawarmas et grillades inspirés du Levant.',
			'products' => array(
				array( 'name' => 'Shawarma poulet', 'price' => '62', 'sauces' => array( 'Toum', 'Tahini', 'Amba' ) ),
				array( 'name' => 'Falafel bowl', 'price' => '65', 'sauces' => array( 'Tahini', 'Harissa', 'Amba' ) ),
				array( 'name' => 'Kafta grillée', 'price' => '78', 'sauces' => array( 'Toum', 'Harissa', 'Tahini' ) ),
			),
		),
		'brunch-bloom' => array(
			'name' => 'Brunch & Bloom', 'email' => 'brunch-demo@restocommerce.test', 'cuisine' => 'Brunch & café', 'city' => 'Marrakech', 'image' => 'demo-brunch-bloom',
			'description' => 'Le matin tard, le café très bon et les assiettes fleuries.',
			'products' => array(
				array( 'name' => 'Avocado toast', 'price' => '58', 'sauces' => array( 'Pesto', 'Hollandaise', 'Miel épicé' ) ),
				array( 'name' => 'Pancakes fleur d’oranger', 'price' => '54', 'sauces' => array( 'Miel épicé', 'Caramel salé' ) ),
				array( 'name' => 'Œufs shakshuka', 'price' => '64', 'sauces' => array( 'Pesto', 'Hollandaise' ) ),
			),
		),
		'pasta-fresca' => array(
			'name' => 'Pasta Fresca', 'email' => 'pasta-demo@restocommerce.test', 'cuisine' => 'Italien frais', 'city' => 'Rabat', 'image' => 'demo-pasta-fresca',
			'description' => 'Pâtes fraîches, sauces lentes et assiettes sans détour.',
			'products' => array(
				array( 'name' => 'Tagliatelle truffe', 'price' => '98', 'sauces' => array( 'Parmesan', 'Pesto', 'Huile pimentée' ) ),
				array( 'name' => 'Rigatoni arrabbiata', 'price' => '74', 'sauces' => array( 'Huile pimentée', 'Parmesan' ) ),
				array( 'name' => 'Lasagne maison', 'price' => '82', 'sauces' => array( 'Pesto', 'Parmesan' ) ),
			),
		),
		'ocean-grill' => array(
			'name' => 'Ocean & Grill', 'email' => 'ocean-demo@restocommerce.test', 'cuisine' => 'Poisson & grillades', 'city' => 'Agadir', 'image' => 'demo-ocean-grill',
			'description' => 'Poissons du jour, braise douce et condiments citronnés.',
			'products' => array(
				array( 'name' => 'Dorade grillée', 'price' => '112', 'sauces' => array( 'Citron-herbes', 'Aïoli fumé', 'Tartare' ) ),
				array( 'name' => 'Calamars frits', 'price' => '79', 'sauces' => array( 'Aïoli fumé', 'Tartare' ) ),
				array( 'name' => 'Fish burger', 'price' => '72', 'sauces' => array( 'Tartare', 'Citron-herbes' ) ),
			),
		),
		'green-spoon' => array(
			'name' => 'Green Spoon', 'email' => 'green-demo@restocommerce.test', 'cuisine' => 'Végétal', 'city' => 'Casablanca', 'image' => 'demo-green-spoon',
			'description' => 'Cuisine végétale généreuse, très fraîche et pleine de texture.',
			'products' => array(
				array( 'name' => 'Buddha bowl', 'price' => '68', 'sauces' => array( 'Tahini citron', 'Cacahuète', 'Sriracha douce' ) ),
				array( 'name' => 'Burger champignon', 'price' => '72', 'sauces' => array( 'Tahini citron', 'Sriracha douce' ) ),
				array( 'name' => 'Curry coco', 'price' => '70', 'sauces' => array( 'Cacahuète', 'Sriracha douce' ) ),
			),
		),
		'douceur-quartier' => array(
			'name' => 'Douceur du Quartier', 'email' => 'douceur-demo@restocommerce.test', 'cuisine' => 'Pâtisserie & café', 'city' => 'Rabat', 'image' => 'demo-douceur-quartier',
			'description' => 'Pâtisseries de quartier, café précis et plaisirs à partager.',
			'products' => array(
				array( 'name' => 'Pavlova fruits rouges', 'price' => '48', 'sauces' => array( 'Coulis fruits rouges', 'Chantilly vanille', 'Caramel salé' ) ),
				array( 'name' => 'Cookie noisette', 'price' => '28', 'sauces' => array( 'Caramel salé', 'Chantilly vanille' ) ),
				array( 'name' => 'Tiramisu café', 'price' => '42', 'sauces' => array( 'Chantilly vanille', 'Caramel salé' ) ),
			),
		),
	);
}

function restocommerce_demo_vendor_id( string $slug, array $restaurant ) : int {
	$user = get_user_by( 'login', 'demo-' . $slug );

	if ( ! $user ) {
		$user_id = wp_insert_user(
			array(
				'user_login' => 'demo-' . $slug,
				'user_email' => $restaurant['email'],
				'display_name' => $restaurant['name'],
				'nickname' => $restaurant['name'],
				'user_pass' => wp_generate_password( 32, true, true ),
				'role' => 'wcfm_vendor',
			)
		);
		return is_wp_error( $user_id ) ? 0 : (int) $user_id;
	}

	$user->set_role( 'wcfm_vendor' );
	return (int) $user->ID;
}

function restocommerce_demo_product( int $vendor_id, string $slug, array $restaurant, int $index, array $product_data ) : int {
	$key = $slug . '-' . $index;
	$existing = get_posts(
		array(
			'post_type' => 'product',
			'posts_per_page' => 1,
			'meta_key' => '_restocommerce_demo_key',
			'meta_value' => $key,
			'fields' => 'ids',
		)
	);

	if ( $existing ) {
		return (int) $existing[0];
	}

	$category = term_exists( $restaurant['cuisine'], 'product_cat' );
	if ( ! $category ) {
		$category = wp_insert_term( $restaurant['cuisine'], 'product_cat' );
	}
	$category_id = is_array( $category ) ? (int) $category['term_id'] : (int) $category;

	$wc_product = new WC_Product_Variable();
	$wc_product->set_name( $product_data['name'] );
	$wc_product->set_status( 'publish' );
	$wc_product->set_catalog_visibility( 'visible' );
	$wc_product->set_description( sprintf( '%s — préparation de démonstration %s.', $product_data['name'], strtolower( $restaurant['cuisine'] ) ) );
	$wc_product->set_short_description( 'Choisissez votre sauce préférée.' );
	$wc_product->set_category_ids( array( $category_id ) );
	$wc_product->set_slug( sanitize_title( $restaurant['name'] . '-' . $product_data['name'] ) );

	$attribute = new WC_Product_Attribute();
	$attribute->set_name( 'Sauce' );
	$attribute->set_options( $product_data['sauces'] );
	$attribute->set_visible( true );
	$attribute->set_variation( true );
	$wc_product->set_attributes( array( $attribute ) );
	$product_id = $wc_product->save();
	wp_update_post( array( 'ID' => $product_id, 'post_author' => $vendor_id ) );
	update_post_meta( $product_id, '_restocommerce_demo_key', $key );
	update_post_meta( $product_id, '_wcfm_vendor', $vendor_id );

	foreach ( $product_data['sauces'] as $sauce_index => $sauce ) {
		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $product_id );
		$variation->set_attributes( array( 'sauce' => $sauce ) );
		$variation->set_regular_price( (string) ( (int) $product_data['price'] + ( $sauce_index ? 3 : 0 ) ) );
		$variation->set_status( 'publish' );
		$variation->save();
	}

	WC_Product_Variable::sync( $product_id );
	return (int) $product_id;
}

function restocommerce_demo_image_id( string $image_key ) : int {
	$attachments = get_posts(
		array(
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'posts_per_page' => 1,
			'name' => $image_key,
			'fields' => 'ids',
		)
	);
	return $attachments ? (int) $attachments[0] : 0;
}

function restocommerce_demo_assign_images( int $vendor_id, array $restaurant, array $product_ids ) : void {
	$image_id = restocommerce_demo_image_id( $restaurant['image'] );
	if ( ! $image_id ) {
		return;
	}

	$settings = (array) get_user_meta( $vendor_id, 'wcfmmp_profile_settings', true );
	$settings['list_banner'] = $image_id;
	$settings['banner'] = $image_id;
	update_user_meta( $vendor_id, 'wcfmmp_profile_settings', $settings );

	foreach ( $product_ids as $product_id ) {
		set_post_thumbnail( $product_id, $image_id );
	}
}

function restocommerce_demo_seed_catalog() : int {
	if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Product_Variable' ) || ! get_role( 'wcfm_vendor' ) ) {
		return 0;
	}

	$count = 0;
	foreach ( restocommerce_demo_catalog() as $slug => $restaurant ) {
		$vendor_id = restocommerce_demo_vendor_id( $slug, $restaurant );
		if ( ! $vendor_id ) {
			continue;
		}

		$profile = (array) get_user_meta( $vendor_id, 'wcfmmp_profile_settings', true );
		$profile = array_merge(
			$profile,
			array(
				'store_name' => $restaurant['name'],
				'phone' => '212614990603',
				'mobile' => '212614990603',
				'whatsapp_number' => '212614990603',
				'description' => $restaurant['description'],
				'address' => array( 'street_1' => 'Adresse de démonstration', 'city' => $restaurant['city'], 'country' => 'MA' ),
			)
		);
		update_user_meta( $vendor_id, 'wcfmmp_profile_settings', $profile );
		update_user_meta( $vendor_id, 'restocommerce_cuisine', $restaurant['cuisine'] );
		update_user_meta( $vendor_id, 'wcfmmp_store_setup', 'yes' );
		update_user_meta( $vendor_id, 'wcfmmp_store_close', 'no' );

		$product_ids = array();
		foreach ( $restaurant['products'] as $index => $product ) {
			$product_ids[] = restocommerce_demo_product( $vendor_id, $slug, $restaurant, $index, $product );
		}
		restocommerce_demo_assign_images( $vendor_id, $restaurant, $product_ids );
		$count++;
	}

	do_action( 'restocommerce_demo_catalog_seeded', $count );
	return $count;
}

function restocommerce_demo_admin_menu() : void {
	add_management_page( 'Démo RestoCommerce', 'Démo RestoCommerce', 'manage_woocommerce', 'restocommerce-demo-content', 'restocommerce_demo_admin_page' );
}
add_action( 'admin_menu', 'restocommerce_demo_admin_menu' );

function restocommerce_demo_admin_page() : void {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}

	if ( isset( $_POST['restocommerce_demo_seed'] ) && check_admin_referer( 'restocommerce_demo_seed' ) ) {
		$count = restocommerce_demo_seed_catalog();
		printf( '<div class="notice notice-success"><p>%s</p></div>', esc_html( sprintf( '%d restaurants de démonstration et leurs menus ont été synchronisés.', $count ) ) );
	}
	?>
	<div class="wrap">
		<h1>Démo RestoCommerce</h1>
		<p>Cette action crée ou met à jour dix restaurants fictifs, leurs profils WCFM, trente produits WooCommerce et leurs variations de sauce. Elle n’ajoute aucun avis ni aucune note.</p>
		<form method="post">
			<?php wp_nonce_field( 'restocommerce_demo_seed' ); ?>
			<p><button type="submit" name="restocommerce_demo_seed" class="button button-primary">Synchroniser la démonstration marketplace</button></p>
		</form>
		<p>Pour appliquer les images, téléversez les fichiers portant les noms <code>demo-*.jpg</code> dans la médiathèque puis lancez à nouveau la synchronisation.</p>
	</div>
	<?php
}
