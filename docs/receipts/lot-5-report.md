# Lot 5 — Centre de notifications vendeur

**Date de préparation :** 24 août 2026
**Thème déployé :** RestoCommerce 2.6.3
**Périmètre :** alertes de commandes WooCommerce et panneau vendeur. Aucune commande, aucun compte, produit, média, avis ou contenu de recette existant n’a été créé, modifié, désactivé, archivé ou supprimé pour cette passe.

## Fonctionnalités livrées

Le cockpit vendeur comprend désormais un centre de notifications accessible depuis la cloche. Les événements provenant des commandes WooCommerce sont capturés à la création et lors d’un changement de statut. Chaque événement est associé uniquement aux restaurateurs propriétaires des articles concernés. Il est ajouté comme une entrée de métadonnée dédiée au vendeur et possède une clé idempotente par commande et événement, ce qui évite de dupliquer une même alerte lors de l’exécution répétée d’un hook. Les entrées existantes ne sont pas supprimées ni écrasées.

Le panneau restitue uniquement les alertes du restaurateur connecté. Il indique les nouvelles alertes, peut les marquer comme lues, permet un rafraîchissement manuel et relit les données périodiquement **tant que le cockpit est ouvert**. Cette lecture est client-side, à intervalle borné de 45 secondes : aucun service persistant, tâche planifiée ou sondage hors session navigateur n’est introduit.

| Élément | Implémentation | Garantie apportée |
|---|---|---|
| Création de commande | Hook WooCommerce `woocommerce_new_order` | Alerte additive par vendeur propriétaire |
| Évolution de statut | Hook `woocommerce_order_status_changed` | Alerte additive, dédoublonnée par statut |
| Lecture vendeur | Endpoints AJAX nonce + contrôle WCFM vendeur | Aucun journal d’un autre restaurant n’est renvoyé |
| Compteurs cockpit | Synthèse des commandes puis mise à jour DOM | Actualisation sans rechargement de page |
| Signal local | Son discret et vibration, à opt-in persistant | Préférence stockée seulement pour le vendeur connecté |
| Alertes navigateur | Demande d’autorisation déclenchée par un geste explicite | Optionnelle et absente des navigateurs non compatibles |
| Accès WhatsApp | URL de support résolue par l’extension existante | Aucun numéro de secours codé en dur ; message explicite sans configuration |

La préférence « lue » et les réglages son/vibration sont enregistrés uniquement après une action explicite du vendeur connecté. L’autorisation des alertes navigateur reste un choix du navigateur et de l’utilisateur : aucun contournement de permission n’est tenté.

## Contrôles réalisés

La syntaxe PHP et JavaScript a été contrôlée après chaque correction. Les contrôles statiques vérifient la présence des hooks de commande, des endpoints de lecture et de synthèse, du panneau de notifications et de la protection de compatibilité de l’API navigateur. L’archive 2.6.3 a été testée avant import. WordPress a confirmé l’installation de la version 2.6.3, LiteSpeed a été purgé et une requête publique avec paramètre de version a confirmé que la feuille de style servie correspond à 2.6.3.

| Contrôle | Résultat | Limite |
|---|---:|---|
| Syntaxe PHP du thème | Réussi | Ne simule pas une création de commande réelle |
| Syntaxe JavaScript cockpit | Réussi | Ne simule pas un navigateur connecté vendeur |
| Hooks, endpoints et DOM | Réussi | Contrôle de présence statique |
| Archive ZIP et mise à jour WordPress | Réussi | Déploiement confirmé par WordPress |
| Version servie avec cache-busting | Réussi | Le cache statique sans paramètre peut conserver une ancienne réponse temporairement |

## Limites de preuve et statut

Les variables de connexion vendeur ne sont pas disponibles dans l’environnement et aucun compte de recette conservé n’a été utilisé afin de respecter la conservation absolue des données. Une commande réelle n’a donc pas été créée pour déclencher les hooks, aucun statut n’a été changé, aucune préférence vendeur n’a été écrite et aucune permission navigateur n’a été demandée. La preuve end-to-end d’une nouvelle commande, de la cloche, des compteurs, du son, de la vibration et de l’alerte WhatsApp reste à rejouer avec une session vendeur autorisée et un scénario de commande explicitement approuvé.

> **Statut : déployé avec contrôles statiques, syntaxiques et de distribution réussis ; recette métier connectée sans mutation encore due.**
