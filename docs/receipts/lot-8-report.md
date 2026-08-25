# Lot 8 — Analyses vendeur sur données réelles

**Date de préparation :** 24 août 2026
**Thème déployé :** RestoCommerce 2.7.2
**Périmètre :** cockpit vendeur et lecture WooCommerce. Cette passe ne crée, ne modifie, ne supprime, ne désactive et n’archive aucune commande, produit, compte, média, avis ou contenu existant.

## Fonctionnalités livrées

Le cockpit présente une section « Les repères de votre carte » calculée lors du rendu à partir des commandes WooCommerce appartenant réellement au restaurant. Les commandes annulées, échouées, remboursées et corbeille sont exclues. Les montants des tendances correspondent uniquement aux lignes de produits dont le vendeur est propriétaire ; ils ne mélangent pas les ventes d’autres restaurants d’une commande marketplace.

| Carte | Période et source | État lorsque la donnée manque |
|---|---|---|
| Plat de la semaine | Quantités commandées sur les 7 derniers jours | « Aucune commande cette semaine » |
| À remettre en lumière | Dernière ligne commandée par plat ; seuil de 14 jours | « Tous les plats ont bougé » ou absence de commande historique |
| Tendance 7 jours | Ventes des 7 derniers jours versus les 7 précédents | « Pas de période comparable » |
| Tendance 30 jours | Ventes des 30 derniers jours versus les 30 précédents | « Pas de période comparable » |

La fonction interroge l’historique WooCommerce borné à 365 jours et n’écrit aucune métadonnée, agrégation mise en cache ni valeur préparée. L’interface indique le nombre de commandes réelles utilisées. Aucun nombre aléatoire, chiffre de démonstration, prédiction commerciale ou conseil construit sur des données fictives n’est introduit.

## Contrôles réalisés

Les syntaxes PHP du thème et du template cockpit ont été validées. Les invariants confirment la fonction dédiée, la récupération WooCommerce, le branchement du payload d’insights dans le dashboard et la présence de la feuille de style ciblée. L’archive 2.7.2 a été validée avant import, WordPress a confirmé la mise à jour, LiteSpeed a été purgé et l’asset public a été contrôlé en HTTP 200 avec cache-busting.

| Contrôle | Résultat | Limite |
|---|---:|---|
| Syntaxe PHP | Réussi | Ne rend pas un cockpit vendeur connecté |
| Sources WooCommerce et propriété vendeur | Réussi | Vérification statique ; pas de vérification de chiffres sur une session autorisée |
| Archive et déploiement WordPress | Réussi | Version 2.7.2 confirmée |
| Asset CSS public | Réussi | Réponse HTTP 200 avec type CSS |

## Limites de preuve et statut

Les identifiants vendeur portables ne sont pas disponibles et aucun compte de recette conservé n’a été ouvert afin de respecter la conservation absolue. Les cartes ont donc été implémentées sans consulter ni exposer les chiffres de ce compte. Une validation connectée reste nécessaire pour rapprocher les quantités, les ventes à 7/30 jours, le produit de tête et le dernier achat d’un produit de l’interface WooCommerce, ainsi que pour mesurer le coût de rendu sur un restaurant ayant un volume important de commandes.

> **Statut : déployé avec calculs exclusivement fondés sur les commandes réelles, contrôles syntaxiques et distribution réussis ; validation chiffrée connectée encore due.**
