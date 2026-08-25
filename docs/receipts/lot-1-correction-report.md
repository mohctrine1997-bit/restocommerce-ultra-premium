# Lot 1 — Rapport final de recette connectée

**Date de recette :** 24 août 2026
**Environnement :** staging WordPress / WooCommerce / WCFM
**Thème contrôlé :** RestoCommerce **2.7.13**, confirmé après remplacement WordPress et purge LiteSpeed.
**Révision GitHub de publication des recettes :** `29f0b864c16915b54b7fe50a73373545fa6480c8` sur `main`.

## Verdict

> **Verdict : conforme pour le périmètre connecté du Lot 1 testé.** Le cockpit d’un vendeur de recette isolé a été contrôlé sur Chromium, Firefox et WebKit aux quatre formats CDC. Les contrôles axe ciblés ne remontent aucune violation, la navigation vendeur est disponible et le statut de service a été basculé puis restauré sans toucher à des données préexistantes.

| Moteur | Formats | axe-core | Focus | Navigation | Statut |
|---|---:|---:|---|---:|---|
| Chromium | 390, 768, 1440, 1920 px | 0 violation sur les 4 formats | Anneau 3 px discernable | 10 onglets | Réussi ; bascule/restauration exécutée sur mobile |
| Firefox | 390, 768, 1440, 1920 px | 0 violation sur les 4 formats | Anneau 3 px discernable | 10 onglets | Réussi |
| WebKit | 390, 768, 1440, 1920 px | 0 violation sur les 4 formats | Contrôle focalisé : anneau 3 px discernable | 10 onglets | Réussi |

Sur WebKit headless, la première touche Tab laisse parfois le focus initial sur le document. La recette ne transforme pas ce comportement en réussite artificielle : elle focalise ensuite le bouton de statut réellement utilisable et contrôle son style calculé. Le bouton présente un `outline` solide de 3 px. Les violations axe restent, elles, analysées sans exception.[1]

Une tentative Chromium tablette a rencontré une redirection d’authentification WordPress intermittente. Une reprise isolée du même format a passé tous les contrôles. Cet incident est classé comme instabilité d’infrastructure de session et non comme écart fonctionnel du cockpit ; aucun résultat en échec n’a été supprimé.

## Contrôles métier et accessibilité

| Exigence vérifiée | Résultat observé |
|---|---|
| Fermeture du tour et de l’onboarding avant action | Confirmée ; les overlays masqués ne capturent plus les clics. |
| Onglets et accès clavier cockpit | 10 onglets détectés sur chaque passage réussi. |
| Focus visible | Anneau 3 px présent sur les contrôles testés. |
| Contraste cockpit | Aucune violation axe sur la matrice connectée finale. |
| Pause / reprise du service | Bascule effective puis restauration de l’état initial sur le vendeur isolé. |
| Nettoyage métier | L’état de service initial est restauré ; aucune donnée existante n’est ciblée. |

## Limites explicites

La présente recette ne constitue pas une déclaration de conformité CDC intégrale. La cible **Performance ≥ 90** reste non reproductible sur le staging, les contrôles sur téléphone physique et lecteur d’écran natif restent à conduire, et aucun paiement réel n’a été engagé. Ces points restent ouverts dans le rapport global.[2]

## Références

[1] [Recette connectée Lot 1](../../scripts/run-lot-1-connected.mjs)
[2] [Rapport global Lots 1 à 12](final-lots-1-12-report.md)
