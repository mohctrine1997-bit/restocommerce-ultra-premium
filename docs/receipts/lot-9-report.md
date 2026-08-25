# Lot 9 — Palettes accessibles par restaurant

**Date de préparation :** 24 août 2026
**Thème déployé :** RestoCommerce 2.7.3, puis correctif transversal de contraste RestoCommerce 2.7.4
**Périmètre :** préférence visuelle opt-in par vendeur. Aucun compte, produit, média, commande, avis, contenu ou préférence existante n’a été modifié durant cette passe.

## Fonctionnalités livrées

Le cockpit propose quatre ambiances nommées : **Comptoir éditorial**, **Safran de médina**, **Jardin de saison** et **Service du soir**. Le choix est présenté par cartes avec aperçu chromatique, nom et description courte. Il n’est enregistré qu’après un clic explicite du restaurateur connecté. La valeur `restocommerce_vendor_palette` est validée contre la liste fermée des quatre identifiants, puis stockée comme métadonnée de ce seul vendeur.

La préférence est appliquée au cockpit, à la fiche restaurant et aux fiches produit de ce vendeur au moyen de classes de corps ciblées. Elle ne modifie ni les couleurs, ni les cartes, ni le comportement de la marketplace générale. Tant qu’aucune préférence n’est stockée, le thème conserve la palette actuelle **Comptoir éditorial**.

| Palette | Support visuel | Couples de contraste nominal contrôlés |
|---|---|---|
| Comptoir éditorial | Ivoire, vert service, terre cuite | 10,55:1 texte ; 8,17:1 action |
| Safran de médina | Sable, bleu nuit, épice chaude | 10,90:1 texte ; 6,43:1 action |
| Jardin de saison | Crème végétale, vert feuille, brique | 7,53:1 texte ; 7,57:1 action |
| Service du soir | Nuit profonde, ivoire, cuivre | 13,19:1 texte ; 9,98:1 carte ; 5,61:1 action |

Les contrôles sont calculés pour les couples nommés présents dans les cartes et les actions de la palette. Ils ne remplacent pas une inspection connectée complète de toutes les surfaces superposées du cockpit et des fiches publiques.

## Contrôles réalisés

Le thème, le template et le script cockpit ont passé les contrôles de syntaxe. Les invariants confirment la liste fermée, l’endpoint AJAX protégé, la classe de portée publique, le tiroir de sélection et la feuille CSS. Le script `check-palette-contrast.mjs` a validé les neuf couples nominaux à au moins 4,5:1. L’archive 2.7.3 a été contrôlée avant import, WordPress a confirmé la mise à jour, LiteSpeed a été purgé et la feuille publique de palette répond en HTTP 200 avec cache-busting.

| Contrôle | Résultat | Limite |
|---|---:|---|
| Syntaxe PHP et JavaScript | Réussi | Pas de session vendeur ouverte |
| Liste fermée et endpoint nonce + WCFM | Réussi | Vérification statique des gardes |
| Contraste nominal automatisé | Réussi | Ne couvre pas chaque image, overlay ou composant connecté |
| Archive et déploiement WordPress | Réussi | Version 2.7.3 confirmée |
| Asset CSS public | Réussi | Réponse HTTP 200 après purge |

## Limites de preuve et statut

L’environnement ne fournit pas de session vendeur portable. Aucun clic n’a donc été exécuté sur les palettes et aucune métadonnée de préférence n’a été écrite. La recette restante doit valider, avec un vendeur autorisé, l’enregistrement et le maintien de chaque palette, l’annulation sans changement, la séparation de deux restaurants, le rendu storefront/produit/cockpit sur Chromium, Firefox et WebKit aux quatre breakpoints, ainsi que les contrastes réels sur les états focus, pause et cartes chargées.

> **Statut : déployé avec contrôle de contraste nominal, contrôles syntaxiques et de distribution réussis ; persistance et rendu multi-moteurs connectés encore dus.**
