# RestoCommerce — Rapport de recette complet du Lot 0

> **Décision technique : recevable sous validation humaine.** Les écarts d’accessibilité bloquants ont été corrigés et la matrice complète a été rejouée sur le staging WordPress réel. Le **Lot 1 reste fermé** : une validation explicite de ce rapport par l’utilisateur est obligatoire.

## Objet et périmètre

Le Lot 0 établit une base de recette reproductible pour RestoCommerce. Il couvre l’environnement WordPress réellement déployé, les trois moteurs prescrits, les quatre breakpoints, l’accessibilité, le clavier, la performance mobile et la comparaison visuelle. À la demande explicite de l’utilisateur, la preuve d’environnement repose sur l’administration WordPress déjà accessible et les contrôles exécutés depuis le sandbox ; aucun accès SSH à Hostinger n’a été recherché.

| Élément | État vérifié |
| --- | --- |
| Staging | `https://aliceblue-bison-433987.hostingersite.com` |
| Thème servi | **RestoCommerce 2.0.7** |
| WordPress / PHP | WordPress 7.1 / PHP 8.3.30 |
| Extensions métier | WooCommerce 11.0.1 ; WCFM Frontend Manager 6.8.0 ; WCFM Marketplace 3.8.1 |
| Cache | LiteSpeed actif ; purge globale confirmée après déploiement 2.0.7 |
| Compte client de recette | Compte isolé de rôle Client créé sans notification e-mail ; aucun identifiant sensible n’est consigné |

## Chaîne de recette disponible dans le sandbox

La chaîne de contrôle utilise WP-CLI local, Playwright avec Chromium, Firefox et WebKit, axe-core, Lighthouse, Pixelmatch et PNGJS. La commande unique `pnpm qa:lot0` génère une exécution horodatée, ses captures, ses diffs PNG, un résultat JSON et une synthèse Markdown. Les recettes ciblent une URL WordPress avec paramètre de contrôle, ce qui évite de confondre une ancienne page servie par cache avec le thème déployé.

| Contrôle | Couverture effective |
| --- | --- |
| Navigateurs | Chromium, Firefox et WebKit |
| Breakpoints | 390 × 844 ; 768 × 1024 ; 1440 × 900 ; 1920 × 1080 |
| Accessibilité | axe-core WCAG 2 A/AA, 2.1 A/AA et 2.2 AA |
| Clavier | Premier focus et indicateur visuel contrôlés par combinaison |
| Visuel | Captures intégrales et Pixelmatch sur 12 combinaisons |
| Performance | Lighthouse mobile avec simulation réseau et CPU |

## Correctifs exécutés sur le staging réel

Le thème a été déployé successivement via le mécanisme WordPress signé, jusqu’à la version **2.0.7**, puis le cache LiteSpeed a été purgé. Le tiroir de panier fermé est désormais rendu inerte et invisible pour le clavier, ce qui élimine la violation `aria-hidden-focus`. Les couleurs de textes secondaires, filtres, repères éditoriaux, cartes d’assurances et guide des villes ont été renforcées pour respecter les contrastes requis sans modifier les parcours métier ni la direction visuelle.

| Écart initial | Correction vérifiée |
| --- | --- |
| Éléments focalisables dans le panier fermé | `inert`, `aria-hidden` et gestion du focus synchronisés dans le side cart |
| Contrastes insuffisants sur la home | Tokens de contraste et sélecteurs éditoriaux corrigés dans `accessibility-remediation.css` |
| Réponse de cache transitoire | Purge LiteSpeed et URL de contrôle unique dans l’orchestrateur |
| Recette WebKit prolongée | Délais de fermeture et de navigation contrôlés dans l’orchestrateur |

## Recette finale multi-navigateurs, responsive et clavier

