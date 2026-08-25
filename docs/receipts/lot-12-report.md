# Lot 12 — Performance sur appareils bas de gamme

**Date de recette :** 24 août 2026
**Staging :** Hostinger réel, thème RestoCommerce 2.7.34, WordPress/WooCommerce/WCFM actifs
**Statut :** **Partiel — non approuvé par le CDC**

## Conclusion exécutive

La recette a été rejouée sur le staging réel avec une vue mobile de 390×844, une latence artificielle de 150 ms, un débit descendant de 1,6 Mbps, un débit montant de 750 Kbps et un ralentissement CPU ×4. Une campagne post-2.7.35 de deux passes par route a confirmé l’absence de feuille `wp-block-library` dans la home, mais n’a pas démontré de gain stable: les résultats varient fortement selon la réponse Hostinger. Le parcours vendeur est maintenant effectivement couvert pour l’ouverture du cockpit, l’ouverture de l’assistant, la publication d’un plat QA puis son archivage, ainsi que pour une commande QA et les trois transitions de statut. Une optimisation ciblée 2.7.35 retire `wp-block-library` des routes custom qui n’utilisent aucun bloc Gutenberg; la vérification HTML de la home confirme zéro référence à cette feuille.

Les transitions de statut vendeur sont rapides dans ce profil : **895 ms**, **858 ms** et **886 ms** pour les trois appels AJAX mesurés. Elles sont donc compatibles avec l’objectif indicatif d’environ une seconde dans cette exécution. En revanche, l’ajout au panier public a produit un retour visible en **1 568 ms** dans la recette publique, et le parcours de commande mesuré sous throttling a pris **8 088 ms** jusqu’à la confirmation de l’ajout; la publication d’un plat dans le cockpit a pris **3 524 ms**. Le seuil CDC n’est donc pas démontré pour l’ensemble des actions critiques.

## Profil et parcours

| Paramètre | Valeur |
| --- | ---: |
| Vue client | 390×844 |
| Vue vendeur | 1 440×1 000 |
| Latence | 150 ms |
| Débit descendant | 1,6 Mbps |
| Débit montant | 750 Kbps |
| CPU | ×4 |
| Moteur | Chromium headless avec limitation CDP |
| Paiement réel | Aucun |
| WhatsApp | Aucun lien ouvert et aucun message envoyé |
| Données | Commandes et produits QA uniquement |

La recette publique a confirmé HTTP 200 sur la marketplace, la fiche restaurant et la fiche produit. Elle a également exécuté un ajout panier isolé dans une session navigateur neuve, sans créer de commande. La recette vendeur a créé le produit `Plat QA dégradé …`, vérifié son apparition dans le menu, puis l’a archivé automatiquement; l’archivage a répondu HTTP 200 avec succès.

## Mesures publiques Lighthouse et actions

| Route | Performance | Accessibilité | Bonnes pratiques | LCP | TBT | Verdict performance |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Marketplace, passe 1/2 post-2.7.35 | 70 / 79 | 100 | 96 | 3 945 / 3 320 ms | 0 / 0 ms | Sous la cible 90 |
| Fiche restaurant, passe 1/2 post-2.7.35 | Échec NO_FCP / 83 | — / 100 | — / 96 | — / 2 542 ms | — / 0 ms | Mesure instable, seconde passe sous 90 |
| Fiche produit, passe 1/2 post-2.7.35 | 87 / 82 | 100 | 96 | 2 268 / 2 699 ms | 0 / 0 ms | Sous la cible 90 |

Le diagnostic Lighthouse identifie principalement le **temps de réponse initial du serveur** : environ 970 à 1 030 ms dans les rapports précédents, avec un gain théorique proche de 865 à 931 ms. La campagne post-2.7.35 ajoute un échec `NO_FCP` sur la première passe de la fiche restaurant et confirme que la variance du staging domine l’effet de la suppression CSS; aucune amélioration stable vers 90 n’est prouvée. Le document HTML public fait environ 74,8 Ko et la réponse Hostinger est signalée `DYNAMIC`; aucune optimisation de thème seule ne permet donc de déclarer la cible Performance ≥90 atteinte. Lighthouse signale aussi environ 19 Ko de CSS WordPress inutilisé (`block-library/style.min.css`).

Les actions sous throttling ont donné les mesures suivantes.

| Parcours critique | Mesure | Résultat |
| --- | ---: | --- |
| Ouverture cockpit vendeur | 2 153 ms après navigation | Fonctionnel, mais non une action instantanée |
| Ouverture assistant produit | 1 367 ms | Fonctionnel, légèrement au-dessus de la cible indicative |
| Publication d’un plat QA | 3 524 ms | Fonctionnel, au-dessus de la cible |
| Ajout panier isolé public | 1 568 ms jusqu’au retour visible | Fonctionnel, au-dessus de la cible |
| Transitions vendeur — En cuisine | 895 ms | Fonctionnel, dans la cible indicative |
| Transition vendeur — Prête | 858 ms | Fonctionnel, dans la cible indicative |
| Transition vendeur — Terminée | 886 ms | Fonctionnel, dans la cible indicative |

## Accessibilité et erreurs réseau

Les rapports Lighthouse publics donnent 100/100 en accessibilité et 96/100 en bonnes pratiques sur les trois routes testées. Les tests axe du Lot 9 restent séparément à zéro sur les quatre palettes et les moteurs couverts. La recette Lot 12 a toutefois enregistré deux messages console de ressource 404 dans le parcours de commande; leur URL exacte n’a pas été récupérée par le harnais enrichi. Ils doivent être identifiés avant une approbation finale globale, sans être artificiellement classés comme bénins.

## Limites et décision

Le Lot 12 n’est **pas approuvé**. Il dispose désormais d’une preuve authentifiée du vendeur pour l’ajout et la publication d’un plat, ainsi que d’une preuve de transitions de commande sous dégradation. Il ne respecte cependant pas la cible de retour d’action d’environ une seconde sur l’ensemble des parcours, et les scores Lighthouse Performance restent entre 82 et 86 au lieu de 90 ou plus.

Cette recette ne remplace pas un Android physique d’entrée ou milieu de gamme, un test tactile humain, ni une mesure sur un vrai réseau mobile. Elle ne couvre pas non plus Firefox/WebKit sous le profil Lot 12 dégradé. Les commandes QA créées pendant la recette sont conservées comme preuves de staging; aucun paiement réel n’a été traité et aucun message WhatsApp n’a été envoyé.

## Artefacts

- `qa/lot12-degraded-staging/2026-08-24T22-50-29-605Z/lot-12-degraded.json`
- `qa/lighthouse-current-staging/summary.json`
- `qa/lot12-vendor-1787612992826.json`
- `qa/lot12-status-1787613408929.json`
- `qa/validate-onboarding-normal-path.json`
- `qa/lot12-vendor-add-product-degraded.mjs`
- `qa/lot12-vendor-status-degraded.mjs`

Le rapport est volontairement formulé comme **partiel** : la preuve dynamique est maintenant meilleure, mais les seuils de performance et l’équipement physique requis par le CDC restent ouverts.
