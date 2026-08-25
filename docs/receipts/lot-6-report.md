# Lot 6 — Suivi public de commande

**Date de préparation :** 24 août 2026
**Thème déployé :** RestoCommerce 2.7.0
**Périmètre :** page WooCommerce « commande reçue » ; aucune commande réelle, aucun compte, produit, média, avis ou contenu existant n’a été modifié durant cette passe.

## Fonctionnalités livrées

Le suivi client est ajouté à la page WooCommerce de commande reçue, sans créer de nouvelle route persistante, jeton secondaire ou table personnalisée. Le rendu exige la clé de commande native passée par WooCommerce dans l’URL de reçu. Cette clé est comparée avec `hash_equals` avant toute restitution ; une page ouverte sans clé valide ne reçoit aucun bloc de suivi de RestoCommerce.

Le suivi utilise les états vendeur déjà employés dans le cockpit : **Reçue**, **En préparation**, **Prête**, puis **Récupérée / livrée**. Pour une commande contenant des articles de plusieurs restaurateurs, les étapes sont affichées séparément par restaurant. Les commandes annulées, échouées ou remboursées ne sont pas présentées comme livrées ; elles affichent uniquement « Commande clôturée ».

| Élément | Implémentation | Effet sécurité ou UX |
|---|---|---|
| Point d’entrée | Hook WooCommerce de commande reçue | Pas de route ajoutée ni de réécriture à maintenir |
| Contrôle d’accès | Clé de commande WooCommerce et comparaison constante | Absence de données de suivi sans clé valide |
| État de la cuisine | Métadonnée vendeur existante `_restocommerce_vendor_state_{vendor_id}` | Même vocabulaire que le cockpit restaurateur |
| Multi-restaurants | Groupement par propriétaire des lignes | Un client voit les étapes pertinentes par restaurant |
| WhatsApp | URL construite seulement par le résolveur existant | Aucun numéro de secours ; message clair sans configuration |
| Habillage | Feuille ciblée `order-tracking.css` | Frise de suivi éditoriale, lisible mobile et desktop |

Le lien WhatsApp est uniquement proposé lorsqu’un numéro est effectivement résolu par l’extension checkout existante. Aucun envoi automatique, aucune transaction et aucune modification de statut sont effectués par le suivi public.

## Contrôles réalisés

La syntaxe PHP du thème a été validée après l’ajout. L’archive 2.7.0 a passé le contrôle d’intégrité avant téléversement. WordPress a confirmé la mise à jour, LiteSpeed a été purgé, puis une requête publique avec paramètre de version a confirmé la version 2.7.0. Les invariants contrôlent la présence du contrôle par clé, de `hash_equals`, du hook WooCommerce et de l’asset CSS public.

| Contrôle | Résultat | Limite |
|---|---:|---|
| Syntaxe PHP | Réussi | Ne simule pas une commande existante |
| Archive ZIP | Réussi | Test d’intégrité local avant import |
| Déploiement WordPress | Réussi | Mise à jour confirmée par WordPress |
| Version et feuille CSS servies | Réussi | Vérifiées avec cache-busting après purge |
| Contrôles de clé et hook | Réussi | Vérification statique ; pas d’essai sur reçu réel |

## Limites de preuve et statut

Aucune clé de commande client autorisée n’est disponible dans l’environnement. Pour respecter la règle de conservation, aucune commande préexistante n’a été ouverte avec sa clé, aucune progression vendeur n’a été modifiée et aucun lien WhatsApp n’a été suivi. La recette à rejouer doit couvrir : clé valide, clé invalide, commande sans accès, une commande mono-restaurant, une commande multi-restaurants, les quatre états vendeur, l’annulation et le parcours WhatsApp configuré ou absent.

> **Statut : déployé avec contrôles statiques, syntaxiques et de distribution réussis ; preuve end-to-end sur commande réelle encore due.**
