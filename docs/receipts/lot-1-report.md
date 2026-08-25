# RestoCommerce — Rapport de recette complet du Lot 1

> **Décision technique : recevable sous validation humaine.** Le Lot 1 met en place le socle UX, accessibilité et performance sur le staging WordPress réel. Le **Lot 2 reste fermé** tant que ce rapport n’est pas validé explicitement par l’utilisateur.

## Portée réalisée

Le thème **RestoCommerce 2.1.4** est actif sur `https://aliceblue-bison-433987.hostingersite.com`. Le lot introduit des états cohérents de chargement, vide, erreur récupérable et succès pour la marketplace, la fiche restaurant et les commandes du dashboard vendeur. Les messages de retour sont annoncés de manière accessible ; les actions réelles de statut restaurant et de disponibilité produit restent inchangées et réversibles.

| Fondation | Réalisation vérifiée |
| --- | --- |
| États UX | Chargement, vide, erreur avec reprise et succès sur marketplace, menu et commandes vendeur |
| Navigation et focus | Focus clavier visible ; retours utilisateur accessibles ; side cart conservé hors du parcours clavier lorsqu’il est fermé |
| Contraste | Couleurs de navigation, aide, libellés, prix et CTA revues selon les résultats axe-core réels |
| Mise en page | Hauteurs et ratios d’images préservés pour limiter les sauts de contenu |
| Écrans secondaires | 404 alignée au socle UX et parcours de retour explicite |
| Réversibilité métier | Statut boutique et disponibilité produit testés puis restaurés |

## Environnement réel et outils sandbox

| Élément | État |
| --- | --- |
| Staging WordPress | Réel, thème RestoCommerce 2.1.4 confirmé via `style.css` |
| Cache | Purge LiteSpeed globale confirmée après le déploiement final |
| Navigateurs | Playwright Chromium, Firefox et WebKit installés dans le sandbox |
| Accessibilité | axe-core avec règles WCAG 2 A/AA, 2.1 A/AA et 2.2 AA |
| Visuel | Captures PNG et Pixelmatch/PNGJS |
| Performance | Lighthouse mobile, throttling simulé |
| Orchestrateur | `pnpm qa:lot1` ; états de recette isolés par paramètre `rcqa` |

## Déploiements réels contrôlés

Les corrections ont été construites localement, validées par analyse PHP/JavaScript, empaquetées, importées via le mécanisme WordPress signé puis suivies d’une purge LiteSpeed. Les versions intermédiaires 2.1.0 à 2.1.3 ont servi à résoudre les écarts détectés par la recette. La version finale mesurée est **2.1.4**.

| Déploiement final | Preuve |
| --- | --- |
| Version servie | `Version: 2.1.4` obtenue depuis le fichier de thème public avec cache-busting |
| Remplacement | Package WordPress signé `185` confirmé par l’administration |
| Cache | Message LiteSpeed de purge de toutes les entrées LSCache confirmé |
| Données métier | Aucun contenu client, commande ou réglage métier créé ou modifié par les états de recette |

## Recette publique multi-navigateurs et responsive

La recette finale `2026-08-23T18-55-28-119Z` a contrôlé trois parcours réels — marketplace, fiche restaurant et 404 — à 390 × 844, 768 × 1024, 1440 × 900 et 1920 × 1080, sous Chromium, Firefox et WebKit.

| Mesure | Résultat |
| --- | --- |
| Combinaisons navigateur × parcours × breakpoint | 36/36 terminées |
| Violations axe-core | 0/36 |
| Premier focus clavier visible | 36/36 |
| Captures Pixelmatch | 36/36 générées |
| Diff Pixelmatch final | 36/36 à 0 différence avec la baseline `ux-foundations-v2` |
| Blocage d’orchestrateur | Aucun |

La variation WebKit initialement observée dans le rendu du hero tablette a disparu lors de la dernière exécution stabilisée ; la référence de comparaison reste conservée dans `/home/ubuntu/resto-commerce-qa/lot-1/baseline/ux-foundations-v2/`.

## États UX testés sur le staging

Les états forcés ne sont accessibles que depuis le paramètre de contrôle sandbox `rcqa`; le parcours public normal affiche les données WordPress réelles.

| Liste métier | Chargement | Vide | Erreur récupérable | Succès | axe-core |
| --- | --- | --- | --- | --- | --- |
| Marketplace | Validé | Validé | Validé | Validé | 0 violation pour chaque état |
| Menu restaurant | Validé | Validé | Validé | Validé | 0 violation pour chaque état |
| Commandes vendeur | Validé | Validé | Validé | Validé | 0 violation pour chaque état |

## Dashboard vendeur et actions réelles

La recette dédiée `scripts/verify-vendor-dashboard-2-0.mjs` a été rejouée sur la version finale. Elle utilise le compte vendeur de démonstration limité et rétablit les données modifiées avant sa fin.

| Contrôle | Résultat |
| --- | --- |
| Dashboard dédié présent / DOM WCFM legacy absent | Validé |
| Onglets Commandes, Menu, Horaires et Profil | Validés |
| États de commandes × 4 | Visibles et sans violation axe-core |
| Passage restaurant Ouvert → Fermé → Ouvert | Validé et restauré |
| Disponibilité produit Disponible → Indisponible → Disponible | Validée et restaurée |
| Produits de démonstration réels contrôlés | 1 produit |

## Lighthouse mobile

| Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT | Speed Index |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 96/100 | 100/100 | 96/100 | 92/100 | 2,3 s | 0,025 | 10 ms | 3,0 s |

Ces mesures sont une ligne de base sur le staging réel. Elles seront comparées à chaque lot; la validation approfondie des appareils bas de gamme est réservée au Lot 12 comme prescrit par le CDC.

## Écarts résiduels et décision

| Type | Constat | Statut |
| --- | --- | --- |
| Accessibilité publique | Aucun écart axe-core sur la matrice finale | Levé |
| Accessibilité vendeur | Aucun écart axe-core sur les quatre états commandes | Levé |
| Navigation multi-moteurs | Chromium, Firefox et WebKit ont terminé la recette | Levé |
| Diffs visuels | Baseline finale stable, 0 différence dans les 36 comparaisons | Levé |
| Performance mobile | Ligne de base favorable et rapport Lighthouse conservé | À surveiller à chaque lot |

> **Décision demandée :** valider le Lot 1 et autoriser l’ouverture du Lot 2. Sans validation explicite, aucun développement de l’assistant propriétaire de gestion produits ne sera engagé.

## Preuves disponibles

| Fichier ou dossier | Rôle |
| --- | --- |
| `scripts/run-lot-1-receipt.mjs` | Orchestrateur public multi-moteurs et multi-breakpoints |
| `scripts/inspect-axe-store.mjs` | Diagnostic axe-core détaillé de fiche restaurant |
| `scripts/verify-vendor-dashboard-2-0.mjs` | Recette réelle dashboard vendeur, états et actions réversibles |
| `/home/ubuntu/resto-commerce-qa/lot-1/runs/2026-08-23T18-55-28-119Z/lot-1-receipt.json` | Résultat machine-readable final |
| `/home/ubuntu/resto-commerce-qa/lot-1/runs/2026-08-23T18-55-28-119Z/lot-1-receipt.md` | Synthèse automatisée finale |
| `/home/ubuntu/resto-commerce-qa/lot-1/runs/2026-08-23T18-55-28-119Z/` | Captures, diffs et Lighthouse final |
| `/home/ubuntu/resto-commerce-visual-baseline/vendor-dashboard-2-0-validation.json` | Preuve dashboard vendeur finale |
