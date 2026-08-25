# Mesures de parité micro-visuelle

> **Référence** : captures Playwright en 1440 × 1000, police et feuilles de style pleinement chargées.

| Élément | Référence React | WordPress mesuré | Correction de parité |
|---|---:|---:|---|
| Marge latérale desktop, home | 48 px | 16 px | Porter le conteneur WordPress à 48 px à partir de 1200 px. |
| Titre hero home | 880 px de large | 1 100 px de large | Contraindre la colonne de copie à 880 px. |
| Titre « Choisissez votre table » | 60 px | 72 px | Ramener le titre WordPress à 60 px et à l’interlettrage React. |
| Cartes home | 432 px | 453 px | Utiliser la largeur de grille React avec 24 px d’écart. |
| Hero restaurant | 100,8 px / 88,7 px | 115,2 px / 95,6 px | Ramener le nom de boutique au rythme de titre React. |
| Titre menu restaurant | 60 px | 86,4 px | Fixer le titre WordPress à 60 px sur desktop. |
| Cartes menu restaurant | 345 px | 368 px | Réduire la grille et les espacements à la géométrie de la référence. |

La différence résiduelle la plus importante est **structurelle** : le gabarit boutique WordPress exploite des informations WCFM réelles, alors que la référence React utilise une fiche de restaurant curatée. La correction doit donc privilégier les mêmes zones visuelles et la même hiérarchie, tout en conservant les données WooCommerce et WCFM.

## Contrôle par différence de pixels

Les cartes de différence générées à partir des premiers écrans confirment que les écarts sont principalement concentrés dans les zones de texte, les marges latérales, la largeur de la colonne éditoriale et les contrôles de boutique.

| Écran | Pixels différents | Part du premier écran | Zones prioritaires |
|---|---:|---:|---|
| Marketplace | 46 163 | 3,21 % | Contenu WCFM réel, notamment les titres, lieux et cartes disponibles. |
| Boutique | 239 655 | 16,64 % | Données WCFM réelles, prix MAD et images des plats différents de la fiche React fictive. |

Les fichiers de travail sont disponibles dans `/home/ubuntu/resto-commerce-visual-baseline/diff/`. Ils servent de garde-fou de régression durant la passe de correction.

## Validation mobile après RestoCommerce 0.7.2

La fiche restaurant mobile conserve une lecture cohérente avec la référence : marque compacte, hero avec bouton d’action visible, entrée « À la carte », filtres horizontaux, cartes menu sur une colonne et appel à l’action terracotta final. Aucun débordement horizontal ni texte tronqué n’a été relevé dans la capture 390 px. Les images de démonstration sont volontairement identiques sur les trois plats Tokyo Bento ; il s’agit d’un écart de contenu plutôt que de géométrie.

| Contrôle | Résultat |
|---|---|
| Header et panier mobile | Compacts et accessibles |
| Hero restaurant | Hiérarchie et contraste conservés |
| Cartes menu | Image, titre, prix et action lisibles |
| Appel à l’action final | Présent, contrasté et atteint sans rupture de rythme |

## Parcours commerce non vide

Les captures automatisées ont ajouté une variation réelle « Chicken katsu curry — Curry doux » dans une session WooCommerce neuve, puis enregistré le panier et la page de commande en desktop et à 390 px. Le panier mobile expose correctement le produit, sa sauce, le restaurant, le total et l’action de validation, tandis que le checkout mobile garde une hiérarchie stable jusqu’au bloc « Finaliser sur WhatsApp ».

| Écran | Session | Validation | Observation restante |
|---|---|---|---|
| Panier | Produit + variation réels | Contenu, totaux et CTA visibles | Aucun débordement horizontal à 390 px |
| Checkout | Produit + variation réels | Champs, récapitulatif et CTA WhatsApp visibles | Pays et région désormais définis sur Maroc / Casablanca |

## Clôture RestoCommerce 0.7.3

La version 0.7.3 aligne le dégradé du hero boutique sur la valeur exacte de la maquette React et ajoute la méta `restocommerce_hero_title` pour permettre un titre éditorial propre à chaque restaurant. Les mesures post-déploiement maintiennent une géométrie très proche de la référence : header boutique de 73 px, hero de 100,8 px, titre menu de 60 px et première carte positionnée à 308 × 982 px. Le panier desktop et le checkout mobile ont été vérifiés avec une variation réelle ; les actions de validation et WhatsApp restent visibles et contrastées.

> L’écart pixel résiduel n’est plus une divergence de système visuel. Il provient des contenus dynamiques assumés par WooCommerce et WCFM : restaurants, visuels, produits, prix en dirham marocain et libellés de variations diffèrent nécessairement de la démo React.
