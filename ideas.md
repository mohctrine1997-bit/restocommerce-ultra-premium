# Direction artistique — RestoCommerce Theme

## Trois pistes explorées

### 1. Le Comptoir Éditorial
**Très brève introduction :** Une direction chaleureuse inspirée des magazines culinaires contemporains et des cartes de bistrot. Elle privilégie la matière, la photographie généreuse et une lecture calme, avec une efficacité mobile de produit numérique.

**Probabilité :** 0,037

### 2. Le Marché Solaire
**Très brève introduction :** Un univers méditerranéen lumineux, vivant et artisanal, avec des couleurs de marché, des repères graphiques expressifs et des animations légères. Il exprime la proximité, la diversité et la fraîcheur des cuisines locales.

**Probabilité :** 0,082

### 3. L’Atelier Nocturne
**Très brève introduction :** Une esthétique de cuisine ouverte sophistiquée, construite autour de surfaces sombres, d’éclats cuivrés et de détails lumineux précis. Elle vise une clientèle premium, avec un caractère plus affirmé et théâtral.

**Probabilité :** 0,019

---

# Direction retenue : Le Comptoir Éditorial

## Design Movement

**Éditorial gastronomique contemporain**, entre le journal de cuisine indépendant et l’efficacité d’une application de commande mobile. Le site privilégie la chaleur humaine, des matières presque tactiles et une architecture de l’information instantanément compréhensible.

## Core Principles

1. **La gourmandise avant la décoration :** les plats, les décisions d’achat et les informations utiles restent toujours prioritaires.
2. **Une rapidité perceptible :** interfaces peu chargées, contrôles directs, mouvement bref et sans animation lourde.
3. **Une hiérarchie éditoriale forte :** contrastes typographiques, largeurs de lecture variées et repères permanents pour guider sans surcharger.
4. **Une personnalité locale maîtrisée :** chaque restaurant peut exprimer son identité sans casser l’unité premium de la plateforme.

## Color Philosophy

La couleur de base est une **ivoire chaud**, rappelant le papier de menu et l’hospitalité. Un **vert feuille profond** crée la confiance pour les actions et les états de disponibilité ; une terre cuite douce ajoute la sensation de cuisine et d’énergie. Les couleurs sont utilisées en aplats nets, sans dégradés décoratifs, pour conserver une excellente lisibilité, limiter le poids graphique et favoriser des captures produits lumineuses.

## Layout Paradigm

Une **composition de table en mouvement** : sur la page restaurant, une colonne éditoriale fine contient le contexte et les catégories, tandis que le menu se déploie comme une série de feuilles de commande dans une zone plus généreuse. Le panier s’ancre à droite sur grand écran et devient un rail inférieur mobile. Le dashboard repose sur un plan de travail latéral avec des blocs de décision, et non sur une grille uniforme de cartes.

## Signature Elements

1. **L’étiquette de plat** : petit repère couleur, avec catégorie et disponibilité, présent dans le menu, le panier et les commandes.
2. **Le trait de service** : ligne organique et courte qui sépare les séquences de lecture, les catégories et les zones de commande.
3. **Le médaillon de commande** : disque vert profond qui matérialise le panier, les commandes actives et les alertes utiles.

## Interaction Philosophy

Chaque action doit produire un retour explicite : ajout au panier visible, quantité modifiable sans quitter le contexte, panneau latéral cohérent et message WhatsApp facilement compréhensible. Les contrôles les plus importants sont placés dans le pouce sur mobile. Les éléments décoratifs ne bloquent jamais une action ni n’ajoutent un délai.

## Animation

Les animations sont limitées à l’opacité et aux transformations, entre 120 et 240 ms, avec une courbe `cubic-bezier(0.23, 1, 0.32, 1)`. Le panier entre depuis la droite sur ordinateur et depuis le bas sur mobile ; les ajouts de plats font rebondir subtilement le médaillon de commande. Les filtres et le quick view apparaissent sans déplacement excessif. Toutes les animations non essentielles sont désactivées sous `prefers-reduced-motion`.

## Typography System

**DM Serif Display** porte les titres de restaurants et les grands temps éditoriaux, avec des contrastes de taille assumés. **Manrope** porte l’interface, les prix, les tableaux et le texte descriptif, avec une lisibilité élevée sur petits écrans. Les titres ont une cadence courte et généreuse ; les informations opérationnelles ont une taille minimum de 14 px et des chiffres tabulaires quand nécessaire.

## Brand Essence

**Une plateforme de commande gastronomique locale qui permet aux restaurateurs de vendre avec l’élégance d’une grande maison et la simplicité d’un message.**

Personnalité : **généreuse, précise, contemporaine**.

## Brand Voice

Les titres sont directs, sensoriels et sans jargon technique. Les appels à l’action décrivent l’action réelle, sans formulation générique.

