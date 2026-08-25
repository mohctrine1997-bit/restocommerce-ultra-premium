# Rapport de recette Ultra Premium — UP-3

**Périmètre :** réduction progressive des écrans WCFM du parcours vendeur sur staging Hostinger.

**Staging :** `darkblue-spoonbill-498612.hostingersite.com`

**Dernier thème déployé :** RestoCommerce 2.7.52.

**Statut global :** sous-lot partiellement validé; le CDC Ultra Premium global reste non approuvé.

## Résumé exécutif

Les index vendeur fréquents ne présentent plus directement le chrome WCFM. Les routes commandes, index produits, ajout de produit sans identifiant, avis et profil transitionnent vers des surfaces RestoCommerce contrôlées. La route réglages reste rendue par WCFM avec un bandeau d’orientation `Atelier du Service`, et la route paiements conserve le tableau WCFM avec le même principe. Les écrans d’édition d’un produit par identifiant restent protégés par les autorisations WCFM et ne sont pas redirigés arbitrairement.

## Matrice des changements et preuves

| Surface | Version | Résultat | Axe | Mutation | Limite |
|---|---:|---|---:|---|---|
| `/store-manager/orderslist/` | 2.7.43 | Redirection vers panneau `#orders` actif | 0 | Aucune | Couverture multi-moteur limitée aux cas exécutés |
| `/store-manager/products/` | 2.7.44 | Redirection vers `#menu` actif | 0 | Aucune | Aucun écran d’édition avancée couvert par cette règle |
| `/store-manager/reviews/` | 2.7.46 | Redirection vers drawer avis | 0 sur cas exécutés | Aucune | WebKit ne prouve pas encore un jeu d’avis AJAX non vide |
| `/store-manager/products-manage/` | 2.7.48 | Redirection vers `#menu`, bouton `Ajouter un plat` visible | 0 | Aucune | Ouverture automatique du wizard non déclenchée par l’URL |
| `/store-manager/settings/` | 2.7.47 | Bandeau visible; contenu WCFM conservé | Échec WCFM | Aucune | Défauts axe legacy documentés |
| `/store-manager/profile/` | 2.7.52 | Redirection vers `#profile`, shell custom | 0 sur cas exécutés | Aucune | Réglages avancés WCFM toujours non migrés |
| `/store-manager/payments/` | 2.7.49 | Bandeau visible; tableau WCFM conservé | Échec WCFM | Aucune | Surface financière et exports à migrer séparément |
| `/store-manager/products-manage/200/` | 2.7.48 | Écran WCFM restreint | Échec WCFM | Aucune | Ne pas contourner l’autorisation; décider plus tard entre éditeur autorisé et état métier propre |

## Sécurité et notifications

Les POST anonymes vers les quatre endpoints vendeur de notifications, compteurs et préférences retournent HTTP 400. Avec une session vendeur QA et un nonce volontairement invalide, ces mêmes quatre endpoints retournent HTTP 403. Les preuves sont `security-negative-vendor-ajax-2749.json` et `security-negative-vendor-ajax-auth-2749.json`.

La preuve live existante a observé l’augmentation réelle du compteur de commandes et des notifications après une commande QA. Le code contient les chemins son, vibration et notification navigateur conditionnés par les préférences et la permission. La preuve native de ces trois signaux sur un nouvel événement et la parité multi-moteur restent ouvertes.

## Déploiements

| Version | Archive | SHA-256 |
|---:|---|---|
| 2.7.43 | `restocommerce-theme-2.7.43-orders-transition.zip` | `700c66d608d163f0c4f12be0f02a059cf55daf8a8b7fbd52de510ea0076d4d57` |
| 2.7.44 | `restocommerce-theme-2.7.44-index-transitions.zip` | `64dea38bf565bce66afc44e8b134e4fbe703722b4eb8cf2bdf4412b419d5b271` |
| 2.7.45 | `restocommerce-theme-2.7.45-reviews-transition.zip` | `4e9f1c7dcd40f0bd86a0070abf229b5627afa1c1b0c4482e2976fcf37a54c573` |
| 2.7.46 | `restocommerce-theme-2.7.46-reviews-a11y.zip` | `8e30380f30a93f69e6ac4ce05431622f9f4b4587c221fae959be098742e698b0` |
| 2.7.47 | `restocommerce-theme-2.7.47-legacy-banner.zip` | `7a370dffce7e4ba91bbedf0383c10469c26c16c113c29f167100a5c302cbff7b` |
| 2.7.48 | `restocommerce-theme-2.7.48-product-add-transition.zip` | `8222c05fd6ec9817f30ecb3e0577a8b7d09483d38a5f68faa0511b155ad8e436` |
| 2.7.49 | `restocommerce-theme-2.7.49-payments-banner.zip` | `8569c160be0267da57329dac9fcf187cc9716c082c36dc265ec956fc85d0ba83` |
| 2.7.50 | `restocommerce-theme-2.7.50-client-tracking.zip` | `f449bb4918242aa0e08a837b2220aa256efeca19061ad307ae50ee0f27b1bf13` |
| 2.7.52 | `restocommerce-theme-2.7.52-profile-transition-contrast.zip` | `69ed6686a9744ec6ca4727368a385244645dd46b519ea684158a8ff66f0ea87e` |

