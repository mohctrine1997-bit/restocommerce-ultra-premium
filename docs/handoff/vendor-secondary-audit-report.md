# Audit secondaire vendeur WCFM — 25 août 2026

## Périmètre

Les routes ont été chargées après connexion du vendeur QA, en Chromium mobile 390×844, sans clic de sauvegarde, sans mutation de produit, de commande, de profil ou d’avis. Le probe `vendor-secondary-route-audit.mjs` collecte le shell, les contrôles, les liens, les erreurs et axe-core 4.13.0. Les identifiants, mots de passe, cookies, nonces et clés de commande ne sont pas consignés.

## Résultats

| Route | Shell observé | Violations axe principales | Console | Décision |
|---|---|---|---|---|
| `/store-manager/settings/` | WCFM/TinyMCE legacy | 13 `nested-interactive`, 12 `button-name`, 5 `image-alt`, 4 `link-name`, contraste, `aria-progressbar-name` | 0 erreur applicative | Non approuvée |
| `/store-manager/orderslist/` | tableau WCFM + exports | 8 contrastes, `select-name`, `aria-input-field-name`, image/link sans nom, en-têtes vides | 0 erreur applicative | Non approuvée |
| `/store-manager/products/` | tableau WCFM + actions techniques | 15 `link-name`, 8 contrastes, Select2 sans nom, en-têtes vides, image sans alt | 0 erreur applicative | Non approuvée |
| `/store-manager/profile/` | formulaire WCFM/TinyMCE | 13 `nested-interactive`, 12 `button-name`, 2 `image-alt`, 3 `link-name`, headings et rôles | 0 erreur applicative | Non approuvée |
| `/store-manager/reviews/` | table/onglets WCFM | 5 contrastes, 4 `link-name`, image sans alt, en-têtes vides, heading manquant | 0 erreur applicative | Non approuvée |

Les probes ont aussi montré la présence de liens techniques, d’exports et de contrôles WCFM dans le DOM. La présence du shell legacy est donc prouvée, et non déduite du seul style. Les requêtes de son WCFM `notification.mp3` sont parfois annulées dans les routes settings/orders/products/profile; elles sont notées comme anomalie réseau secondaire.

## Priorisation senior

La route boutique publique est validée dans son périmètre UP-2 en 2.7.42; ces cinq routes vendeur restent séparées. Le prochain lot doit construire une façade RestoCommerce pour les commandes actives et les actions fréquentes du menu, car ce sont les surfaces opérationnelles les plus exposées. La migration ne doit pas réécrire d’un seul coup les exports, commissions, rapports et réglages avancés : les fonctions WCFM serveur restent le moteur jusqu’à ce qu’un équivalent soit testé.

Les défauts axe ne doivent pas être neutralisés par une simple surcharge CSS. Chaque écran migré devra fournir une hiérarchie de titres, des noms de contrôles, des alternatives d’images, des tableaux réellement sémantiques ou une vue carte mobile, et un test de sauvegarde limité à des données QA. Les actions destructives resteront exclues des probes de lecture.


## Transition orderslist 2.7.43

Après déploiement, la transition `/store-manager/orderslist/` a été rejouée en vendeur QA sur Chromium mobile 390×844, Firefox mobile 390×844, WebKit mobile 390×844 et Chromium desktop 1440×1000. Les quatre cas aboutissent à `/store-manager/#orders`, exposent le shell RestoCommerce, n’exposent aucun shell WCFM, obtiennent zéro violation axe et zéro erreur console applicative. Firefox a signalé des aborts de ressources d’administration et WebKit des aborts d’admin-ajax/ressource d’administration; ces signaux réseau restent documentés mais n’ont pas affecté le rendu ni la navigation. La vue vide commandes est cohérente avec l’état du vendeur QA et aucune action métier n’a été déclenchée.


Le probe final Chromium mobile a également vérifié explicitement `ordersPanelVisible=true`, `ordersPanelActive=true` et `orderListPresent=true` après redirection. La route ne se contente donc pas de changer d’URL : elle ouvre effectivement le panneau commandes RestoCommerce actif, avec l’état vide QA attendu.


## Transition products 2.7.44

Le thème 2.7.44 ajoute la redirection authentifiée de `/store-manager/products/` vers `/store-manager/#menu`. L’archive déployée est `staging-install/restocommerce-theme-2.7.44-index-transitions.zip`, SHA-256 `64dea38bf565bce66afc44e8b134e4fbe703722b4eb8cf2bdf4412b419d5b271`. Le probe Chromium mobile confirme login réussi, URL finale `/store-manager/#menu`, shell RestoCommerce présent, shell WCFM absent, contenu du menu visible avec les produits QA existants, zéro violation axe, zéro erreur console et aucune mutation.

Cette transition couvre l’index fréquent du menu. Les routes `products-manage/{id}`, réglages, profil et avis restent des surfaces avancées ou legacy séparées, non déclarées migrées.


La transition products 2.7.44 a été rejouée en Firefox mobile et WebKit mobile : les deux moteurs aboutissent à `/store-manager/#menu`, rendent le shell custom et le contenu du menu, n’exposent pas le shell WCFM, et obtiennent axe zéro et console applicative zéro. Firefox/WebKit ont signalé des aborts de ressources `admin-ajax.php`/administration sans impact sur la route; ces signaux restent dans les artefacts JSON.


## Transition reviews 2.7.46

