# Livraison menu RestoCommerce 2.7.54

## Verdict

Le module de gestion de carte est déployé sur le staging WordPress Hostinger en version **2.7.54**. WordPress a confirmé le remplacement du thème. Le package final contient la bibliothèque vendeur, la persistance des catégories/options/suppléments, l’association par catégorie et le recalcul serveur des suppléments.

Le périmètre est validé en **Chromium mobile 390 px** avec le vendeur QA. Le smoke a couvert l’ouverture du cockpit custom, la création d’une catégorie, l’upload d’une photo de catégorie, l’icône, la création d’un groupe de choix limité à un choix maximum, la création d’un supplément tarifé à 7,50 MAD, la sélection de la catégorie dans le wizard, l’enregistrement du produit, le rendu public et l’ajout au panier. Un `admin-ajax.php` 404 legacy a été observé séparément; il n’a pas empêché le scénario et n’est pas déclaré comme succès.

## Fonctionnalités livrées

| Domaine | Comportement livré | Contrôle serveur |
|---|---|---|
| Catégories | Nom, icône, photo facultative, visibilité | Taxonomie WooCommerce `product_cat`, propriétaire vendeur contrôlé |
| Choix client | Sauces, tailles, préférences, choix unique ou multiple | Validation du titre, au moins un choix, maximum borné, portée par slugs de catégories |
| Règles | Option obligatoire ou facultative et maximum de réponses | Revalidation du maximum côté client et serveur |
| Suppléments | Nom, prix positif ou nul, catégories autorisées | Prix relu depuis la bibliothèque vendeur; le navigateur ne fait pas autorité |
| Produit | Sélection de la catégorie, options et suppléments compatibles | Association enregistrée dans les métadonnées du produit vendeur |
| Panier | Total visible recalculé, supplément transmis à WooCommerce | Recalcul du prix côté serveur et conservation dans la ligne de commande |
| Disponibilité | Pause/réactivation catégorie, option et supplément | Nonce, garde vendeur et mise à jour de la bibliothèque |

## Preuve dynamique principale

La dernière exécution a produit les résultats suivants :

| Contrôle | Résultat |
|---|---:|
| Cockpit vendeur RestoCommerce | PASS |
| Bibliothèque ouverte | PASS |
| Catégorie créée | PASS |
| Photo de catégorie visible | PASS |
| Option persistée | PASS |
| Supplément persisté | PASS |
| Catégorie sélectionnée dans le wizard | PASS |
| Option compatible visible dans le wizard | PASS |
| Supplément compatible visible dans le wizard | PASS |
| Produit enregistré | PASS |
| Fiche publique accessible | PASS |
| Option visible publiquement | PASS |
| Supplément visible publiquement | PASS |
| Prix du supplément visible | PASS |
| Ajout au panier serveur | PASS |
| Bouton après sélection | 76,50 MAD pour un plat à 69,00 MAD + 7,50 MAD |
| Checkout/paiement | NON EXÉCUTÉ |
| WhatsApp | NON OUVERT |
| 404 réseau legacy | OBSERVÉ, NON BLOQUANT, NON PASS |

La réponse d’ajout au panier a retourné un succès serveur et le mini-panier a affiché les lignes à 76,50 MAD. Le smoke ne considère pas la présence textuelle du supplément dans le mini-panier comme un critère bloquant, car le mini-panier actuel résume la ligne par le nom du produit; la preuve de prix repose sur le bouton configurateur et le recalcul serveur.

## Limites explicites

La version 2.7.54 ne gère pas encore les règles conditionnelles avancées entre groupes, les paliers de quantité, les suppléments dépendant d’un autre choix, ni la traduction multilingue de chaque libellé. Les prix sont toutefois contrôlés côté serveur. Les écrans `settings` et `payments` WCFM restent volontairement conservés pour leurs fonctions avancées et financières.

Le test final couvre Chromium mobile. La validation Firefox/WebKit, les tailles tablette/desktop et l’audit axe dédié à la nouvelle bibliothèque restent à compléter avant un verdict global de conformité du CDC. Le staging reste donc **non approuvé à 100 %**.

## Données QA

Les opérations de création et d’association ont utilisé uniquement des noms préfixés `QA` et le produit QA existant du vendeur de recette. Aucun paiement, checkout, retrait, export financier ou message n’a été exécuté.
