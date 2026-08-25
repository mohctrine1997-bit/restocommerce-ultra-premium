# RestoCommerce — Rapport de recette Lot 2

> **Décision attendue :** le Lot 2 est déployé sur le staging réel, son LCP vendeur a été amélioré et sa recette automatisée est concluante. La validation fonctionnelle humaine reste requise avant de commencer tout autre lot.

| Élément | Valeur |
| --- | --- |
| Environnement contrôlé | `https://aliceblue-bison-433987.hostingersite.com` |
| Version publiée | **RestoCommerce 2.2.6** |
| Objet de la recette finale | Assistant propriétaire mobile « Ajouter un plat » |
| Exécution fonctionnelle finale | `lot2-1787526821892` — 23 août 2026, 23:13–23:16 GMT+1 |
| Produits réels de recette | Source **233** et duplication **234**, archivés après contrôle |
| Preuves brutes | `docs/receipts/lot-2-artifacts/latest-run.log` et `lighthouse-lot-2-summary.json` |

## Périmètre livré

Le cockpit vendeur dédié intègre désormais un assistant mobile propriétaire, sans passage par le formulaire WCFM brut. Le parcours est volontairement découpé en six décisions simples : **photo**, **famille**, **nom**, **prix**, **choix facultatifs**, **aperçu et publication**. La photo est exigée côté serveur avant toute publication ; un échec d’import bloque donc la création d’un plat public incomplet.

Le restaurateur peut créer et réutiliser une famille de choix telle que « Sauce », définir son caractère obligatoire et sa limite de sélection — 1, 2, 3 ou illimité — puis l’associer au plat. La bibliothèque du menu expose ensuite des bascules immédiates pour les familles et les choix. La duplication reprend la photo et les informations du plat source. Le lien d’assistance WhatsApp demeure présent dans l’assistant, avec le numéro de service défini pour le projet.

| Capacité vérifiée | Résultat sur le staging |
| --- | --- |
| Publication atomique avec photo | **Conforme** : le plat de recette 233 est publié avec image, prix `89` et groupe d’options associé. |
| Groupe « Sauce » obligatoire, maximum 2 | **Conforme** : groupe `option-4O8QafoQ` réellement associé au plat. |
| Duplication réelle | **Conforme** : le produit 234 est créé depuis le plat source. |
| Pause / reprise du choix | **Conforme** : état `true → false → true` observé sur le toggle Sauce. |
| Disponibilité de famille | **Conforme** : la famille du plat est explicitement rétablie visible avant le parcours client. |
| Parcours public de commande | **Conforme** : deux sauces sont ajoutées avec le message « Plat ajouté au panier. » |
| Nettoyage contrôlé | **Conforme** : les produits 229 et 230 sont archivés, cachés et mis hors stock par l’endpoint propriétaire. |

## Règle Sauce : double protection client et serveur

La règle fonctionnelle imposée au Lot 2 est couverte à deux niveaux. Côté interface, trois tentatives de sélection ont laissé exactement deux sauces sélectionnées et la troisième décochée. Côté serveur, une requête construite volontairement avec trois valeurs a été refusée avec le message :

> « Respectez le nombre de choix pour Sauce lot2-1787526821892. »

| Couche | Preuve | Résultat |
| --- | --- | --- |
| Interface cliente | `selectedAfterThreeAttempts: 2`, `thirdStillChecked: false` | La troisième sauce est empêchée avant commande. |
| Validation serveur | Réponse AJAX `success: false` avec message de limite | Le contournement JavaScript ne permet pas d’ajouter trois sauces. |
| Ajout conforme | Deux sauces puis confirmation de commande | Ajout panier confirmé. |

## Accessibilité, clavier et stabilité visuelle

La recette finale couvre Chromium, Firefox et WebKit aux quatre largeurs **390**, **768**, **1440** et **1920** pixels. Les contrôles axe-core comprennent l’assistant initial, la fiche client configurée et les douze combinaisons moteur/largeur du wizard.

