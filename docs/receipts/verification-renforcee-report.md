# Campagne de vérification renforcée

**Début de campagne :** 24 août 2026
**Thème public observé :** RestoCommerce 2.7.4.

## Revue visuelle initiale — fiche restaurant

Les captures Playwright de la fiche restaurant à 1440 × 1000 et 390 × 844 confirment une hiérarchie éditoriale cohérente : navigation calme, hero contrasté, action principale immédiatement visible, carte lisible et CTA final clairement différencié. Le rendu mobile conserve l’image du hero, expose le bouton de panier, transforme la carte en une colonne et maintient une lecture verticale sans débordement apparent.

| Surface | Résultat observé | Point de vigilance |
|---|---|---|
| Desktop | Hero, catégories, cartes produit et bloc final visuellement ordonnés | Les images de produits sont volontairement très proches : la qualité éditoriale dépendra de médias restaurant réellement différenciés |
| Mobile | Titre, menu, cartes et action finale restent lisibles dans une colonne | La validation tactile et lecteur d’écran réelle reste nécessaire |

Ces observations sont visuelles et ne remplacent pas les audits axe, clavier, performance ou les tests vendeur connectés de la suite de campagne.

## Performance publique et palettes

La première série Lighthouse mobile simulée, avant optimisation marketplace, donnait 86 puis 88 en Performance pour la marketplace et 84 puis 86 pour la fiche restaurant. Les audits avaient identifié des feuilles WooCommerce et WCFM inutilisées sur la marketplace. Le thème 2.7.5 décharge ces styles sur la page d’accueil uniquement ; il ne modifie ni le panier, ni le checkout, ni les données métier.

Après déploiement et purge LiteSpeed, la seconde série mobile simulée a retourné les valeurs suivantes.

| Route | Passe 1 | Passe 2 | LCP passe 1 | LCP passe 2 | Conclusion |
|---|---:|---:|---:|---:|---|
| Marketplace | 96 | 85 | 2,05 s | 3,08 s | Amélioration ponctuelle, variance staging toujours notable |
| Fiche restaurant | 89 | 85 | 2,75 s | 2,87 s | Proche de la cible, mais non conforme de façon reproductible |

Les scores Accessibilité sont 100, Best Practices 96 ; SEO est 92 pour la marketplace et 100 pour la fiche restaurant sur les quatre passes. Aucun résultat ne permet de déclarer l’objectif Performance ≥90 atteint durablement : seule une passe marketplace dépasse ce seuil.

Le script de contraste des palettes a validé neuf couples nominaux : Comptoir 10,55:1 et 8,17:1 ; Safran 10,90:1 et 6,43:1 ; Jardin 7,53:1 et 7,57:1 ; Nuit 13,19:1, 9,98:1 et 5,61:1. La portée est contrôlée par classe de palette vendeur et la préférence n’a pas été écrite durant cette campagne.

## Qualité, sécurité passive et accessibilité

La campagne a complété l’outillage existant par Semgrep 1.174.0. Les contrôles ont couvert 15 fichiers PHP du thème et des extensions, les scripts JavaScript/MJS publics et de recette, puis le scan `p/security-audit` des sources WordPress. Aucun résultat Semgrep n’a été remonté et toutes les syntaxes ont été validées.

| Contrôle | Résultat | Interprétation |
|---|---:|---|
| Syntaxe PHP | 15 / 15 fichiers | Réussi |
| Syntaxe JavaScript/MJS | Scripts thème et recette | Réussi |
| Semgrep `p/security-audit` | 0 résultat | Réussi pour les règles exécutées ; pas un test d’intrusion |
| Audit dépendances `pnpm --prod` | Échec avec avis connus | Concerne le prototype React et sa chaîne npm locale, non déployée par le thème WordPress ; revue de dépendances recommandée avant toute publication de ce prototype |
| En-têtes HTTP passifs | CSP `upgrade-insecure-requests` présent | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy et Permissions-Policy n’ont pas été observés dans la réponse publique ; configuration hôte/CDN à décider séparément |

Les en-têtes sont relevés passivement et aucune tentative d’exploitation, scan agressif, modification de configuration Hostinger ou accès à une zone authentifiée n’a été effectuée.

La recette publique axe et clavier a exécuté 18 contrôles (Chromium, Firefox et WebKit ; mobile et desktop ; marketplace, restaurant et produit), sans bloqueur ni violation axe. La recette mobile complémentaire a également validé l’ouverture, la fermeture par Échap et le retour de focus du quick view et du panier latéral, sans ajout panier. Après le correctif 2.7.5, les audits axe de la marketplace et de la fiche restaurant ne signalent aucune violation.

| Contrôle de parcours public | Résultat |
|---|---:|
| axe + clavier multi-moteurs | 18 / 18 sans bloqueur |
| Quick view mobile : ouverture, Échap, retour focus | Réussi |
| Panier latéral mobile : ouverture, Échap, retour focus | Réussi |
| Régression Chromium quatre breakpoints | 28 / 28 sans bloqueur |
| Cockpit vendeur connecté | Non exécuté : aucune variable vendeur autorisée |

## Verdict de la campagne

Le **socle public** est désormais vérifié à un niveau élevé : routes, affichage multi-moteurs, comportement clavier, axe, contrastes nominaux, quick view, panier et régression après optimisation CSS ont des preuves automatisées récentes. La direction visuelle reste cohérente avec une expérience premium sur les surfaces publiques observées.

Le CDC ne peut toutefois pas être déclaré conforme à 100 %. Les preuves encore dues sont les parcours vendeur connectés, la persistance réelle des préférences/notifications/palettes, la création et le suivi d’une commande autorisée, les avis réels, un lecteur d’écran natif, un téléphone réel et une performance ≥90 répétable. La cible Performance est maintenant atteinte sur une passe marketplace, mais pas durablement sur toutes les routes et répétitions.

> **Verdict : surfaces publiques prêtes pour une revue humaine premium ; conformité CDC globale encore partielle et correctement documentée.**
