# Rapport final de parité — RestoCommerce 0.7.3

**Objet :** alignement visuel de l’intégration WordPress/WooCommerce/WCFM sur la maquette React « Le Comptoir Éditorial ».
**Site de test :** https://aliceblue-bison-433987.hostingersite.com
**Version active déployée :** RestoCommerce 0.7.3.

## Résultat de la passe de fidélité

La home marketplace et les boutiques WCFM utilisent désormais la même direction visuelle que la maquette : ivoire chaud, vert service, terracotta, polices **DM Serif Display** et **Manrope**, header compact, titres éditoriaux, rythme de grille et boutons arrondis. Le dégradé de hero des boutiques est aligné sur les valeurs exactes de la référence React.

| Écran contrôlé à 1440 × 1000 px | Résultat de comparaison | Lecture du résultat |
|---|---:|---|
| Marketplace | **3,21 %** de pixels différents | Géométrie, titres, recherche et grille stabilisés ; différence restante liée aux restaurants WCFM réels. |
| Boutique WCFM | **16,64 %** de pixels différents | La composition est stabilisée ; les produits, prix MAD, photos et libellés de variations diffèrent de la démonstration React. |

> Une parité pixel absolument littérale ne peut être obtenue entre une maquette ayant des données fictives et une marketplace affichant les données vivantes de WooCommerce/WCFM. Les écarts résiduels mesurés sont concentrés dans le contenu plutôt que dans le système graphique.

## Mesures de composition confirmées

| Élément de boutique | React | WordPress 0.7.3 | État |
|---|---:|---:|---|
| Hauteur du header | 73 px | 73 px | Identique |
| Titre hero | 100,8 px | 100,8 px | Identique |
| Interligne titre hero | 88,7 px | 88,7 px | Identique |
| Titre du menu | 60 px | 60 px | Identique |
| Première carte menu | x 308 / y 982 / largeur 345 px | x 308 / y 982 / largeur 345 px | Identique |

## Parcours public validé

La validation s’est faite depuis une session WooCommerce neuve avec une variation réelle ajoutée : **Chicken katsu curry — Curry doux**. Les écrans desktop et mobile à 390 px ont été capturés après chargement complet des polices.

| Parcours | État validé | Résultat |
|---|---|---|
| Marketplace | Home publique | Recherche, filtres, cartes et navigation éditoriale présents. |
| Boutique WCFM | Tokyo Bento | Hero, catégories de menu, quick view, options de produits et panier accessibles. |
| Fiche produit | Produit variable | Sélecteur de sauce et ajout au panier opérationnels. |
| Panier | Article et variation réels | Restaurant, prix, quantité, total et passage commande lisibles sur desktop et mobile. |
| Checkout | Article et variation réels | Pays/région configuré sur **Maroc / Casablanca** ; récapitulatif et bouton WhatsApp visibles. |

## Changements livrés dans 0.7.3

La feuille boutique reprend maintenant le wash React suivant :

```css
linear-gradient(90deg, rgba(12,38,32,.95) 0%, rgba(12,38,32,.84) 45%, rgba(12,38,32,.16) 100%)
```

La boutique prend également en charge la méta vendeur `restocommerce_hero_title`. Lorsqu’elle est renseignée, elle remplace le titre générique du hero et permet à chaque restaurateur de disposer de sa propre accroche éditoriale, sans modifier le gabarit ni le système WCFM.

## Écarts assumés et recommandation de production

Les éléments suivants doivent être considérés comme des données éditoriales à préparer avant ouverture au public : titres hero propres à chaque restaurant, photos propres à chaque carte, descriptions de plats et éventuels numéros WhatsApp individuels. Une fois ces données alignées avec la sélection de démonstration React, la part des pixels différents liée au contenu décroîtra naturellement sans reprise de la structure ni du CSS.

Les fichiers de preuve sont conservés dans les emplacements suivants :

| Preuve | Emplacement |
|---|---|
| Mesures géométriques | `/home/ubuntu/resto-commerce-visual-baseline/metrics/react-wordpress-geometry.json` |
| Différences pixels | `/home/ubuntu/resto-commerce-visual-baseline/diff/` |
| Panier et checkout non vides | `/home/ubuntu/resto-commerce-visual-baseline/filled/` |
| Archive installable | `/home/ubuntu/resto-commerce-theme/wordpress-archives/restocommerce-theme.zip` |
