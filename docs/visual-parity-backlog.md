# Référentiel de parité visuelle React → WordPress

## Référence React marketplace

La référence desktop repose sur une succession éditoriale nette : masthead minimal, hero ivoire avec typographie de très grande échelle et formes orbitales, module de recherche horizontal, filtres en pastilles, grille de cartes sans cadres lourds, puis séquence pédagogique en trois temps. Chaque carte contient image, disponibilité, zone, cuisine, nom, résumé, temps de préparation et action circulaire.

## Écart constaté sur la boutique WordPress

La page WCFM reste un habillage de plugin : bannière sombre peu informative, identité de magasin et détails techniques WCFM, onglets génériques, tri natif, barre latérale de recherche et grille sans les contenus éditoriaux de la référence React. Une feuille CSS ne suffira pas à obtenir une parité structurelle.

## Décision de mise en œuvre

Les URLs `/restaurant/{slug}/` doivent être rendues par un gabarit RestoCommerce dédié, tout en utilisant les profils WCFM et les produits WooCommerce existants. Les pages produits, panier et checkout doivent recevoir leurs propres gabarits WooCommerce plutôt que dépendre du fallback `woocommerce.php`.

## Outillage de validation

Le sandbox contient désormais Chromium, Playwright, Pixelmatch, PNGJS et ImageMagick. Le script `scripts/capture-visual-baseline.mjs` capture les routes React de référence et les routes WordPress publiques en 1440 px et 390 px, dans `/home/ubuntu/resto-commerce-visual-baseline/`.

## Mise en œuvre en cours

La home enrichie est déployée en version 0.3.0 avec une sélection éditoriale, une entrée par villes et des garanties de commande sans avis ou données utilisateur fictifs. La version 0.4.0, également déployée, intercepte les URLs publiques `/restaurant/{slug}/` pour rendre un gabarit RestoCommerce dédié, tout en lisant le profil WCFM et les produits WooCommerce réels. Les fiches produit utilisent désormais un template dédié avec image, prix, variations et lien de retour vers le restaurant.

Le contrôle public de `https://aliceblue-bison-433987.hostingersite.com/restaurant/demo-tokyo-bento/?rc-visual-release=040` confirme que l’URL restaurant sert maintenant le gabarit éditorial dédié. Le premier routage de produit a brièvement renvoyé une réponse vide car le global WooCommerce `$product` n’était pas encore initialisé au moment du chargement du template ; la révision 0.4.2 initialise explicitement le produit avec l’objet de requête. Cette révision doit être vérifiée publiquement après son remplacement WordPress.

## Validation finale

Les captures Playwright de la version 0.5.1 couvrent la marketplace, une fiche restaurant, une fiche plat, le panier et le checkout en 1440 × 1000 et 390 × 844. Les planches de contrôle sont stockées hors du projet déployable dans `/home/ubuntu/resto-commerce-visual-baseline/final-desktop-contact-sheet.png` et `/home/ubuntu/resto-commerce-visual-baseline/final-mobile-contact-sheet.png`. Les cinq parcours conservent les mêmes tokens éditoriaux et les actions principales restent lisibles sur mobile. Le contexte automatisé étant isolé du panier du navigateur administrateur, les captures panier et checkout montrent leur état vide ; le test navigateur interactif, lui, a validé une variation de sauce réelle dans le panier et la disponibilité du moyen « Finaliser sur WhatsApp » dans le checkout classique.