## Décision de sous-lot

Le sous-lot est **accepté comme migration progressive partielle**. Il n’est pas acceptable de déclarer le cockpit vendeur entièrement Ultra Premium : l’écran WCFM settings et l’écran WCFM payments demeurent présents, les paiements ne sont pas migrés, et le signal natif notifications n’est pas encore prouvé dynamiquement sur tous les moteurs. Aucune donnée non-QA n’a été modifiée, aucun paiement n’a été effectué et aucun lien WhatsApp n’a été ouvert.

## Lot 6 — refresh client sécurisé livré en 2.7.50

Le suivi de commande public est maintenant actualisé par polling conditionné à la visibilité de la page. Le reçu transporte uniquement les données déjà nécessaires à son affichage et l’endpoint exige nonce, identifiant de commande et clé WooCommerce correspondante; la réponse ne renvoie que les états et étapes par vendeur, sans PII ni montant.

Le probe `lot6-live-1787619636925.json` confirme une commande QA démarrant sur `Reçue`, une transition vendeur HTTP 200 et l’affichage de `En préparation` sans reload du client. Le scénario comporte un 404 réseau isolé capturé, sans impact fonctionnel. La preuve native notifications navigateur/son/vibration reste distincte et non totalement rejouée.

## Non-régression boutique après 2.7.50

Le gate Chromium mobile `ultra-premium-boutique-chromium-mobile-2750.json` reste vert : HTTP 200, structure premium, 9 produits, tri réel, fiche produit HTTP 200, quick-view ouvert, zéro lien manage WCFM, zéro lien vendeur vide, zéro overflow, zéro focus caché et axe zéro avec 43 règles passées. Deux aborts `notification.mp3` WCFM restent observés et documentés comme anomalie réseau legacy isolée.

## Profile restaurant — migration progressive 2.7.52

L’entrée `/store-manager/profile/` ouvre désormais `#profile` dans le cockpit RestoCommerce. Le probe Chromium mobile `vendor-secondary-profile-transition-2752.json` confirme shell custom présent, shell WCFM absent, axe zéro, console propre et aucune requête échouée. Le panneau conserve un accès explicite aux réglages avancés WCFM : la façade remplace l’écran fréquent sans supprimer l’édition métier non encore migrée.

## Déploiement 2.7.52 et matrice profile

WordPress a confirmé « Le thème a bien été mis à jour » après remplacement de 2.7.51 par l’archive `restocommerce-theme-2.7.52-profile-transition-contrast.zip` (SHA-256 `69ed6686a9744ec6ca4727368a385244645dd46b519ea684158a8ff66f0ea87e`). Les routes `/`, `/boutique/` et `/store-manager/` ont répondu HTTP 200 lors du contrôle borné.

| Moteur | Format | Shell custom | Shell WCFM | Axe | Console | Requêtes échouées | Décision |
|---|---|---:|---:|---:|---:|---:|---|
| Chromium | mobile 390 | oui | non | 0 | 0 | 0 | PASS |
| Firefox | mobile 390 | oui | non | 0 | erreurs de téléchargement de polices | aborts fonts/admin-ajax | PASS fonctionnel/a11y, anomalie réseau conservée |
| WebKit | mobile 390 | oui | non | 0 | 0 | annulations admin-ajax/ressources admin | PASS fonctionnel/a11y, anomalie réseau conservée |
| Chromium | desktop | oui | non | 0 | 0 | 0 | PASS |

