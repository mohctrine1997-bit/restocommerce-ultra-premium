# Lot 4 — Aide guidée et accompagnement vendeur

**Date de préparation :** 24 août 2026
**Thème déployé :** RestoCommerce 2.6.0
**Périmètre :** cockpit vendeur WordPress propriétaire ; aucune création, suppression, désactivation, archivage ou modification de comptes, produits, médias et commandes n’a été exécutée durant cette passe.

## Fonctionnalités livrées

Le cockpit possède désormais un **tour de première prise en main** limité à trois repères : disponibilité du restaurant, traitement des commandes et ajout d’un plat. Chaque repère active la zone concernée, la rend visuellement identifiable et emploie des formulations courtes adaptées à un usage mobile. Le tour est présenté comme un dialogue accessible, avec titre, progression et contrôle explicite de fermeture.

Le choix « Ne plus afficher » ou la fin du guide appelle un endpoint AJAX authentifié, protégé par le nonce du cockpit et le contrôle vendeur existant. La préférence est uniquement enregistrée sur le compte vendeur connecté sous la métadonnée `restocommerce_vendor_guidance_tour_dismissed = yes`. Il ne s’agit ni d’une remise à zéro ni d’une migration : le guide cesse seulement de se lancer automatiquement pour ce compte. L’aide reste disponible dans l’interface via le bouton « Aide ».

L’aide contextuelle ouvre un dialogue explicatif et propose un lien WhatsApp lorsqu’une URL de support est effectivement résolue côté serveur par l’extension existante. En l’absence de configuration, aucun numéro de remplacement n’est injecté ; l’interface conserve alors le guide rapide et explique que le support WhatsApp n’est pas configuré.

| Élément | Implémentation | Protection ou comportement |
|---|---|---|
| Tour de première visite | Trois étapes : service, commandes, menu | Affichage automatique conditionné par la préférence du vendeur |
| Fin ou abandon du tour | `restocommerce_vendor_dismiss_guidance_tour` | Nonce, session connectée et contrôle WCFM vendeur |
| Aide persistante | Bouton « Aide », dialogue contextuel, lien guide | Accessible sans réactiver le tour automatique |
| Aide WhatsApp | URL résolue côté serveur existant | Masquée sans configuration ; aucun numéro codé en dur |

## Contrôles réalisés

La syntaxe PHP du thème et le contrôle JavaScript ont réussi. Les invariants de source vérifient la présence de la préférence utilisateur, de l’action AJAX, du déclencheur d’aide, du dialogue de tour, de l’état localisé et de la feuille de style dédiée. L’archive `restocommerce-theme-2.6.0.zip` a été testée avant import. WordPress a confirmé la mise à jour du thème, LiteSpeed a été purgé, puis le fichier public `style.css` a confirmé la version 2.6.0 ; l’asset `vendor-guidance.css` répond en HTTP 200 avec le type `text/css`.

| Contrôle | Résultat | Observation |
|---|---:|---|
| `php -l` sur `functions.php` et `vendor-dashboard.php` | Réussi | Aucune erreur de syntaxe PHP |
| `node --check` du cockpit | Réussi | Aucune erreur de syntaxe JavaScript |
| Invariants tour/aide | Réussi | Présence contrôlée sans session vendeur |
| Archive ZIP du thème | Réussi | Test d’intégrité avant téléversement |
| Déploiement WordPress | Réussi | Thème servi en version 2.6.0 après purge |

## Limites de preuve et statut

L’environnement ne fournit aucune variable de connexion vendeur portable et aucune session vendeur autorisée distincte de l’administration. Conformément à la règle de préservation, aucun compte de recette conservé n’a été utilisé pour déclencher le tour, écrire sa préférence, changer le service, ajouter un plat ou modifier une commande. La persistance réelle de la préférence, le parcours clavier connecté et le contraste du dialogue dans les trois moteurs aux quatre breakpoints restent donc à rejouer avec une session vendeur explicitement autorisée.

> **Statut : déployé avec contrôles statiques et de distribution réussis ; validation fonctionnelle connectée et recette multi-moteurs encore dues.**
