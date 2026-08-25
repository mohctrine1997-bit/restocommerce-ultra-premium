# RestoCommerce Ultra Premium — état de conformité vérifié

**Date de recette :** 25 août 2026
**Staging :** `https://darkblue-spoonbill-498612.hostingersite.com`
**Thème actif vérifié :** RestoCommerce **2.7.52**
**Archive déployée :** `restocommerce-theme-2.7.52-profile-transition-contrast.zip`
**SHA-256 :** `69ed6686a9744ec6ca4727368a385244645dd46b519ea684158a8ff66f0ea87e`
**Verdict global :** **non conforme à 100 % / CDC global non approuvé**.

## Résumé exécutif

Le déploiement 2.7.52 est réel et confirmé par WordPress. Il corrige le contraste du lien de réglages avancés dans la nouvelle façade profile, puis conserve l’accès au moteur WCFM. La transition profile est maintenant prouvée dans les quatre cas exécutés — Chromium mobile, Firefox mobile, WebKit mobile et Chromium desktop — avec shell RestoCommerce, absence du shell WCFM, zéro violation axe et une URL finale `#profile`.

La boutique publique reste non-régressée en Chromium mobile : HTTP 200, neuf produits, hero et grille premium, tri, fiche produit, quick-view, zéro lien manage, zéro lien vendeur vide et axe zéro. Les annulations de `notification.mp3` sont conservées comme anomalies réseau WCFM legacy; elles ne sont pas déclarées résolues.

Le résultat est une **Candidate Premium partielle sur les surfaces prouvées**, pas une Release Premium et certainement pas une conformité complète. Les limites restantes sont substantielles : settings et payments demeurent WCFM legacy, le contrôle payments post-déploiement est bloqué par timeout, la notification native multi-moteur n’est pas totalement prouvée, le refresh Lot 6 reste surtout prouvé en Chromium, les budgets de performance du Lot 12 restent sous les objectifs, et le téléphone physique, le lecteur d’écran natif et la campagne Pixelmatch complète restent ouverts.

## Changements effectivement livrés

| Surface | Version | État vérifié | Décision |
|---|---:|---|---|
| `/boutique/` | 2.7.52 | Coque premium, tri, produit, quick-view, axe zéro en Chromium mobile | **Pass-scope**; matrice complète et performance encore ouvertes |
| `/store-manager/orderslist/` | 2.7.43 | Redirection vers `#orders`, shell custom, axe zéro sur cas exécutés | **Pass-scope** |
| `/store-manager/products/` | 2.7.44 | Redirection vers `#menu`, shell custom, axe zéro sur cas exécutés | **Pass-scope** |
| `/store-manager/reviews/` | 2.7.46 | Drawer avis custom, axe zéro sur cas exécutés | **Pass-scope**; jeu d’avis non vide WebKit non prouvé |
| `/store-manager/products-manage/` sans ID | 2.7.48 | Retour vers `#menu`, wizard d’ajout conservé | **Pass-scope** |
| `/store-manager/profile/` | 2.7.52 | Redirection vers `#profile`, shell custom, WCFM absent, axe zéro | **Pass-scope validé** |
| `/store-manager/settings/` | 2.7.47 + 2.7.52 | Formulaire WCFM/TinyMCE et contrôles avancés conservés | **Non approuvé** |
| `/store-manager/payments/` | 2.7.49 + 2.7.52 | Tableau WCFM, retraits et exports conservés; contrôle post-déploiement bloqué | **Non approuvé / blocked post-check** |
| `/store-manager/products-manage/{id}` | 2.7.48 | Autorisation WCFM restrictive respectée | **Non migré, non approuvé** |

## Preuves du déploiement 2.7.52

WordPress a affiché la comparaison « Installé 2.7.51 / Téléversé 2.7.52 », puis a confirmé « Le thème a bien été mis à jour ». Les sondes HTTP bornées ont obtenu HTTP 200 pour `/`, `/boutique/` et `/store-manager/`. Les contrôles statiques locaux ont linté 12 fichiers PHP sans erreur; les harnais JavaScript de route et boutique passent `node --check`; `git diff --check` est propre.

