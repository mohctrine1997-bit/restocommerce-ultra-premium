# Analyse des écarts — cible ultra premium RestoCommerce

## Définition de travail

Un thème ultra premium n’est pas seulement un thème esthétique. Il doit être cohérent sur toutes les surfaces visibles, rapide dans les moments critiques, prévisible pour les technologies d’assistance, parfaitement adapté au mobile réel et dépourvu d’écrans techniques non harmonisés dans le parcours principal.

La cible RestoCommerce est donc la combinaison de cinq qualités : identité visuelle distinctive, hiérarchie et microcopy impeccables, continuité entre client et restaurateur, performance mesurée et robustesse d’exploitation. Une seule capture réussie ne suffit pas à la certification.

## Écarts observés sur le staging

| Domaine | Preuve actuelle | Écart à traiter |
| --- | --- | --- |
| Identité visuelle | Palette, typographie éditoriale, cartes et cockpit custom validés sur plusieurs captures | Harmoniser toutes les routes et réduire la dépendance visuelle aux écrans WCFM |
| WCFM legacy | Les routes secondaires `/store-manager/*` restent rendues par WCFM classique | Remplacer progressivement les surfaces fréquentes par une coque RestoCommerce cohérente, en conservant WCFM pour les fonctions d’administration non refaites |
| Performance | Lighthouse post-2.7.35 environ 70–87; TTFB staging élevé et variable | Budget performance, réduction du TTFB, cache, images et JS/CSS conditionnels; ne pas accepter un score isolé non reproductible |
| Actions critiques | Transitions commande 858–895 ms; publication 3 524 ms; ajout panier visible 1 568 ms | Retour visuel immédiat avant réseau, états optimistes sûrs, réduction du travail bloquant et objectifs p95 |
| Responsive | Chromium 390/768/1440/1920 très fortement couvert; Firefox/WebKit partiellement couvert | Matrice complète sur toutes les surfaces et vrais tests tactiles |
| Accessibilité | axe zéro dans les campagnes exécutées; focus et rôles documentés | Lecteur d’écran natif, clavier intégral, zoom 200 %, reduced motion et erreurs réseau à compléter |
| Temps réel | Badge vendeur dynamique par polling; suivi client actualisé après reload | Polling client sécurisé ou SSE/WebSocket selon architecture, notifications documentées et testées |
| Checkout | Parcours WhatsApp sans paiement réel | Décision métier explicite avant toute passerelle; ne jamais confondre demande, confirmation et paiement |
| Qualité visuelle | Captures contact Chromium et Pixelmatch sur périmètre précédent | Baseline, seuil de diff, captures multi-moteur et revue humaine par breakpoint |

## Conséquence de gouvernance

Le nouveau CDC doit séparer les exigences obligatoires de release, les améliorations premium de niveau 2 et les décisions métier hors code. Chaque exigence doit avoir une preuve attendue, une mesure, un propriétaire et une condition de sortie. Aucun « 100 % » ne doit être utilisé si un moteur, un appareil, une surface legacy ou un seuil mesurable reste non vérifié.


## Audit P0 secondaire — `/store-manager/settings/` — 25 août 2026

Le probe vendeur QA non destructif a chargé `/store-manager/settings/` après authentification en Chromium mobile 390×844. La route reste une surface WCFM classique : l’écran expose le shell WCFM et l’éditeur de profil/paramètres, avec un rendu technique distinct du cockpit RestoCommerce. Axe détecte 13 nœuds `aria-allowed-role`/`nested-interactive` liés aux contrôles TinyMCE, 12 `button-name`, 5 `image-alt`, 4 `link-name`, 1 contraste et 1 `aria-progressbar-name`; aucune erreur console applicative n’a été observée, mais un son WCFM `notification.mp3` est annulé par le navigateur.

Décision de lot : **route secondaire non approuvée**. Le défaut est structurel dans l’écran WCFM et ne doit pas être masqué par une simple couche CSS. Priorité suivante : concevoir une coque RestoCommerce pour les paramètres restaurateur fréquents, puis migrer les champs par sous-section en conservant les contrôles serveur WCFM nécessaires. Les actions de sauvegarde ne sont pas déclenchées dans ce probe; aucune donnée de production ni réglage métier n’a été modifié.


## Audit P0 secondaire — `/store-manager/orderslist/` — 25 août 2026

Le probe vendeur QA en Chromium mobile 390×844 a chargé la liste de commandes WCFM sans déclencher d’action. La route rend le tableau technique, les exports IMPRIMER/PDF/EXCEL/CSV, les filtres historiques et plusieurs liens techniques. Axe détecte `aria-input-field-name` serious sur Select2, 8 contrastes serious, `image-alt` critical sur l’image d’en-tête vendeur, 3 `link-name` serious, `select-name` critical sur `#commission-status`, `empty-table-header` minor et `page-has-heading-one` moderate. Aucune erreur console applicative n’est signalée; le son WCFM est encore annulé.

Décision : **route non approuvée et prioritaire après les réglages**. La migration doit commencer par un écran de commandes RestoCommerce lisible, en conservant les contrôles d’export et les données WCFM uniquement derrière une façade accessible. Le probe n’a modifié ni commande ni statut.


## Audit P0 secondaire — `/store-manager/products/` — 25 août 2026

