# Lot 2 — Rapport final de recette connectée du wizard produit

**Date de recette :** 24 août 2026
**Environnement :** staging WordPress / WooCommerce / WCFM
**Thème contrôlé :** RestoCommerce **2.7.13**, confirmé après remplacement WordPress et purge LiteSpeed.
**Révision GitHub de publication des recettes :** `29f0b864c16915b54b7fe50a73373545fa6480c8` sur `main`.

## Verdict

> **Verdict : conforme pour le périmètre connecté du Lot 2 testé.** Le wizard vendeur a créé un plat de recette avec photo et choix Sauce limité à deux, a vérifié son rendu public, la duplication, la bibliothèque, la protection serveur et le nettoyage. Les contrôles ont porté sur des données de recette isolées uniquement.

| Contrôle connecté | Résultat |
|---|---|
| Assistant mobile | Dialogue modal accessible, titre, progression, capture photo environnement et focus 3 px confirmés. |
| Publication réelle | Plat avec photo, prix et groupe d’options créé puis visible publiquement. |
| Limite Sauce côté interface | Trois tentatives aboutissent à deux choix sélectionnés ; le troisième reste désélectionné. |
| Limite Sauce côté serveur | Requête contournant l’interface refusée. |
| Ajout panier | Ajout confirmé avec les deux choix autorisés. |
| Duplication | Copie du plat créée dans le menu vendeur. |
| Bibliothèque | Groupe Sauce détecté, mis en pause puis restauré. |
| Accessibilité | 14 analyses axe, couvrant wizard et fiche produit sur trois moteurs et quatre largeurs : 0 violation. |
| Stabilité visuelle | Pixelmatch du wizard Chromium mobile : 0 pixel différent. |

Le diagnostic a d’abord détecté un contraste de 4,34:1 sur le message d’aide du wizard. La version 2.7.13 corrige la spécificité CSS responsable ; la couleur calculée finale est plus sombre et les 14 analyses axe finales sont vierges.[1]

## Sécurité, isolation et nettoyage

| Contrôle | Résultat |
|---|---|
| Mutation sans nonce | Rejetée par WordPress avec HTTP 403. |
| Mutation inter-vendeur | Un second vendeur de recette a tenté d’archiver une fixture appartenant au vendeur source ; la requête a été refusée. |
| Archive propriétaire | Le vendeur source a archivé sa fixture avec succès. |
| Visibilité publique après archive | Les plats de recette archivés répondent HTTP 404. |
| Produits de recette | Les plats créés et leurs copies ont été archivés à la fin de chaque recette réussie. |
| Compte secondaire temporaire | Créé sans contenu pour l’isolation, puis supprimé par WordPress après contrôle. |

Le wizard crée des enregistrements de support propres au scénario, notamment un groupe d’options et un média de recette. Ils ne sont pas supprimés automatiquement par les endpoints testés afin d’éviter toute suppression élargie ; aucun compte, produit ou donnée préexistante n’a été modifié. Les artefacts techniques détaillés restent privés et exclus du dépôt public.

## Limites explicites

Cette recette ne couvre pas une commande WhatsApp complète, un paiement réel, un téléphone physique ni une mesure de performance reproductible à 90 ou plus. Ces sujets ne sont donc pas déclarés conformes par ce rapport.[2]

## Références

[1] [Recette connectée Lot 2](../../scripts/run-lot-2-receipt.mjs)
[2] [Sondes de sécurité et d’isolation Lot 2](../../scripts/run-lot-2-security-probe.mjs)
[3] [Rapport global Lots 1 à 12](final-lots-1-12-report.md)