## Gate profile 2.7.52

| Moteur | Format | Shell custom | Shell WCFM | Axe | Console | Réseau | Verdict |
|---|---|---:|---:|---:|---:|---:|---|
| Chromium | mobile 390 | oui | non | 0 | 0 | 0 | PASS-scope |
| Firefox | mobile 390 | oui | non | 0 | erreurs de téléchargement de polices | aborts fonts/admin-ajax | PASS fonctionnel/a11y, anomalie conservée |
| WebKit | mobile 390 | oui | non | 0 | 0 | annulations admin-ajax/ressources admin | PASS fonctionnel/a11y, anomalie conservée |
| Chromium | desktop | oui | non | 0 | 0 | 0 | PASS-scope |

Dans le cas Chromium mobile, le lien `Ouvrir les réglages actuels →` pointe vers `/store-manager/settings/`. La façade ne supprime donc pas la capacité avancée WCFM et aucune sauvegarde n’a été déclenchée. Les sorties Firefox/WebKit sont des preuves fonctionnelles et d’accessibilité dans leur périmètre; leurs signaux réseau empêchent de les présenter comme des exécutions totalement propres.

## Non-régression boutique 2.7.52

Le gate Chromium mobile sur 390×844 confirme HTTP 200, hero et grille premium, neuf produits, tri réellement appliqué, fiche produit HTTP 200 avec shell produit, quick-view avec contenu, zéro lien `products-manage`, zéro lien vendeur vide, aucun débordement horizontal, zéro élément focusable masqué, zéro erreur console et zéro violation axe. Trois requêtes WCFM `notification.mp3` ont été annulées; ce comportement legacy reste documenté comme signal réseau non bloquant, pas comme un pass silencieux.

## Contrats avancés décidés avant tout nouveau code

La route payments ne sera pas redirigée tant qu’un contrat de lecture, d’ownership, de nonce, de période bornée, d’absence de PII et de parité des totaux WooCommerce/WCFM n’est pas prouvé. Le premier incrément recommandé est une synthèse lecture seule; exports, retraits, remboursements et coordonnées sensibles restent en mode avancé WCFM. Le probe payments post-2.7.52 a expiré après 45 secondes pendant `page.goto`; il est classé `blocked`, sans conclusion positive sur le rendu.

La route settings contient deux formulaires, 264 contrôles, TinyMCE, médias, visibilité, horaires, politiques, expédition et coordonnées bancaires. Le prochain incrément doit commencer par une synthèse lecture seule et un mapping des API WCFM; il est interdit de fabriquer un faux formulaire ou de masquer les défauts structurels par CSS. Aucun réglage non-QA n’a été modifié.

Les contrats détaillés sont conservés dans `payments-migration-contract-2752.md` et `settings-migration-contract-2752.md`.

## État des lots CDC

| Lot | État honnête | Motif principal |
|---:|---|---|
| 0–2 | fortement prouvés dans leurs périmètres | preuves historiques multi-moteur et contrôles métier disponibles, sans extrapolation aux lots restants |
| 3 | partiel | onboarding multi-moteur et restauration protégée encore incomplets |
| 4 | partiel à vérifier | couverture du tour, clavier et reprise à maintenir dans la matrice courante |
| 5 | partiel | endpoints anonymes/authentifiés sécurisés; notification native, son et vibration non totalement prouvés |
| 6 | partiel | refresh client sans reload prouvé sur scénario QA Chromium; Firefox/WebKit et robustesse restant à rejouer |
| 7–8 | non globalement approuvés | couverture et décisions de release à consolider |
| 9–11 | non globalement approuvés | palettes, décision paiement et documentation complète non fermées comme release |
| 12 | non approuvé | Lighthouse/TTFB Hostinger et actions dégradées au-dessus des objectifs |

## Risques et prochaines gates

