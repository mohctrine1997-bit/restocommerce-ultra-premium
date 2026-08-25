# RestoCommerce — Journal d’audit Lots 1 à 3

> Document de travail. Il ne constitue pas une validation de lot et ne remplace pas les rapports de recette finaux.

## Garde-fou de données

Conformément à l’instruction explicite de l’utilisateur, aucune action de ce chantier ne doit supprimer, désactiver, archiver ni modifier un compte, produit, média, commande ou donnée de recette existant sans une nouvelle autorisation explicite. Les recettes de routes ajoutées dans cette passe sont conçues pour être **strictement en lecture seule**.

## Constats de staging — correctif P0 2.4.8

| Élément contrôlé | Constat | Conséquence de correction |
| --- | --- | --- |
| Thème actif | Le CSS public sert `Version: 2.4.8` après purge LiteSpeed. | Les tests suivants doivent cibler cette version. |
| Extension checkout WhatsApp | L’extension active est en version `0.1.2`. | La résolution du contact d’aide est désormais centralisée côté serveur ; aucun numéro n’est conservé dans les fallback JavaScript. |
| Fiche canonique | La fiche connue répond `200`, possède un titre éditorial et une canonical vers `/restaurant/{slug}/`. | Préserver cette route et son contrôle de non-régression. |
| Route legacy | `/store/{slug}/` retourne une redirection vers la fiche canonique. | Vérifier la chaîne de redirection, sans exiger un template WCFM visible. |
| Route commande | `/commande/` redirige vers la route effective `/commander/`, qui rend un formulaire de checkout WooCommerce réel. | La recette doit vérifier la destination finale, pas supposer une URL de checkout anglaise. |
| Marquage WCFM du `<body>` | Le `<body>` porte des classes WCFM Marketplace, mais aucun conteneur WCFM générique n’est rendu dans le contenu public. | La recette ne doit pas traiter les seules classes du `<body>` comme une régression d’interface. |

## État de la recette de routes

La première exécution multi-moteurs a été arrêtée car son traitement monolithique pouvait attendre trop longtemps sur un sélecteur. La recette sera découpée par route et par contexte, avec collecte d’erreur individuelle et délais bornés. Aucun contenu staging n’a été créé, modifié ou supprimé pendant cette tentative.

## Écarts observés lors de la reprise Chromium mobile

La première passe ciblée Chromium mobile de la recette granulaire a confirmé les réponses HTTP attendues pour les routes contrôlées, mais a mis en évidence trois sélecteurs qui ne peuvent pas encore servir de preuve robuste. La route inconnue répond bien `404`, mais le document publié ne contient pour l’instant qu’un contenu HTML minimal sans classe `.rc-page-not-found` ni chargement du thème ; cela doit être corrigé comme un écart réel de Lot 1 plutôt que masqué dans la recette. La route `/commande/` aboutit au checkout réel `/commander/` ; le repère de test doit accepter explicitement ce chemin final. Enfin, la fiche produit publique requiert un repère stable réellement présent dans le template courant au lieu de supposer la classe WooCommerce `.product`.

La correction de recette à venir ne doit donc pas faire disparaître ces écarts : elle doit d’abord fixer le rendu 404 et s’aligner sur les repères HTML publics réellement servis.

La revue de la fiche produit confirme que le thème rend le conteneur `.rc-product-page` et un champ de quantité préfixé `rc-quick-quantity-`, sans utiliser la classe WooCommerce générique `.product`. La recette de régression est donc alignée sur ces repères. Dans une session vierge, la route de commande peut légitimement revenir vers `/panier/` faute de panier ; ce comportement est désormais consigné comme une branche de route attendue et ne remplace pas la future recette de checkout avec panier de test.

## Conservation et mise à jour Core

L’extension métier active a été mise à jour en version `0.1.1`. Une première archive sans dossier racine a créé un doublon **inactif** ; il est conservé volontairement, sans activation, désactivation ni suppression, conformément à l’instruction expresse de ne supprimer aucune donnée ou composant existant. L’extension canonique active reste distincte et a bien reçu la version `0.1.1`.

## Déploiement 2.5.2 et performance publique

Le thème `2.5.2` a été déployé puis le cache LiteSpeed a été purgé. Le contrôle HTTP public après déploiement confirme l’accueil en `200`, une fiche canonique connue en `200` et une route restaurant inconnue en `404`. La mesure Lighthouse mobile publique de la fiche restaurant reste cependant à **77/100 en performance**, avec un LCP de `3,6 s`, un TBT de `0 ms` et un CLS de `0,054`. Les opportunités les plus notables sont la réponse initiale du serveur (gain estimé `781 ms`) et le CSS inutilisé (gain estimé `150 ms`). Le seuil CDC de performance n’est donc pas atteint et reste un bloqueur explicite de validation.

Le thème `2.5.3` est désormais déployé et le cache LiteSpeed a été purgé. Il retire uniquement sur les fiches restaurant et produit les styles WooCommerce, WCFM et Hostinger identifiés comme inutiles ; les routes panier et commande ne sont pas concernées par cette règle. La remesure post-correctif reste à exécuter avant toute conclusion.