La vérification Chromium mobile a aussi confirmé la présence du lien `Ouvrir les réglages actuels →` vers `/store-manager/settings/`. Aucun réglage, paiement ou donnée non-QA n’a été modifié. La migration du formulaire settings reste non approuvée.

## Non-régression boutique 2.7.52

Le gate `ultra-premium-boutique-chromium-mobile-2752.json` est vert : HTTP 200, hero et grille premium, neuf produits, tri appliqué, produit HTTP 200, quick-view fonctionnel, zéro lien manage, zéro lien vendeur vide, axe zéro, zéro erreur console et aucun débordement horizontal. Les trois aborts `notification.mp3` sont conservés comme signaux legacy non bloquants et ne sont pas déclarés résolus.

## Payments : contrat préalable avant migration

La route `/store-manager/payments/` reste WCFM legacy et non approuvée. L’artefact `vendor-secondary-payments-audit-2748.json` documente la table de transactions vide, 129 contrôles et la présence de liens `IMPRIMER`, `PDF`, `EXCEL`, `CSV` ainsi que du retrait. Les violations axe `color-contrast`, `empty-table-header`, `image-alt`, `link-name`, `page-has-heading-one` et `select-name` restent présentes. Aucun export, retrait, impression, remboursement, paiement ou réglage financier n’a été déclenché.

Le contrat lecture seule est détaillé dans `payments-migration-contract-2752.md`. Il impose authentification, nonce, ownership, paramètres bornés, agrégation minimale, totaux WooCommerce/WCFM non recalculés côté front, absence de PII et états explicites chargement/vide/erreur/interdit. La façade ne sera pas déployée avant preuves de permissions, parité multi-moteur, axe/clavier, responsive et rollback.

## Settings : inventaire et contrat préalable

La route `/store-manager/settings/` reste WCFM legacy. L’artefact `vendor-secondary-settings-chromium-mobile.json` observe deux formulaires, 264 contrôles, TinyMCE, médias, visibilité, horaires, politiques, expédition et coordonnées bancaires. Les défauts axe sont structurels (`button-name`, `nested-interactive`, `image-alt`, `link-name`, `aria-progressbar-name`, `page-has-heading-one`, entre autres); ils ne peuvent pas être masqués honnêtement par CSS.

Le contrat de migration progressive est consigné dans `settings-migration-contract-2752.md`. Le prochain incrément est limité à une synthèse lecture seule, sans faux formulaire, sans rendu des coordonnées bancaires et sans modification des capacités WCFM. La route ne sera pas redirigée avant preuves de mapping, nonce, ownership, nettoyage TinyMCE, restauration, axe/clavier et matrice multi-moteur.

## Payments après 2.7.52 : contrôle bloqué

Une tentative non destructive de relecture Chromium mobile de `/store-manager/payments/` après 2.7.52 a été interrompue par un timeout Playwright de 45 s pendant `page.goto` vers la route payments. L’artefact `vendor-secondary-payments-preservation-2752.json` est classé **blocked** : il ne contient pas de preuve de rendu, de bandeau ou d’axe. Aucune action financière n’a été déclenchée et la campagne n’a pas été relancée immédiatement afin de respecter la limitation WAF.

## 2.7.53 — correction du flux groupes d’options

Le flux options vendeur a été corrigé après reproduction sur le staging. La validation serveur autorise maintenant un groupe avec une seule réponse, comme une unique sauce, et chaque nouveau groupe peut recevoir la portée de la catégorie courante. Le wizard ne présente plus, pour une catégorie donnée, que les groupes globaux ou ceux dont `categorySlugs` correspond à cette catégorie. L’association finale reste explicite via la case du produit et est enregistrée dans `restocommerce_option_group_ids`.

La preuve de bout en bout couvre la sauvegarde d’une option `Sauce`/`Mayonnaise`, sa relecture dans l’éditeur du produit QA, son affichage public et son ajout au panier avec le choix conservé. Le filtrage `Plats` versus `Entrées` est également couvert. Les artefacts sont `option-groups-e2e-2753.json`, `option-groups-wizard-ui-2753-v3.json`, `option-groups-category-filter-2753.json`, `option-groups-public-verify-2753.json` et `option-groups-cart-verify-2753-v4.json`.

Décision : le sous-flux options texte est validé dans ce périmètre. Les majorations tarifaires de suppléments, les variations payantes et les effets financiers restent hors périmètre et non approuvés. Les aborts `notification.mp3` du plugin WCFM demeurent des signaux réseau legacy non bloquants, non assimilés à des passes.