La route `/store-manager/reviews/` a été raccordée à `#reviews`; le dashboard active alors `#profile` et ouvre automatiquement le drawer custom des avis vérifiés. Le défaut axe initial `aria-allowed-role` du drawer a été corrigé en remplaçant l’élément `aside[role=dialog]` par un conteneur `div[role=dialog]`. Archive 2.7.46 : `staging-install/restocommerce-theme-2.7.46-reviews-a11y.zip`, SHA-256 `8e30380f30a93f69e6ac4ce05431622f9f4b4587c221fae959be098742e698b0`.

Les probes Chromium mobile, Firefox mobile, WebKit mobile et Chromium desktop confirment login réussi, drawer visible, liste d’avis présente, shell custom, shell WCFM absent, zéro violation axe et zéro erreur console applicative. Chromium fournit le résumé `Aucun avis vérifié pour le moment.`; WebKit laisse le résumé vide alors que le message d’état est présent, avec des aborts d’admin-ajax documentés. Aucun avis n’a été publié, signalé ou modifié.


Le probe WebKit patient (attente jusqu’à 5 s) confirme que la divergence n’est pas une mesure trop précoce : le drawer reste visible et la liste contient l’état vide `Les avis vérifiés apparaîtront ici après une commande terminée.`, tandis que `data-rc-review-summary` reste vide et que des requêtes admin-ajax sont annulées. Comme le vendeur QA ne possède aucun avis, l’UX vide est correcte, mais la parité de chargement d’un jeu d’avis non vide n’est pas prouvée sur WebKit.


## Transition products-manage sans identifiant 2.7.48

Le point d’entrée WCFM `/store-manager/products-manage/` sans identifiant est désormais redirigé vers `/store-manager/#menu`, où le bouton `Ajouter un plat` ouvre le wizard RestoCommerce. Le probe Chromium mobile QA confirme login réussi, URL finale `#menu`, shell custom présent, shell WCFM absent, contenu du menu visible, zéro violation axe, zéro erreur console et aucune mutation. Archive 2.7.48 : `staging-install/restocommerce-theme-2.7.48-product-add-transition.zip`, SHA-256 `8222c05fd6ec9817f30ecb3e0577a8b7d09483d38a5f68faa0511b155ad8e436`.

Cette règle ne concerne pas les routes `products-manage/{id}` d’édition d’un plat existant, qui restent non migrées et protégées par les garde-fous WCFM existants.


La transition products-manage sans identifiant a aussi été rejouée en Firefox mobile et WebKit mobile. Les deux moteurs aboutissent à `#menu`, rendent le shell custom et le menu, n’exposent pas WCFM et obtiennent axe zéro. Firefox a toutefois enregistré des erreurs de chargement de polices Google et des aborts admin-ajax; WebKit a enregistré des aborts de ressources d’administration. Ces signaux d’environnement réseau sont conservés comme limites de parité, sans être présentés comme inexistants.


## Bandeau payments 2.7.49

Le déploiement 2.7.49 ajoute le même repère `Atelier du Service` à `/store-manager/payments/`. Chromium mobile confirme `transitionBannerVisible: true` avec le libellé `Paiements et transactions` et le lien `Revenir au cockpit`. La route reste WCFM (`wcfmShell: true`) et le gate axe reste en échec sur color-contrast, empty-table-header, image-alt, link-name, page-has-heading-one et select-name. Aucune opération financière, impression ou export n’a été exécuté.


## Contrôle négatif des endpoints AJAX — 2.7.49

Les quatre endpoints vendeur de notifications, compteurs, marquage lu et préférences refusent un POST anonyme sans cookie ni nonce par HTTP 400 (`0`). La preuve sanitizée est `qa/security-negative-vendor-ajax-2749.json`. Le contrôle confirme la barrière d’accès publique, mais ne prouve pas encore le comportement avec nonce invalide sous session QA ni la notification native navigateur/son/vibration.


## Garde-fou nonce authentifié

Un vendeur QA authentifié a appelé les quatre endpoints AJAX avec un nonce invalide; chaque réponse a été HTTP 403, corps `-1`. Preuve : `qa/security-negative-vendor-ajax-auth-2749.json`. Les secrets d’authentification ne sont pas inclus. La sécurité du contrôle d’accès est ainsi prouvée sur ce périmètre; la preuve sonore, vibration et notification navigateur reste séparée.

## Transition profile 2.7.52

Après remplacement WordPress confirmé de 2.7.51 par 2.7.52 (archive `restocommerce-theme-2.7.52-profile-transition-contrast.zip`, SHA-256 `69ed6686a9744ec6ca4727368a385244645dd46b519ea684158a8ff66f0ea87e`), `/store-manager/profile/` redirige vers `/store-manager/#profile`. Chromium mobile, Firefox mobile, WebKit mobile et Chromium desktop confirment le shell custom RestoCommerce, l’absence du shell WCFM et zéro violation axe. Le lien `Ouvrir les réglages actuels →` vers `/store-manager/settings/` reste présent; aucune capacité WCFM avancée n’a été contournée.

Chromium mobile et desktop sont propres côté console et réseau. Firefox conserve des erreurs de téléchargement des polices Google et des aborts `admin-ajax.php`; WebKit conserve des annulations `admin-ajax.php` et de ressources d’administration. Ces signaux sont des limites réseau documentées, pas des passes silencieux. La décision est donc **transition profile validée dans le périmètre fonctionnel/a11y exécuté; réglages avancés toujours non migrés**.
