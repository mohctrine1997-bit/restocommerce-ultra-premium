# CDC Maître — RestoCommerce Ultra Premium (UI + UX)

> **Version publique assainie.** Ce document est la référence de pilotage du projet. Les identifiants, liens d’administration signés, nonces, données de recette et éléments propres à un environnement privé en ont été retirés.

## Règle de fonctionnement absolue

> **Aucun lot ne démarre avant que le rapport de recette complet du lot précédent ait été validé explicitement par le propriétaire du projet. Un lot annoncé comme terminé sans ce rapport n’est pas terminé.**

## A. Protocole de vérification standard — applicable à chaque lot

Avant de déclarer un lot terminé, l’équipe doit fournir pour ce lot précis les preuves suivantes.

| Contrôle | Exigence minimale |
| --- | --- |
| Environnement réel | WordPress, WooCommerce et WCFM installés sur un staging réel, jamais une simple simulation front-end isolée. Lorsque l’accès le permet, WP-CLI doit prouver les extensions actives et les modifications de données. |
| Multi-navigateurs | Playwright avec Chromium, Firefox et WebKit, aux formats 390×844, 768×1024, 1440×900 et 1920×1080. WebKit est obligatoire pour couvrir le moteur Safari/iOS. |
| Accessibilité | Analyse axe-core sur chaque page concernée ; zéro violation critique ou sérieuse non justifiée ; au moins un parcours intégral au clavier. |
| Performance | Lighthouse mobile avec limitation réseau/CPU sur chaque page concernée. Cibles : Performance ≥ 90, Accessibilité ≥ 95, Bonnes pratiques ≥ 95. |
| Régression visuelle | Captures avant/après et diff Pixelmatch chiffré sur les pages concernées, dans les trois moteurs. |
| Rapport de recette | Rapport écrit, factuel, indiquant explicitement tout écart résiduel. |
| Vérification humaine | Test du parcours réel par le propriétaire du projet sur téléphone avant validation. |

## B. Lot 0 — Environnement de test, prérequis bloquant

**Objectif :** créer une base de recette fiable et réutilisable pour tous les lots suivants.

- Vérifier le staging WordPress avec WooCommerce, WCFM et le thème RestoCommerce actifs.
- Installer ou valider WP-CLI, Playwright trois moteurs, axe-core, Lighthouse CI, Pixelmatch et PNGJS.
- Créer des comptes de test vendeur et client restreints, réutilisables sans exposer leurs identifiants.
- Fournir une commande ou un script qui relance la matrice navigateur, accessibilité, performance et visuel.

**Definition of Done :** l’environnement fonctionne, les trois moteurs Playwright s’exécutent et un premier rapport Lighthouse/axe-core est disponible sur la home.

## C. Lot 1 — Fondations UX invisibles

**Objectif :** établir les briques qui rendent les parcours crédibles et cohérents.

- États obligatoires de chargement, vide, erreur et succès sur chaque liste ou écran.
- Micro-interactions systématiques avec `cubic-bezier(.23,1,.32,1)` et une durée de 200 à 320 ms.
- Contraste AA, focus clavier cohérent, libellés accessibles pour les boutons icône et ordre de tabulation logique.
- Images lazy-loadées, dimensions déclarées et objectifs Lighthouse du protocole.
- Cohérence des écrans secondaires : légal, 404 et réglages.

**Definition of Done spécifique :** les quatre états sont capturés sur au moins trois listes : commandes, menu et marketplace.

## D. Lot 2 — Gestion complète des produits restaurateur

**Objectif :** permettre réellement au restaurateur d’ajouter et gérer plats, familles et options sans formulaire WooCommerce/WCFM brut.

- Assistant mobile : photo → catégorie → nom, avec dictée vocale progressive → prix au clavier numérique → options facultatives → aperçu → publication ; une décision par écran.
- Catégories par icônes prédéfinies ; création libre seulement si le restaurateur insiste.
- Groupes d’options réutilisables, tels que Sauce ou Suppléments, avec questions « Obligatoire ? » et « Combien de choix maximum ? », pilotées par de grands boutons 1, 2, 3 ou Illimité.
- Duplication rapide d’un plat.
- Bascule disponible/indisponible en une action sur les plats, catégories et options.
- Aucun jargon technique vendeur : « variation », « attribut » et « SKU » sont interdits dans l’interface.
- Aide WhatsApp humaine visible à chaque étape.

**Definition of Done spécifique :** une recette crée réellement un plat avec Sauce limitée à deux choix, prouve l’existence du produit et de ses règles, vérifie le rendu client et impose la limite au moment de la commande, côté interface et serveur.

## E. Lot 3 — Onboarding et création de boutique

**Objectif :** guider un nouveau restaurateur, même peu digital, lors de sa première configuration.

- Assistant : nom, zone/adresse, couverture, horaires simples, premiers plats via Lot 2 et choix de palette via Lot 9.
- Barre de progression simple, jamais un formulaire long.
- Sauvegarde automatique à chaque étape, avec reprise ultérieure.
- Fin claire : boutique visible immédiatement avec confirmation explicite.

**Definition of Done spécifique :** parcours mobile WebKit complet aboutissant à une boutique réellement visible sur la marketplace.

## F. Lot 4 — Aide contextuelle et tour guidé

