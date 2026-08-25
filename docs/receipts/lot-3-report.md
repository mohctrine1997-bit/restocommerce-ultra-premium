# Lot 3 — Rapport d’onboarding et publication de boutique

## Statut

> **Statut : partiel, non déclaré conforme.** La recette fonctionnelle antérieure est réussie, mais la performance CDC et certaines preuves de reprise connectée étendue restent incomplètes.

| Domaine | État observé | Limite ou preuve |
| --- | --- | --- |
| Assistant en six étapes | Livré | Nom, zone/adresse, couverture, horaires, premier plat et publication |
| Persistance | Livrée | État d’onboarding dédié et sauvegarde par étape côté Core |
| Cuisine, description et contact | Livrés | Persistés puis rendus dans la fiche publique et ses métadonnées |
| Fuseau et sémantique horaires | Livrés | Champs explicités et validés côté serveur |
| Média de couverture | Livré | PNG/JPEG/WebP, 5 Mo maximum, contrôle navigateur et serveur |
| Reprise et sécurité | Partiellement prouvées | Nonce invalide et refus inter-vendeur prouvés dans la recette antérieure ; reprise élargie à rejouer |
| Publication réelle | Réussie dans la recette antérieure | Boutique visible puis route canonique vérifiée |
| Lighthouse mobile | Non conforme | Performance publique inférieure à 90 sur le staging |

RestoCommerce Core `0.1.2` porte l’état d’onboarding, les validations et les garde-fous d’accès. Les endpoints de suppression et de restauration ont été désactivés afin de respecter l’instruction de conservation intégrale des données. Aucun compte, produit, média ou contenu existant n’est supprimé, désactivé, archivé ou réinitialisé par ce correctif.

La fiche publique restitue à présent la cuisine, la description, les horaires et le contact persistés. Les images de couverture bénéficient d’un chargement responsive prioritaire ; l’optimisation réduit le poids de l’élément LCP, mais la cible Performance CDC n’est pas atteinte de façon répétable sur le staging.

## Écarts restant à prouver

La reprise croisée de chaque étape dans les trois moteurs, l’expiration de session, un refus de type MIME falsifié et une idempotence connectée de bout en bout doivent encore être rejoués avec une session vendeur portable. Le contrôle humain sur téléphone réel demeure également requis par le CDC.

## Références internes

[1] [Journal d’audit Lots 1–3](audit-lots-1-3-progress.md)
[2] [Extension RestoCommerce Core](../../wordpress-plugin/restocommerce-core/restocommerce-core.php)
[3] [Recette onboarding](../../scripts/run-lot-3-receipt.mjs)