Le thème `2.5.4` est déployé puis le cache LiteSpeed a été purgé. Il précharge dans l’en-tête la même photographie de couverture que celle employée par le fond héro de la fiche restaurant, avec une priorité haute. Cette mesure répond au diagnostic Lighthouse précédent : la ressource LCP n’était pas découvrable dans le document initial. La remesure reste à exécuter ; aucun statut de conformité n’est déduit du seul déploiement.

La vérification du document public confirme que la balise de préchargement de l’image héro est bien rendue avec une priorité haute. Toutefois, la première remesure Lighthouse après déploiement est de **85/100** (LCP `3,3 s`) et son diagnostic conserve à tort une ressource LCP non découvrable. La dégradation coïncide avec une réponse serveur plus lente pendant la mesure ; ce score ne satisfait pas le seuil CDC et ne peut pas être présenté comme une amélioration validée. Une mesure répétée, cache réchauffé, et une analyse de la ressource LCP réelle restent nécessaires.

Les correctifs de validation Lot 3 sont désormais actifs dans RestoCommerce Core `0.1.2`. Le doublon inactif plus ancien reste conservé volontairement et sans aucune action, conformément à l’instruction de ne rien supprimer, désactiver ni modifier hors correction explicitement demandée.

Le thème `2.5.5` est également déployé et le cache LiteSpeed a été purgé. Ce paquet ajoute un refus immédiat dans le navigateur pour les couvertures qui ne sont pas des PNG, JPEG ou WebP valides de 5 Mo maximum ; Core `0.1.2` contrôle la même règle côté serveur ainsi que le format du téléphone. La vérification fonctionnelle non destructive reste à effectuer.

Après `2.5.5`, la fiche publique se rend normalement. L’inspection navigateur observe l’image héro chargée par la balise `link` de préchargement avec une priorité haute, distinctement des miniatures de carte. Le chargement des images provient à ce stade du cache navigateur ; il ne remplace donc pas une nouvelle mesure Lighthouse mobile à cache de recette propre.

La matrice de route canonique a terminé en lecture seule avec `12` contrôles sans bloqueur, sur Chromium, Firefox et WebKit aux quatre formats CDC. La redirection legacy a également terminé sans bloqueur sur Chromium aux quatre formats. Les recettes signalent correctement que la vérification connectée du cockpit reste à rejouer dès que les variables de session vendeur non sensibles sont à nouveau disponibles dans l’environnement ; aucune tentative de récupération d’identifiant n’a été faite.

Le thème `2.5.6` est déployé puis le cache LiteSpeed a été purgé. La photographie héro est à présent une image native prioritaire derrière les couches éditoriales, à la place d’un fond CSS seul. La remesure Lighthouse et la vérification de découverte de la ressource sont nécessaires avant de conclure sur son impact.

La mesure `2.5.6` a confirmé que l’image était désormais découvrable dans le document initial, mais a exposé un préchargement redondant de la source PNG pleine taille : la ressource représentait environ 5,2 Mo dans la trace et dominait le LCP. Le staging a également répondu ponctuellement `504` au préchauffage HTTP alors que le rendu navigateur restait sain. Le thème `2.5.7` retire ce préchargement pleine taille et conserve l’image native responsive ; son déploiement est confirmé, sa purge et sa remesure restent à exécuter.

La remesure `2.5.7` sur URL de recette a ramené le score Performance à `85`, avec Accessibilité `100`, Bonnes pratiques `96` et SEO `100`. La source image choisie était la variante responsive `768×432` d’environ 25,7 Ko. La version `2.5.8`, également déployée, ajoute un préchargement uniquement de cette candidate responsive avec `imagesrcset` et `imagesizes`; la purge et la remesure restent ouvertes.

Après purge, la mesure `2.5.8` a maintenu le LCP autour de `2,9 s`, mais le score Performance est resté à `84` sous la latence de staging, avec un délai de rendu de l’élément LCP d’environ `478 ms`. RestoCommerce `2.5.9` est maintenant déployé et le cache est purgé ; il force le décodage synchrone de cette unique image héro prioritaire. Cette dernière tentative doit encore être mesurée ; le seuil CDC Performance ≥ 90 demeure non atteint à ce point.

La mesure `2.5.9` ramène le délai de rendu LCP à environ `12 ms` et conserve l’image découvrable, prioritaire et non lazy-loadée. Elle reste néanmoins à Performance `85`, avec Accessibilité `100`, Bonnes pratiques `96` et SEO `100`, car la latence TTFB et le transfert réseau simulé du staging restent prépondérants. Aucun seuil de conformité Performance n’est déclaré atteint.

## Remédiation de la route inconnue

La première tentative de rattachement au cycle de template WordPress dans le hook de routage a déclenché une réponse `500` sur cette seule route. Elle a été retirée immédiatement et remplacée par un rendu 404 éditorial autonome, accessible et sans dépendance au cycle de template à ce stade de WordPress. La version de thème `2.5.1` est déployée, LiteSpeed a été purgé et le contrôle HTTP confirme désormais `404`, la présence du repère `.rc-page-not-found` et l’absence de page d’erreur critique. Les routes connues et les données métier n’ont pas été modifiées par cette remédiation.