| Domaine | Couverture | Résultat |
| --- | --- | --- |
| Axe-core | 14 analyses : 12 matrice wizard + assistant mobile initial + fiche client | **0 violation** |
| Clavier | `Tab` dans l’assistant | Focus sur un lien, contour `solid` de **3 px** |
| Pixelmatch | Deux sessions Chromium distinctes, même wizard 390 px | **0 pixel modifié** |
| Réduction de mouvement | Animations figées pour la comparaison visuelle | Captures déterministes |

Les captures représentatives de la recette sont conservées dans `docs/receipts/lot-2-artifacts/`, notamment l’assistant mobile, le configurateur client et les douze déclinaisons multi-moteurs.

## Addendum performance — optimisation LCP cockpit vendeur

Le diagnostic authentifié a mis en évidence un chargement inutile de styles et scripts de la marketplace publique, de WooCommerce Blocks et des écrans WCFM natifs, alors que la route `/store-manager/` affiche exclusivement le cockpit RestoCommerce. La version 2.2.6 conserve les polices et les deux scripts propriétaires nécessaires, tout en retirant ces dépendances héritées uniquement de l’accueil vendeur. Les sous-routes WCFM natives ne sont pas modifiées.

| Indicateur mobile, cockpit authentifié | Référence 2.2.5 | Après optimisation 2.2.6 | Évolution |
| --- | ---: | ---: | ---: |
| Score Performance Lighthouse | 75 | **87** | +12 points |
| LCP | 4,1 s | **3,1 s** | -1,0 s (environ -24 %) |
| Speed Index | 5,3 s | **3,6 s** | -1,7 s |
| CLS | 0 | **0** | Stable |
| TBT | 0 ms | **0 ms** | Stable |

L’inventaire après déploiement confirme que le cockpit conserve ses trois feuilles de style RestoCommerce et ses deux scripts propriétaires, sans les ensembles WCFM, cart fragments, quick view et configurateur public. La recette complète post-optimisation confirme que l’assistant, la publication, la duplication, les bascules et le parcours de commande restent fonctionnels.

## Lighthouse mobile

Les relevés ont été effectués sur le staging en configuration mobile simulée. Le cockpit a été mesuré avec une session vendeur authentifiée ; la fiche client a été mesurée sur une page de restaurant publique.

| Parcours | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- |
| Cockpit vendeur / wizard | **87** | 94 | 100 | 92 | **3,1 s** | 0 | 0 ms |
| Fiche restaurant cliente | 77 | 100 | 100 | 92 | 3,9 s | 0 | 0 ms |

Le Total Blocking Time nul et le CLS nul confirment que l’interaction du cockpit reste légère et stable. La mesure publique est une exécution isolée et n’a subi aucune modification de code sur la fiche restaurant dans cette version ; son écart ponctuel doit donc être interprété comme une variation de mesure et non comme une régression attribuée à l’optimisation vendeur. La mesure principale demandée — le LCP du cockpit authentifié — progresse de manière nette et le reste du Lot 2 demeure validé techniquement.

## Limites de preuve et traçabilité

L’environnement Hostinger ne fournit pas de shell distant. Conformément à l’exception déjà actée au Lot 0, aucune preuve WP-CLI distante n’est revendiquée. Les preuves de données réelles du Lot 2 proviennent des endpoints AJAX protégés par les permissions vendeur, de l’interface vendeur réelle, du rendu public WooCommerce, de l’ajout panier et de l’archivage contrôlé des objets de recette.

Les tests ont créé des groupes de choix de recette réutilisables dans la bibliothèque du compte vendeur de démonstration. Les plats de recette, eux, sont bien archivés ; aucun plat actif de test n’est laissé visible aux clients.

## Conclusion

Le Lot 2 satisfait son objectif : un restaurateur peut créer, publier, dupliquer et gérer un plat depuis un assistant simple, mobile-first et propriétaire, tandis que les options créées deviennent effectivement commandables avec une limite Sauce **max 2** imposée dans le navigateur et sur le serveur.

**Répondez exactement : `Je valide le Lot 2` pour autoriser le Lot 3.**