La recette finale stabilisée a été exécutée le **23 août 2026**, sous l’identifiant `2026-08-23T17-58-35-122Z`. Les douze combinaisons prescrites ont terminé sans violation axe-core ni blocage de l’orchestrateur. Le premier élément focalisé est systématiquement le lien de marque, avec un indicateur de focus discernable.

| Moteur | 390 × 844 | 768 × 1024 | 1440 × 900 | 1920 × 1080 | axe-core | Clavier |
| --- | --- | --- | --- | --- | --- |
| Chromium | Exécuté | Exécuté | Exécuté | Exécuté | 0 violation | Focus visible |
| Firefox | Exécuté | Exécuté | Exécuté | Exécuté | 0 violation | Focus visible |
| WebKit | Exécuté | Exécuté | Exécuté | Exécuté | 0 violation | Focus visible |

## Pixelmatch et stabilité visuelle

Les douze captures sont comparées à la référence historique dans `/home/ubuntu/resto-commerce-qa/lot-0/baseline/home-stable-1/`. Les diffs restent attendus : ils correspondent aux couleurs WCAG corrigées et, surtout, au chargement variable des visuels de cartes WordPress marqués `loading="lazy"`. L’orchestrateur force désormais leur chargement **uniquement pendant la recette**, sans changer le comportement public du site.

| Indicateur | Résultat final |
| --- | --- |
| Diffs Pixelmatch | 12/12 générés |
| Amplitude observée | 0,33 % à 1,08 % selon moteur et breakpoint |
| Origine analysée | Couleurs corrigées et visuels lazy-load variables |
| Régression structurelle observée | Aucune dans la capture Chromium 1920 px examinée |
| Référence retenue | Conservée inchangée jusqu’à validation humaine |

## Lighthouse mobile

| Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT | Speed Index |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 82/100 | 100/100 | 96/100 | 92/100 | 2,8 s | 0,025 | 0 ms | 10,1 s |

Ces résultats constituent une ligne de base et non une cible finale de performance. Le score mobile et les métriques seront comparés à chaque lot ; l’optimisation approfondie des appareils contraints est réservée au Lot 12 conformément au CDC.

## Écarts résiduels et décision de passage

| Nature | Constat | Statut |
| --- | --- | --- |
| Écart technique | Aucun blocage détecté par l’orchestrateur final | Levé |
| Accessibilité | 0 violation axe-core dans les 12 combinaisons | Levé |
| Preuve WP-CLI distante | WP-CLI est disponible dans le sandbox ; l’accès SSH Hostinger n’a pas été utilisé sur instruction utilisateur, remplacé par les preuves administratives WordPress | À entériner avec ce rapport |
| Pixelmatch | Diffs expliqués et preuves PNG conservées ; baseline non réinitialisée avant accord humain | À entériner avec ce rapport |

> **Décision demandée :** valider le Lot 0 et accepter le mode de preuve sans SSH ainsi que la référence Pixelmatch conservée. Sans cette validation explicite, aucun développement du Lot 1 ne sera commencé.

## Fichiers de preuve

| Fichier ou dossier | Rôle |
| --- | --- |
| `scripts/run-lot-0-receipt.mjs` | Orchestrateur unique de recette |
| `scripts/inspect-axe-home.mjs` | Diagnostic axe-core détaillé |
| `package.json` | Commande `pnpm qa:lot0` |
| `/home/ubuntu/resto-commerce-qa/lot-0/runs/2026-08-23T17-58-35-122Z/lot-0-receipt.json` | Résultat machine-readable final |
| `/home/ubuntu/resto-commerce-qa/lot-0/runs/2026-08-23T17-58-35-122Z/lot-0-receipt.md` | Synthèse automatisée finale |
| `/home/ubuntu/resto-commerce-qa/lot-0/runs/2026-08-23T17-58-35-122Z/` | Captures, diffs et Lighthouse final |
| `/home/ubuntu/resto-commerce-qa/lot-0/baseline/home-stable-1/` | Références Pixelmatch conservées |
