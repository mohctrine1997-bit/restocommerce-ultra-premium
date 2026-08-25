# Lot 7 — Avis vérifiés et signalement vendeur

**Date de préparation :** 24 août 2026
**Thème déployé :** RestoCommerce 2.7.1
**Périmètre :** avis liés aux commandes WooCommerce terminées ; aucune commande, aucun avis, aucun compte, produit, média ou contenu de recette existant n’a été modifié, supprimé, désactivé ou archivé durant cette passe.

## Fonctionnalités livrées

Le dépôt d’avis est proposé exclusivement sur la page de reçu d’une commande WooCommerce **terminée** et uniquement lorsque la clé de commande native est valide. Le serveur vérifie simultanément la clé, le statut `completed`, l’appartenance du restaurant aux lignes de la commande et l’absence d’un avis précédent pour la même paire commande–restaurant. Un avis est stocké dans les commentaires WordPress avec le type `restocommerce_vendor_review` et des métadonnées de note, commande, restaurant et vérification. La clé de commande n’est jamais enregistrée dans le commentaire.

Le résumé affiché sur la fiche restaurant est calculé uniquement à partir des avis approuvés de ce type. Sans avis réel, aucun score, étoile, avis de démonstration ou compteur artificiel n’est rendu. Le cockpit vendeur permet de consulter ses propres avis et de les **signaler pour modération**. Ce signalement ajoute une métadonnée ; il ne supprime, ne masque et ne modifie aucun texte d’avis.

| Élément | Implémentation | Garantie |
|---|---|---|
| Éligibilité client | Reçu WooCommerce, clé valide, commande terminée | Pas d’avis depuis une simple fiche publique |
| Unicité | Recherche commande–restaurant, tous statuts de commentaires | Au plus un avis par achat et par restaurant |
| Stockage | Commentaire WordPress avec type et métadonnées dédiés | Schéma exploitable sans contenu fictif |
| Résumé restaurant | Moyenne et compte des seuls avis approuvés | Aucun score affiché sans retour réel |
| Consultation vendeur | Endpoint AJAX nonce + contrôle WCFM vendeur | Isolation aux avis de son restaurant |
| Signalement | Métadonnée de drapeau et horodatage | Modération non destructive, sans suppression automatique |

## Contrôles réalisés

Les syntaxes PHP des fonctions, du dashboard et du storefront ont été validées. Les scripts du cockpit et de soumission client ont passé le contrôle JavaScript. Les invariants vérifient l’exigence de statut terminé, les métadonnées de propriétaire, l’endpoint de signalement, le panneau vendeur et le résumé storefront. L’archive 2.7.1 a été contrôlée avant import ; WordPress a confirmé l’installation, LiteSpeed a été purgé et les assets CSS/JavaScript publics ont répondu en HTTP 200 avec cache-busting.

| Contrôle | Résultat | Limite |
|---|---:|---|
| Syntaxe PHP et JavaScript | Réussi | Ne soumet aucun avis réel |
| Invariants d’éligibilité, propriété et signalement | Réussi | Vérification statique des gardes |
| Archive ZIP | Réussi | Intégrité locale avant téléversement |
| Mise à jour WordPress | Réussi | Thème 2.7.1 confirmé par WordPress |
| Assets publics | Réussi | Feuille et script vérifiés après purge |

## Limites de preuve et statut

Le staging ne fournit ni clé de commande client autorisée ni session vendeur portable. Conformément à la règle de conservation, aucune commande terminée existante n’a été utilisée pour soumettre un avis, aucun avis n’a été signalé et aucune donnée existante n’a été modifiée. La recette à rejouer doit vérifier : refus sans clé, refus sur commande non terminée, création réelle d’un unique avis, refus du doublon, calcul du résumé, visibilité du seul vendeur propriétaire, signalement et absence de suppression du contenu signalé.

> **Statut : déployé avec contrôles statiques, syntaxiques et de distribution réussis ; recette métier complète sur commande terminée et session vendeur encore due.**