La prochaine modification de code ne doit pas migrer payments ou settings par simple redirection. Elle doit d’abord produire les contrats serveur, les tests non connecté/nonce/ownership et une vue lecture seule pour le vendeur QA, puis passer axe, clavier, responsive et rollback. Les actions financières et les exports ne doivent pas être simulés comme réussis.

Les travaux de release restent ouverts sur les quatre formats CDC et les trois moteurs, les deux passes Lighthouse par route, le TTFB p75, LCP/CLS/TBT, les captures Pixelmatch, le téléphone réel, le lecteur d’écran natif, les tests reduced motion/forced colors, la reprise réseau et le rollback vérifié. La version actuelle peut être décrite comme **progression premium vérifiée par sous-périmètres**, jamais comme « 100 % conforme ».

## Références d’audit

| Référence | Contenu |
|---|---|
| `qa/vendor-secondary-profile-transition-2752.json` | Profile Chromium mobile, shell custom et axe zéro |
| `qa/vendor-secondary-profile-transition-2752-firefox-mobile.json` | Profile Firefox mobile et anomalies réseau |
| `qa/vendor-secondary-profile-transition-2752-webkit-mobile.json` | Profile WebKit mobile et annulations réseau |
| `qa/vendor-secondary-profile-transition-2752-chromium-desktop.json` | Profile Chromium desktop |
| `qa/ultra-premium-boutique-chromium-mobile-2752.json` | Gate boutique Chromium mobile 2.7.52 |
| `qa/vendor-secondary-payments-preservation-2752.json` | Contrôle payments post-déploiement classé blocked |
| `qa/vendor-secondary-payments-audit-2748.json` | Inventaire payments WCFM antérieur |
| `qa/vendor-secondary-settings-chromium-mobile.json` | Inventaire settings WCFM/TinyMCE |
| `qa/ultra-premium-up3-vendor-transition-report.md` | Rapport UP-3 consolidé |
| `qa/vendor-secondary-audit-report.md` | Cartographie détaillée des routes vendeur |
| `qa/payments-migration-contract-2752.md` | Contrat payments lecture seule |
| `qa/settings-migration-contract-2752.md` | Contrat settings progressif |
| `docs/CDC-ULTRA-PREMIUM.md` | CDC gouvernant |

## Mise à jour corrective 2.7.53 — options, sauces et suppléments textuels

Le bug signalé sur le parcours « Sauce » a été reproduit puis corrigé. Avant correction, une option avec une seule réponse était rejetée par le serveur malgré HTTP 200, avec `success=false` et le message demandant au moins deux choix. Le thème 2.7.53 accepte désormais un choix unique, conserve la portée de catégorie via `category_slugs`, l’expose au wizard sous `categorySlugs` et filtre les choix disponibles selon la catégorie du plat. Les anciens groupes sans portée restent globaux pour préserver la compatibilité.

Le déploiement WordPress est confirmé. L’archive `restocommerce-theme-2.7.53-option-groups.zip` porte le SHA-256 `94a8ca2da66d9dcaaeb8e4265b35471c82ff4ee93bad29802b14dfa0c950558b`. Les preuves `option-groups-e2e-2753.json`, `option-groups-wizard-ui-2753-v3.json`, `option-groups-category-filter-2753.json`, `option-groups-public-verify-2753.json` et `option-groups-cart-verify-2753-v4.json` sont disponibles dans `qa/`.

Le scénario QA a persisté une option `Sauce` avec le choix `Mayonnaise`, l’a associée à un produit de la catégorie `Plats`, puis a vérifié son rendu sur la fiche publique et son transport au panier. La sélection client n’a pas été poussée au checkout. Aucun paiement, retrait, export ou WhatsApp n’a été exécuté.

Limite restante : les choix sont actuellement des libellés sans supplément tarifaire individuel. Le correctif valide la persistance, la portée catégorie et la sélection; il ne doit pas être présenté comme une gestion de majorations de prix pour suppléments. Celle-ci nécessite un contrat de données et une validation financière séparés.
