# RestoCommerce — Passation développeur

## État de référence

Le dépôt public correspond à la version de référence **RestoCommerce 2.7.54**. Le produit déployé est un thème PHP WordPress; le dossier `client/` contient un prototype React historique et ne constitue pas le runtime WordPress principal.

RestoCommerce est une marketplace de restaurants basée sur WordPress, WooCommerce et WCFM Marketplace. WooCommerce reste la source des produits, du panier et des commandes. WCFM reste le moteur des rôles, de la propriété vendeur et des autorisations. RestoCommerce remplace progressivement l’expérience visible, sans contourner les droits WCFM.

## Architecture à connaître

| Surface | Fichiers principaux | Rôle |
| --- | --- | --- |
| Home publique | `wordpress-theme/restocommerce/front-page.php`, `assets/css/home-editorial.css` | Découverte locale, recherche, filtres et sélection de restaurants |
| Fiche restaurant | `storefront.php`, `page-restaurant.php`, CSS storefront | Hero restaurant, carte, familles et produits |
| Boutique | `archive-product.php`, `woocommerce.php`, `assets/css/shop-archive.css` | Archive WooCommerce premium et accessible |
| Fiche produit | `single-product.php`, `assets/js/cart.js` | Configuration des choix, suppléments, quantité et ajout panier |
| Cockpit vendeur | `vendor-dashboard.php`, `assets/js/vendor-dashboard-app.js` | Vue d’ensemble, commandes, menu, horaires, profil et avis |
| Bibliothèque de carte | `assets/js/vendor-menu-library.js`, `assets/css/vendor-menu-library.css` | Catégories visuelles, groupes d’options et suppléments |
| Wizard produit | `assets/js/vendor-product-wizard.js`, `assets/css/vendor-product-wizard.css` | Création/édition d’un plat et association par catégorie |
| Contrat serveur | `functions.php` | Nonces, permissions, endpoints, métadonnées, panier et commandes |
| Plugins | `wordpress-plugin/` | Pont WCFM, contenu de démonstration et checkout WhatsApp |

## Fonctionnalités livrées en 2.7.54

Le vendeur peut créer une catégorie de carte avec un nom, une icône et une photo facultative. Une nouvelle catégorie reste visible dans la bibliothèque et le wizard même avant son premier produit.

Le vendeur peut créer une bibliothèque de choix réutilisables : sauces, tailles, cuisson ou préférences. Chaque groupe possède une portée par catégorie, un mode obligatoire/facultatif et un maximum de sélections. Les slugs de catégories sont utilisés pour l’association; le filtrage ne dépend pas du texte visuel.

Le vendeur peut créer des suppléments réutilisables avec un prix positif ou nul et une liste de catégories autorisées. Un supplément peut être mis en pause puis réactivé. Le navigateur envoie une référence, mais le prix est relu et recalculé côté serveur avant l’ajout au panier afin d’empêcher une majoration forgée côté client.

La fiche produit affiche les options et suppléments compatibles avec sa catégorie. Le configurateur met à jour le total visible, transmet la sélection au panier et conserve le détail dans la ligne de commande. Le checkout réel n’est pas lancé par les recettes de ce dépôt.

## Règles de sécurité

Aucun identifiant ou mot de passe de staging ne doit être écrit dans le dépôt. Les recettes utilisent les variables d’environnement `RC_ORIGIN`, `RC_VENDOR_USER` et `RC_VENDOR_PASSWORD`. Un compte vendeur restreint est préférable à un administrateur WordPress.

Les endpoints doivent continuer à vérifier le nonce, le rôle vendeur, la propriété du produit ou de la boutique et la validité des identifiants reçus. Ne jamais faire confiance au prix, à la propriété vendeur ou aux limites envoyées par le navigateur. Les clés de commande, cookies, nonces de session, exports de base et artefacts de capture doivent rester hors Git.

Les opérations financières, retraits, exports sensibles et paiements ne doivent pas être remplacés par une façade incomplète. Les écrans WCFM `settings` et `payments` restent conservés pour les fonctions avancées non encore migrées.

## Déploiement WordPress

Le thème est empaqueté depuis `wordpress-theme/restocommerce/`, puis téléversé dans **Apparence → Thèmes → Ajouter → Téléverser un thème**. Le remplacement doit être confirmé dans WordPress, puis le cache LiteSpeed doit être purgé. Vérifier la version réellement servie dans `wp-content/themes/restocommerce/style.css` et effectuer une sonde HTTP des routes publiques.

Les plugins ne doivent pas être activés ou désactivés sans vérifier leur rôle dans le staging. `Keleva Woo Addons` reste désactivé selon le contrat de recette.

## Recette recommandée

Les scripts historiques dans `scripts/` et les scripts ciblés dans `scripts/qa/` doivent être exécutés progressivement, par navigateur et par largeur. La campagne minimale après modification de `functions.php`, du wizard, du panier ou des permissions est : HTTP 200 des routes principales, Chromium mobile 390 px, Chromium desktop, Firefox mobile, WebKit mobile, axe-core, clavier et vérification du panier sans checkout.

Les campagnes doivent conserver séparément les erreurs réseau legacy (`admin-ajax.php`, `wc-ajax`, `notification.mp3`, ressources WCFM). Un abort réseau n’est jamais un pass fonctionnel. Les preuves JSON doivent être assainies et ne doivent contenir ni cookie, ni nonce, ni clé de commande, ni téléphone privé.

Exemple de préparation locale :

```bash
pnpm install
set -a && source .env.local && set +a
pnpm lint
pnpm check
```

Pour un package WordPress :

```bash
rm -f wordpress-archives/restocommerce-theme.zip
(cd wordpress-theme && zip -qr ../wordpress-archives/restocommerce-theme.zip restocommerce -x '*/.DS_Store')
unzip -t wordpress-archives/restocommerce-theme.zip
```

## Limites connues au moment de la passation

Le CDC Ultra Premium n’est pas déclaré conforme à 100 %. Les principaux travaux restants sont la migration progressive de `settings` et `payments`, les contrôles performance Hostinger/p95, l’audit multi-moteur complet des nouvelles surfaces, les tests sur téléphone physique et lecteur d’écran, la validation visuelle Pixelmatch et la robustesse complète du polling vendeur.

Le module de carte livré ne gère pas encore les règles conditionnelles avancées entre groupes, les paliers de quantité, les suppléments dépendant d’un autre choix ou la traduction multilingue de chaque libellé. Le prix de chaque supplément est néanmoins contrôlé côté serveur.

## Documentation associée

Les contrats et rapports de reprise se trouvent dans `docs/handoff/`. Le CDC se trouve dans `docs/CDC-ULTRA-PREMIUM.md` et les décisions checkout/paiement dans `docs/CHECKOUT-DECISION.md`. Les rapports historiques sont conservés comme historique et ne doivent pas être interprétés comme une approbation globale actuelle.

## Politique de publication

Le repository public ne contient volontairement ni environnement local, ni archive de déploiement, ni logs de session, ni captures privées, ni identifiants. Toute preuve supplémentaire doit être assainie avant commit. Toute modification du staging doit être documentée avec sa version, son hash, son périmètre, ses limites et le résultat réel des tests.