**Objectif :** éviter qu’un restaurateur peu digital se retrouve seul face à une interface inconnue.

- Tour au premier accès : trois à quatre bulles maximum sur commandes, ajout de plat et statut ouvert/fermé ; désactivable définitivement.
- Aide contextuelle persistante avec icône « ? » sur les écrans complexes.
- Aide WhatsApp disponible sur tout le dashboard, pas uniquement l’ajout de plat.

**Definition of Done spécifique :** capture mobile du tour et preuve qu’il ne réapparaît pas après son premier passage.

## G. Lot 5 — Notifications temps réel

**Objectif :** transformer la cloche visuelle en information réelle pour les nouvelles commandes.

- Notification navigateur et/ou WhatsApp à chaque nouvelle commande.
- Mise à jour sans rechargement du badge des commandes actives.
- Signal sonore ou vibration discret, configurable, adapté à la cuisine.

**Definition of Done spécifique :** une commande simulée côté client est visible côté vendeur sans rafraîchissement manuel.

## H. Lot 6 — Suivi de commande côté client

**Objectif :** apporter un suivi digital structuré après le checkout WhatsApp.

- Étapes visibles et synchronisées : Reçue → En préparation → Prête → Récupérée/Livrée.
- Notification client à chaque évolution, WhatsApp au minimum dans un premier temps.

**Definition of Done spécifique :** un changement vendeur est visible côté client en quelques secondes.

## I. Lot 7 — Avis et notation clients

**Objectif :** créer des signaux de confiance authentiques, jamais de faux avis.

- Étoiles et commentaire court uniquement après une commande réelle.
- Moyenne visible dans la fiche restaurant et les cartes marketplace.
- Modération simple par le restaurateur pour signaler un avis abusif.

**Definition of Done spécifique :** un avis posté après commande de test apparaît publiquement.

## J. Lot 8 — Analytics et insights actionnables

**Objectif :** donner au restaurateur des décisions utiles plutôt que de simples chiffres.

- « Plat le plus vendu cette semaine », « Plat non commandé depuis X jours » et tendances 7/30 jours.
- Cartes éditoriales cohérentes avec la charte, sans tableaux techniques bruts.

**Definition of Done spécifique :** les insights reflètent des données de commandes de test réelles, pas des valeurs statiques.

## K. Lot 9 — Système de palettes personnalisables

**Objectif :** proposer quatre identités de boutique sans altérer le chrome global de la marketplace.

- Palettes : Ivoire & Vert Sauge par défaut, Anthracite & Or, Pierre & Bordeaux, Bleu Nuit & Cuivre.
- Application limitée à la boutique restaurateur : fiche, produits, panier de ses articles et cockpit.
- Choix par grandes vignettes avec aperçu réel, jamais un champ de code couleur.
- Contraste WCAG AA vérifié pour chaque palette.

**Definition of Done spécifique :** scores de contraste et captures desktop/mobile de la fiche dans les quatre palettes.

## L. Lot 10 — Design system documenté

**Objectif :** empêcher toute dérive visuelle du thème.

- Documentation vivante : palettes, typographies, échelle d’espacement, boutons, cartes, pilules, badges et règles d’icônes.
- Mise à jour obligatoire à chaque nouveau composant visuel.

**Definition of Done spécifique :** le document est à jour et couvre 100 % des composants des lots livrés.

## M. Lot 11 — Décision stratégique checkout WhatsApp ou paiement intégré

**Objectif :** trancher consciemment entre pragmatisme WhatsApp et standard international de paiement.

- Rédiger une recommandation comparant maintien de WhatsApp avec suivi Lot 6, et investissement carte/wallet intégré.
- Décrire avantages, limites et effort estimé.
- Obtenir une décision explicite avant tout code de paiement.

**Definition of Done spécifique :** recommandation reçue et décision actée avant développement paiement.

## N. Lot 12 — Performance sur appareils bas de gamme

**Objectif :** couvrir le cas d’un téléphone Android d’entrée/milieu de gamme et d’un réseau 3G/4G faible.

- Test sur appareil réel ou émulation Playwright avec limitation CPU/réseau agressive.
- Parcours critiques : ajout panier, ajout plat, changement de statut commande.
- Aucun retour visuel d’action critique ne doit dépasser environ une seconde en connexion dégradée.

**Definition of Done spécifique :** rapport avec limitations appliquées sur les trois parcours critiques.

## O. Ordre de traitement recommandé

1. Lot 0 — environnement.
2. Lot 1 — fondations UX.
3. Lot 2 — gestion produits.
4. Lot 3 — onboarding, dépendant du Lot 2.
5. Lot 4 — aide contextuelle.
6. Lot 9 — palettes, parallélisable avec les Lots 5 à 8 si la règle de validation est préservée.
7. Lot 5 — notifications.
8. Lot 6 — suivi client.
9. Lot 7 — avis.
10. Lot 8 — analytics.
11. Lot 11 — décision checkout, réalisable tôt car il s’agit d’une décision.
12. Lot 12 — performance bas de gamme, validation transverse finale.
13. Lot 10 — design system, maintenu en continu puis vérifié complètement à la fin.

> **Rappel :** tout lot ne démarre qu’après validation explicite du rapport complet du lot précédent.