Exemples :

> « Votre table préférée, prête à emporter. »

> « Ajouter ce plat au comptoir. »

## Wordmark & Logo

Le symbole est une **assiette vue du dessus traversée par une trajectoire de service**, construite avec un cercle irrégulier et une ligne courte. Il peut être utilisé seul comme favicon ou avatar de navigation ; le nom de marque s’affiche dans une composition typographique éditoriale, jamais avec une police système par défaut.

## Signature Brand Color

**Vert Service — #173F35** : un vert profond, distinctif et chaleureux, utilisé pour les décisions de commande, l’identité du dashboard et les accents de confiance.

## Exigences de performance non négociables

- Pas de constructeur de pages ni de dépendance visuelle lourde dans le thème final WordPress.
- HTML sémantique, CSS critique minimal, JavaScript chargé uniquement pour les interactions nécessaires.
- Images servies en WebP/AVIF, dimensions explicites, chargement différé hors zone visible et préchargement limité au visuel LCP.
- Police auto-hébergée et sous-ensemblée dans la version WordPress ; aucune ressource externe bloquante.
- Thème compatible avec un cache de page/CDN, avec exclusion stricte du panier, du compte et des zones WooCommerce dynamiques.
- Données structurées Schema.org Restaurant et Menu, titres uniques, métadonnées sociales et navigation accessible.

## Style Decisions

- Le **trait de service** devient un séparateur organique récurrent dans les séquences majeures, au lieu de simples lignes génériques.
- Les états de commande actifs utilisent systématiquement le **médaillon Vert Service** comme repère de commerce reconnaissable.
- Le menu doit être lu comme des **feuilles de commande éditoriales** : une image généreuse, un étiquetage de service, un prix net et des séparations de rythme avant l’apparence de grille e-commerce.

## Extension marketplace

La page d’accueil devient le **marché éditorial** de la plateforme : elle n’essaie pas de ressembler à une place de marché impersonnelle. Elle introduit un lieu, une zone et un moment de consommation, puis présente les restaurants comme des maisons singulières. La recherche et les filtres sont immédiats, tandis que chaque carte restaurant emploie une image généreuse, une information opérationnelle concise et le trait de service comme repère de continuité.

Les états transactionnels utilisent toujours le **médaillon Vert Service** : panier, ajout de plat, commande active et accès à une fiche. Dès l’ouverture de la marketplace, une table ou un plat réel accompagne le travail typographique, pour que la gourmandise soit tangible avant toute navigation.

## Déclinaison dashboard — Atelier du Service

Le dashboard devient un **poste de service calme**, conçu pour un restaurateur qui ne connaît ni WooCommerce ni WCFM. L’ivoire chaleureux reste le fond de travail, le Vert Service (`#173F35`) devient la couleur de décision sûre et la **Terre cuite de service (`#D77757`)** signale seulement ce qui attend une réponse. Cette palette est mate et lumineuse afin de rester lisible en plein soleil, en terrasse ou en cuisine.

La structure mobile suit une **colonne de service** : état du restaurant, prochain geste, puis quatre destinations fixes dans le pouce : **Aujourd’hui**, **Commandes**, **Menu** et **Boutique**. Les écrans techniques de WCFM restent accessibles via une entrée secondaire « Plus », mais ne doivent jamais détourner l’attention des actions fréquentes.

Le premier écran privilégie le module **« Le prochain geste »**, formulé avec un verbe complet comme « Accepter 2 commandes », « Modifier le tajine du jour » ou « Mettre le restaurant en pause ». Les libellés critiques restent écrits en toutes lettres, les zones tactiles ne descendent pas sous 48 px et les actions sensibles demandent une confirmation explicite. Le bouton persistant **« Besoin d’aide ? »** explique chaque passage sans vocabulaire technique.

Les interactions durent au plus 220 ms, exclusivement par opacité et translation de 8 px ; les boutons se compressent légèrement à l’appui et renvoient immédiatement un état textuel. Les courbes et tableaux analytiques sont secondaires : une commande à confirmer ou un plat indisponible passe toujours avant une statistique. Cette déclinaison conserve DM Serif Display pour les temps de contexte et Manrope pour toutes les actions et données opérationnelles.

### Style Decisions — Dashboard

- Le menu WCFM complet est secondaire sur mobile ; la navigation principale ne montre que **Aujourd’hui**, **Commandes**, **Menu** et **Boutique**.
- Le dashboard met en avant exactement trois gestes : **accepter une commande**, **modifier la disponibilité ou le prix d’un plat**, **ouvrir ou fermer le restaurant**.
- Les widgets techniques et les graphiques sont relégués après les décisions de service ; ils ne doivent pas occuper la première hauteur d’écran mobile.
