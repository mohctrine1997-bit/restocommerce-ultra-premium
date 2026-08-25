# Baseline bug — groupes d’options et suppléments

**Date :** 25 août 2026
**Staging :** `darkblue-spoonbill-498612.hostingersite.com`
**Compte :** vendeur QA privé, non reproduit sur un compte non-QA
**État :** bug reproduit; correction non encore déployée.

## Reproduction serveur

Le parcours vendeur ouvre bien le cockpit RestoCommerce et expose l’interface du wizard produit. Une soumission authentifiée du groupe `RCQA Sauce reproduction` avec une seule réponse (`Mayonnaise`) et `max_choices=1` renvoie HTTP 200 mais `success=false`, avec le message : « Donnez un nom et au moins deux choix simples à cette option. » Aucun groupe n’est donc enregistré dans ce cas. La preuve assainie est `qa/repro-option-group-single-choice.json`.

L’interface ne rend pas cette erreur comme une confirmation; pour un restaurateur, l’impression que la sauce n’a pas été sauvegardée est donc cohérente avec la réponse serveur. Le problème est aggravé si l’utilisateur pense qu’une catégorie « Sauce » contenant un seul choix suffit : le backend exige au moins deux choix dans un groupe.

## Cause racine fonctionnelle

Le backend stocke les groupes dans la méta utilisateur `restocommerce_vendor_option_groups`, avec `title`, `choices`, `required`, `max`, `enabled` et `id`. Il n’existe pas de mapping catégorie → groupes dans la structure actuelle.

Lors de la sauvegarde d’un produit, le wizard envoie uniquement `option_groups`, et le backend copie les identifiants sélectionnés dans la méta produit `restocommerce_option_group_ids`. La sélection est donc **manuelle et par produit**; elle n’est pas déduite de la catégorie du plat. De plus, le wizard affiche toutes les options de la bibliothèque vendeur, sans filtrage par catégorie.

Le rendu public fonctionne lorsque le produit possède des identifiants de groupes valides : `restocommerce_render_product_configurator()` lit les groupes activés attachés au produit, rend leurs cases à cocher et `restocommerce_ajax_quick_add_to_cart()` valide les choix côté serveur avant de les mettre dans le panier et la commande.

## Conclusion baseline

Deux comportements distincts expliquent le retour utilisateur :

| Symptôme | Cause |
|---|---|
| Une sauce nouvellement saisie semble disparaître | une seule réponse est rejetée par la règle serveur « au moins deux choix » |
| Une sauce enregistrée n’apparaît pas sur un nouveau produit | aucun héritage automatique catégorie → options n’est implémenté; l’association doit être cochée manuellement dans le wizard |
| Une option attachée n’apparaît toujours pas publiquement | le groupe peut être désactivé, l’identifiant peut ne pas être attaché au produit, ou la route publique peut servir une version avant sauvegarde; le rendu serveur devra être retesté après correction |

Aucun paiement, export, message WhatsApp ou donnée non-QA n’a été touché pendant cette reproduction.

## Correctif 2.7.53 — preuve de bout en bout

Le thème 2.7.53 a été déployé et WordPress a confirmé le remplacement de 2.7.52 par 2.7.53. L’archive corrective est `restocommerce-theme-2.7.53-option-groups.zip`, SHA-256 `94a8ca2da66d9dcaaeb8e4265b35471c82ff4ee93bad29802b14dfa0c950558b`.

Le test QA `option-groups-e2e-2753.json` a enregistré une catégorie `Plats`, un groupe `Sauce` avec le choix unique `Mayonnaise`, une réponse serveur HTTP 200 `success=true`, puis l’association du groupe au produit QA existant. La relecture du produit confirme l’identifiant du groupe persisté.

La vérification publique `option-groups-public-verify-2753.json` confirme HTTP 200, une zone d’options, le libellé `Sauce`, la case `Mayonnaise` et une case d’option rendue. Le test client `option-groups-cart-verify-2753-v4.json` confirme que Mayonnaise est cochée, que la confirmation client est cochée et que l’ajout au panier répond `Plat ajouté au panier.`. Aucun checkout, paiement ou WhatsApp n’a été ouvert. Un abort `notification.mp3` WCFM est resté observé et documenté comme anomalie réseau non bloquante.

Le smoke UI `option-groups-wizard-ui-2753-v3.json` confirme que l’étape « Des choix pour le client ? » affiche Sauce dans l’édition du produit de catégorie Plats. Le filtrage catégorie est maintenant porté par `categorySlugs`; les groupes sans portée historique restent globaux. La règle serveur accepte désormais au moins un choix, ce qui corrige le cas d’une sauce unique.
