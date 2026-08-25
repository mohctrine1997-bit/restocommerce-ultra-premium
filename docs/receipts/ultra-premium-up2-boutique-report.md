# Rapport de recette Ultra Premium — UP-2 Archive boutique

**Date :** 25 août 2026
**Staging :** `darkblue-spoonbill-498612.hostingersite.com`
**Version de référence finale :** RestoCommerce 2.7.52 (boutique validée en 2.7.42 puis non-régressée après transitions vendeur jusqu’à 2.7.52)
**Statut :** **route boutique validée dans la matrice exécutée ; CDC global non approuvé**

## Objet

Cette recette couvre la migration de la route `/boutique/` depuis l’archive WooCommerce/WCFM legacy vers une coque éditoriale RestoCommerce. Le périmètre vérifie la présence du hero et de la grille premium, l’absence des feuilles CSS WCFM legacy, la stabilité responsive, l’accessibilité automatisée, le tri WooCommerce, la navigation produit et le quick-view. Aucun paiement, commande ou message WhatsApp n’a été déclenché.

## Cause racine et application

Le premier smoke de la nouvelle archive avait confirmé la coque visuelle mais détecté 59 nœuds axe : 43 contrastes de prix/quick-view, 8 logos vendeur sans `alt` et 8 liens WCFM sans nom accessible. L’inspection DOM a montré que WCFM injectait dans la boucle native un lien vide vers `store-manager/products-manage/{id}`, un logo vendeur sans alternative textuelle et un second lien vendeur.

La correction a été appliquée dans le thème, sans retirer les capacités WCFM serveur. `assets/js/cart.js` normalise uniquement le markup vendeur présent dans la boucle publique : le lien vide est supprimé, les classes de lien produit sont retirées du lien d’attribution, celui-ci reçoit un nom accessible et le logo devient décoratif lorsqu’il est accompagné du nom textuel. `assets/css/shop-archive.css` impose l’encre sombre des prix, le contraste des descendants WooCommerce, le fond sombre des boutons quick-view et un état focus visible qui conserve un ratio accessible. `woocommerce.php` délègue `is_shop()` à `archive-product.php`, point d’entrée indispensable pour éviter l’override WooCommerce.

## Déploiement et contrôles HTTP

WordPress a confirmé le remplacement du thème installé de 2.7.41 vers 2.7.42. L’archive locale déployée est `staging-install/restocommerce-theme-2.7.42-boutique-a11y.zip`, SHA-256 `c302a4a4441ff55d5d6a704b9e34ac5f65577a46cfef36554dd7c7f0fd102ef9`. Les routes `/`, `/boutique/`, `/store/demo-brunch-bloom` et `/produit/brunch-bloom-avocado-toast/` ont répondu HTTP 200 après le déploiement. La boutique sert `shop-archive.css` et `cart.js` avec la version 2.7.42 ; aucune feuille `wcfm*.css` legacy n’a été détectée dans sa réponse HTML.

## Matrice de recette finale

Le harnais `qa/ultra-premium-boutique-smoke.mjs` a été enrichi pour sélectionner le second tri, vérifier la sélection et l’application du tri, suivre un lien produit HTTP 200 jusqu’au shell `.rc-product-page`, ouvrir le quick-view et contrôler son contenu, puis vérifier l’absence de liens `store-manager/products-manage` et de liens vendeur vides. Axe-core 4.13.0 est exécuté sur chaque cas.

| Moteur | Format | HTTP | Hero/grille | Tri | Produit | Quick-view | Liens manage | Axe | Console applicative | Statut |
|---|---:|---:|---|---|---|---|---:|---:|---:|---|
| Chromium | 390×844 | 200 | OK | OK | 200 / shell OK | OK | 0 | 0 | 0 | PASS |
| Chromium | 1440×1000 | 200 | OK | OK | 200 / shell OK | OK | 0 | 0 | 0 | PASS |
| Firefox | 390×844 | 200 | OK | OK, fallback documenté | 200 / shell OK | OK | 0 | 0 | 0 | PASS |
| Firefox | 1440×1000 | 200 | OK | OK | 200 / shell OK | OK | 0 | 0 | 0 | PASS |
| WebKit | 390×844 | 200 | OK | OK | 200 / shell OK | OK | 0 | 0 | 0 | PASS |
| WebKit | 1440×1000 | 200 | OK | OK | 200 / shell OK | OK | 0 | 0 | 0 | PASS |

Chaque exécution a également confirmé neuf produits rendus, aucun débordement horizontal, zéro élément focusable masqué et zéro feuille CSS WCFM legacy. Les preuves JSON et PNG correspondantes sont conservées sous `restocommerce-audit/qa/` avec le suffixe `2742` et `final-2742`.

Firefox et WebKit ont parfois enregistré des requêtes annulées vers `admin-ajax.php`, `wc-ajax=get_refreshed_fragments`, des médias ou le son WCFM `notification.mp3`. Ces annulations sont restées sans erreur console applicative ni défaut axe ; elles sont toutefois conservées comme anomalies réseau/performance et ne sont pas déclarées résolues par cette recette.

## Décision

La route `/boutique/` satisfait le gate UP-2 exécuté sur les six combinaisons moteur/format ci-dessus. La coexistence WCFM est ramenée au moteur d’attribution vendeur côté public, sans exposition de liens manage client et sans violation axe dans le périmètre testé.

Cette décision **ne vaut pas conformité à 100 % du CDC Ultra Premium**. Elle ne couvre pas encore les formats 768×1024 et 1920×1080 pour cette nouvelle route, les audits visuels Pixelmatch comparatifs, Lighthouse stable à 90 ou plus, les écrans secondaires `store-manager/*`, les notifications natives Lot 5, le refresh client Lot 6, ni la validation téléphone physique/lecteur d’écran natif. Le Lot 12 reste non approuvé pour ses seuils performance et publication sous throttling.

## Fichiers principaux

| Fichier | Rôle |
|---|---|
| `wordpress-theme/restocommerce/archive-product.php` | coque de l’archive boutique |
| `wordpress-theme/restocommerce/woocommerce.php` | délégation `is_shop()` |
| `wordpress-theme/restocommerce/assets/css/shop-archive.css` | layout, palette et contraste boutique |
| `wordpress-theme/restocommerce/assets/js/cart.js` | normalisation vendeur et quick-view |
| `qa/ultra-premium-boutique-smoke.mjs` | gate dynamique axe + fonctionnel |
| `qa/ultra-premium-boutique-*-2742*.json` | preuves JSON par moteur/format |
| `qa/ultra-premium-boutique-*-2742*.png` | captures de preuve |


## Non-régression après 2.7.43

Après l’ajout de la transition vendeur orderslist, le gate boutique Chromium mobile 390×844 a été rejoué. Il conserve HTTP 200, neuf produits, hero/grille premium, tri appliqué, produit HTTP 200 avec shell `.rc-product-page`, quick-view avec contenu, zéro lien manage, zéro lien vendeur vide, zéro violation axe, zéro erreur console et aucun débordement horizontal. Trois requêtes son WCFM `notification.mp3` ont été annulées et restent classées comme anomalie réseau non bloquante.