Le probe vendeur QA en Chromium mobile 390×844 a chargé la table de produits WCFM sans mutation. L’écran rend les actions techniques d’édition, duplication, archivage et suppression, des colonnes de tableau et un Select2 de catégorie. Axe détecte `aria-input-field-name` serious, 8 contrastes serious, `image-alt` critical, 15 `link-name` serious, 6 `empty-table-header` minor et `page-has-heading-one` moderate. Les liens d’action sont présents dans le DOM, y compris des liens sans nom accessible; aucune erreur console applicative n’est signalée, le son WCFM est annulé.

Décision : **route non approuvée**. Le cockpit custom couvre déjà la gestion courante du menu pour le parcours principal, mais cette route avancée demeure à migrer ou à envelopper d’une transition RestoCommerce avant d’être exposée comme expérience premium. Aucun produit n’a été créé, modifié, archivé ou supprimé par ce probe.


## Audit P0 secondaire — `/store-manager/profile/` — 25 août 2026

Le probe vendeur QA en Chromium mobile 390×844 a chargé le profil restaurateur sans sauvegarde. La route reste WCFM/TinyMCE et axe détecte 13 défauts de rôles/nested-interactive liés à l’éditeur, 12 `button-name` critical, 2 `image-alt` critical, 3 `link-name` serious, 2 `page-has-heading-one` moderate et des conflits de rôle de présentation. Aucune erreur console applicative n’a été observée; le son WCFM est annulé.

Décision : **route non approuvée**. La migration devra isoler les champs réellement fréquents du profil et remplacer progressivement l’éditeur riche technique par des champs RestoCommerce nommés, avec confirmation avant sauvegarde. Le probe n’a déclenché aucune écriture.


## Audit P0 secondaire — `/store-manager/reviews/` — 25 août 2026

Le probe vendeur QA en Chromium mobile 390×844 a chargé la liste des avis sans mutation. La route rend les onglets WCFM Tout/Approuvé/en attente et les actions de gestion d’avis. Axe détecte 5 contrastes serious, 2 `empty-table-header` minor, 1 `image-alt` critical, 4 `link-name` serious et 1 `page-has-heading-one` moderate. Aucune erreur console ni requête échouée n’a été capturée dans ce cas.

Décision : **route non approuvée**. Le futur écran RestoCommerce doit présenter les avis vérifiés avec leur état et leurs actions explicites, sans réintroduire le tableau technique WCFM. Aucun avis n’a été publié, approuvé ou supprimé.


## UP-3 transition orderslist — 2.7.43 — 25 août 2026

Une première correction P0 a été appliquée sans toucher aux commandes : les vendeurs authentifiés qui demandent `/store-manager/orderslist/` sont redirigés en HTTP 302 vers `/store-manager/#orders`, où le panneau commandes RestoCommerce réutilise `restocommerce_vendor_orders()` et les contrôles d’accès déjà présents. L’archive 2.7.43 a été installée par WordPress; SHA-256 `700c66d608d163f0c4f12be0f02a059cf55daf8a8b7fbd52de510ea0076d4d57`.

Le probe Chromium mobile QA authentifié confirme `login.failed=false`, URL finale `/store-manager/#orders`, shell custom présent, shell WCFM absent, zéro violation axe, zéro erreur console et aucune requête échouée. La vue contient l’état vide attendu pour le vendeur QA (`Aucune commande à suivre`) et ne déclenche aucune mutation. Cette preuve valide la **transition** de la route orderslist, pas encore la migration complète des exports, filtres historiques ou écrans avancés WCFM.


## UP-3 transition visible des routes avancées — 2.7.47 — 25 août 2026

Le thème 2.7.47 ajoute `vendor-legacy-transition.css` et un bandeau `Atelier du Service` sur `/store-manager/settings/` et `/store-manager/profile/`. Le bandeau expose le contexte de la route et un lien accessible vers `/store-manager/#overview`; il ne modifie aucun champ WCFM et ne supprime aucune fonctionnalité avancée pendant la migration.

Chromium mobile QA confirme le bandeau visible sur les deux routes. Les pages restent volontairement classées **legacy non approuvées** : settings conserve notamment `aria-progressbar-name`, contraste, image-alt, link-name et heading-one; profile conserve image-alt, link-name et heading-one. Le bandeau améliore l’orientation mais ne constitue pas une correction axe de WCFM.


## Audit `products-manage/200` — 25 août 2026

Le probe Chromium mobile authentifié de `/store-manager/products-manage/200/` retourne l’écran WCFM « Restricted Product: You don't have permission to access this page », avec shell WCFM présent, aucun heading principal et zéro formulaire. Axe relève color-contrast, image-alt, link-name et page-has-heading-one. La route n’est pas redirigée par 2.7.48 : il serait incorrect de la confondre avec l’entrée d’ajout sans identifiant. Une migration future doit d’abord vérifier le propriétaire réel du produit et choisir entre un éditeur RestoCommerce autorisé, une 404 métier propre ou une redirection contrôlée; aucun contournement d’autorisation n’est acceptable.


## Audit `/store-manager/payments/` — 25 août 2026

Le probe Chromium mobile vendeur QA confirme un tableau WCFM de transactions, vide pour la période observée, avec un formulaire et 129 contrôles, des actions d’export/print visibles et un shell WCFM. Axe relève color-contrast, empty-table-header, image-alt, link-name, page-has-heading-one et select-name. La surface reste legacy et non approuvée. Aucun export, paiement, retrait ou autre mutation n’a été déclenché; la future migration devra traiter séparément confidentialité financière, filtres de période et exports autorisés.
