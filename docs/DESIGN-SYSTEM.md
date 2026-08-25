# Système de design RestoCommerce

**Version de référence :** thème RestoCommerce 2.7.52 (staging Hostinger, 25 août 2026)
**Auteur :** Manus AI
**Langue de l’interface :** français
**Principe directeur :** *Le Comptoir Éditorial / Atelier du Service*.

RestoCommerce met en relation une vitrine de restaurant éditoriale, des parcours de commande WooCommerce et un cockpit pour restaurateurs. Le système privilégie des décisions lisibles, un vocabulaire concret et une hiérarchie calme. Une action importante doit se comprendre en un regard, y compris sur un téléphone tenu à une main.

> **Règle de cohérence :** une interface ne devient pas plus premium en multipliant les ornements. Elle le devient quand la typographie, les contrastes, les espacements et les retours d’état rendent chaque décision évidente.

## Fondations visuelles

### Couleurs fondatrices

La palette de base ne doit pas être traitée comme une collection de décorations. L’ivoire accueille le contenu long, le vert organise les décisions et la terre cuite identifie l’action qui fait avancer le parcours. Le blanc chaud intervient uniquement pour isoler une carte ou un champ sans rompre la chaleur du fond.

| Rôle | Jeton documentaire | Valeur | Usage principal |
|---|---|---:|---|
| Encre éditoriale | `--rc-ink` | `#173f35` | Titres, navigation, surfaces profondes |
| Fond ivoire | `--rc-paper` | `#f7f3eb` | Fond public, zones calmes, panneaux |
| Action terre cuite | `--rc-accent` | `#853725` | CTA primaires, états d’avancement |
| Texte secondaire | `--rc-muted` | `#567067` | Métadonnées et explications courtes |
| Bordure douce | `--rc-line` | `#d5dfd7` | Séparation de cartes, champs et panneaux |
| Carte claire | `--rc-card` | `#fffdf8` | Cartes de menu et modules ciblés |
| Signal service | `--rc-signal` | `#6b9980` | Disponibilité et confirmations non critiques |
| Mise en avant chaude | `--rc-clay` | `#e98d69` | Repère décoratif, jamais seul indicateur d’état |

Les contrastes sont déterminés par la surface effectivement visible, et non par le parent CSS. Le texte sur une image reçoit toujours un wash ou une surface de garantie. Les messages d’état emploient simultanément une couleur, un libellé et, lorsque nécessaire, une icône ou un motif.

### Palettes par restaurant

Chaque restaurant peut choisir une palette à partir du cockpit. La sélection est persistée seulement après consentement explicite et reste confinée au cockpit concerné, à sa fiche et à ses produits. La marketplace générale conserve son langage visuel de base.

| Identifiant | Nom affiché | Encre | Surface | Action |
|---|---|---:|---:|---:|
| `comptoir` | Comptoir éditorial | `#173f35` | `#f7f3eb` | `#853725` |
| `safran` | Anthracite & Or | `#2b2b2b` | `#fff7e7` | `#c79a3b` |
| `jardin` | Pierre & Bordeaux | `#46514c` | `#e0d7c9` | `#7a263a` |
| `nuit` | Bleu Nuit & Cuivre | `#f7f3eb` | `#1f2b2b` | `#d99055` |

Le contrôle automatisé de la palette vérifie les couples nominaux de texte et action à un ratio minimal de **4,5:1**. Les boutons Safran sur l’or utilisent explicitement l’encre anthracite; les textes Nuit sur les surfaces sombres utilisent l’ivoire ou l’ivoire secondaire. Toute future palette doit être ajoutée à ce contrôle avant sa publication.

### Typographie

La paire typographique est volontairement contrastée. **DM Serif Display** porte le rythme éditorial des titres et des prix mis en avant ; **Manrope** assure la lecture fonctionnelle des actions, champs, filtres et informations transactionnelles. Aucun écran ne doit substituer une police système pour un titre principal sans raison de performance mesurée.

| Niveau | Police | Taille recommandée | Graisse / interligne | Usage |
|---|---|---:|---|---|
| Affiche | DM Serif Display | 2,4–4,8 rem | 400 / 0,95–1,05 | Hero restaurant, grandes sections |
| Titre de section | DM Serif Display | 1,5–2,1 rem | 400 / 1,05 | Carte, panneaux et éditorial |
| Titre opérationnel | Manrope | 0,95–1,2 rem | 800 / 1,2 | Cockpit, listes, produits |
| Texte courant | Manrope | 0,88–1 rem | 400–600 / 1,45–1,65 | Descriptions, formulaires |
| Étiquette | Manrope | 0,65–0,75 rem | 800 / 1 | Statuts, sourcils, métadonnées |

Les titres restent courts et concrets : « Votre service en un regard », « Ouvrir la carte », « Ajouter un plat ». Les CTA décrivent le résultat attendu et évitent les formulations génériques.

### Espacement, grille et rayons

Le système utilise une cadence de 4 px, exprimée en valeurs relatives dans les composants. Les vues publiques favorisent les compositions éditoriales fluides ; le cockpit privilégie les panneaux alignés et les marges de sécurité tactile. Les cartes ne sont pas systématiquement centrées : les grandes sections respirent par l’asymétrie, les panneaux opérationnels par l’alignement.

| Échelle | Valeur indicative | Emploi |
|---|---:|---|
| `space-1` | 0,25 rem | Ajustement interne, icône/label |
| `space-2` | 0,5 rem | Groupe de contrôles compact |
| `space-3` | 0,75 rem | Contenu de carte, liste courte |
| `space-4` | 1 rem | Champ, bouton, séparation standard |
| `space-6` | 1,5 rem | Carte et section de cockpit |
| `space-8` | 2 rem | Transition entre modules majeurs |
| `space-12` | 3 rem | Séparation éditoriale desktop |

Les rayons sont mesurés : environ `0,7–0,9 rem` pour les cartes et panneaux, `999 px` seulement pour les pills. Les ombres sont diffuses et discrètes ; une bordure douce est préférée lorsqu’elle structure mieux l’information.

## Composants publics

### Navigation et hero restaurant

La fiche restaurant comporte un hero image natif responsif, une couche de contraste et une action nette vers la carte. L’image LCP est traitée comme un contenu éditorial et non comme un fond décoratif : elle reste découverte tôt, visible et non lazy. Le titre et la description ne doivent jamais dépendre de la luminosité brute d’une photo.

| Composant | Anatomie | Comportement |
|---|---|---|
| Header marketplace | Marque, navigation, panier, accès compte | Reste lisible à chaque breakpoint |
| Hero restaurant | Image, wash, titre, description, CTA | CTA mène à la carte ; contenu en premier plan |
| Navigation de carte | Liens de catégories et repères | Défilement sans perte de contexte |
| Carte plat | Image, catégorie, nom, prix, disponibilité, action | La disponibilité est libellée, pas seulement colorée |
| Résumé avis | Étoile, moyenne, compteur | Rendu uniquement si des avis vérifiés réels existent |
| État pause | Message de service et action désactivée | La carte reste visible, la prise de commande est expliquée |

### Quick view, configurateur et panier latéral

Le quick view et la fiche produit partagent le même configurateur : variations, suppléments, note cuisine et prix final restent dans le même ordre. Sur desktop, l’image conserve son ratio naturel. Sur mobile, elle demeure visible avant les choix. Le panier latéral est un dialogue à échappement clair, avec focus maintenu seulement lorsqu’il est ouvert.

| Composant | Règle de contenu | Règle d’interaction |
|---|---|---|
| Quick view | Nom, photo, prix, options et ajout dans un seul flux | Fermeture par bouton, Échap et retour du focus |
| Groupe d’options | Titre, contrainte, contrôles radio/checkbox | Libellés cliquables ; limite expliquée avant validation |
| Bouton ajouter | Prix actualisé et libellé concret | Désactivé seulement lorsqu’un choix obligatoire manque |
| Side cart | Lignes, quantités, total, itinéraire checkout | Hors ouverture, aucune capture de focus ni lecture superflue |
| Checkout WhatsApp | Récapitulatif et prochaine étape explicite | Pas de paiement réel implicite ; lien configuré côté serveur |

### Suivi et avis

Le reçu WooCommerce peut afficher le suivi par restaurant lorsque la clé de commande est valide. Les avis sont rattachés à une commande terminée, une seule fois par restaurant. Aucun composant ne fabrique une note ou un témoignage pour remplir un espace vide.

| Composant | Source | Garde |
|---|---|---|
| Frise de suivi | État vendeur associé à la commande | Clé WooCommerce obligatoire |
| Lien WhatsApp de suivi | Résolveur serveur | Masqué sans configuration |
| Formulaire d’avis | Commande terminée et clé valide | Un avis commande–restaurant |
| Signalement vendeur | Métadonnée de modération | Ne supprime ni masque automatiquement l’avis |

## Cockpit « Atelier du Service »

Le cockpit présente une seule action prioritaire par zone. L’interface sépare le suivi du service, les commandes, le menu, les repères de carte et la boutique sans reproduire le chrome dense de WCFM. Une restauratrice ou un restaurateur doit pouvoir retrouver le statut de service, l’action suivante sur une commande et le bouton d’ajout de plat sans connaissance préalable de WooCommerce.

| Composant | Rôle | États requis |
|---|---|---|
| Bandeau de service | Ouvrir ou mettre en pause le restaurant | Ouvert, fermé, focus, retour de sauvegarde |
| Métrique | Mettre en évidence commandes et ventes du jour | Donnée réelle, absence de donnée, chargement non bloquant |
| Liste de commandes | Faire avancer une commande | À confirmer, en cuisine, prête, terminée |
| Assistant produit | Créer ou mettre à jour un plat | Étape, erreur de champ, succès sans reload |
| Notifications | Lire les alertes de commandes | Nouvelle, lue, vide, permission navigateur refusée |
| Tour et aide | Expliquer le premier usage | Début, progression, fermeture persistante, reprise par aide |
| Repères de carte | Analyser les ventes réelles | Historique insuffisant clairement indiqué |
| Tiroir d’avis | Consulter et signaler | Vide, avis, signalé sans suppression |
| Tiroir palettes | Choisir une ambiance | Sélection, sauvegarde, erreur, retour focus |

Les panneaux latéraux utilisent `role="dialog"`, un titre associé et un bouton de fermeture visible. Le focus retourne au déclencheur après la fermeture. Les actions de sauvegarde emploient une annonce courte et ne rechargent pas la page sans nécessité métier.

## Buttons, cartes, pills, badges et icônes

### Boutons

Un bouton primaire porte une action qui avance un objectif : ajouter au panier, publier, accepter ou enregistrer. Un bouton secondaire aide à consulter, actualiser ou ouvrir une aide. Les liens sont réservés à la navigation réelle. Le texte d’un bouton doit rester intelligible hors contexte.

| Variante | Style | Exemples |
|---|---|---|
| Primaire | Fond terre cuite ou accent de palette, texte contrasté | « Ajouter au panier », « Publier le plat » |
| Secondaire | Fond clair, bordure douce, encre | « Actualiser », « Consulter les avis » |
| Texte / lien | Sans faux contour, flèche optionnelle | « Voir mon restaurant » |
| Danger évité | Aucun rouge décoratif par défaut | Employer un libellé explicite avant toute action irréversible |

Les boutons ont une cible tactile confortable, un état `:focus-visible` de 3 px et un retour `:active` discret. Ils n’emploient jamais le seul changement de couleur pour indiquer l’état désactivé ou la réussite.

### Cartes et pills

Les cartes isolent une décision ou une lecture courte. Une carte ne doit pas contenir plusieurs CTA primaires concurrents. Les pills sont réservées aux catégories, statuts brefs et filtres ; elles ne remplacent pas un libellé de statut détaillé dans une commande.

| Primitive | Usage autorisé | Usage à éviter |
|---|---|---|
| Carte menu | Présenter un plat et son action | Empiler de longs paragraphes transactionnels |
| Carte insight | Montrer une donnée source et sa période | Déduire une recommandation sans historique |
| Pill | Catégorie, statut compact, badge compteur | Naviguer entre écrans ou masquer une décision critique |
| Badge | Nombre de notifications non lues | Indiquer seul une erreur ou une pause de service |

### Icônes

Les icônes complètent une action avec un label accessible : panier, cloche, aide, boutique, service. Elles ont une taille régulière et ne servent jamais seules à un contrôle ambigu. Une icône uniquement décorative est masquée aux technologies d’assistance ; une icône d’action reçoit un `aria-label` précis.

## Inventaire des composants livrés et source de vérité

La documentation couvre les composants effectivement livrés dans les Lots 1 à 9. Le tableau ci-dessous constitue la liste de contrôle à mettre à jour lorsqu’un nouveau composant visuel est ajouté; un composant ne doit pas introduire une couleur, un rayon ou une transition hors des primitives documentées sans justification écrite.

| Surface | Composants couverts | Feuille ou template de référence | Données / état à documenter |
|---|---|---|---|
| Marketplace | header, cartes restaurant, cartes plat, résumé d’avis, compteur panier | `front-page.php`, `front-end.css`, `wcfm-store.css` | vide, chargement, erreur, avis absent |
| Fiche restaurant | hero, wash, navigation de carte, cartes produits, pause, informations | `storefront.php`, `vendor-palettes.css` | boutique introuvable, service fermé, avis vérifiés |
| Produit et panier | quick view, configurateur, groupes Sauce/Suppléments, side-cart, lignes panier par vendeur | `product-configurator.css`, `cart-drawer.css`, `commerce-flows.css` | contrainte obligatoire, limite, succès, erreur serveur |
| Checkout et reçu | formulaire checkout, confirmation, lien WhatsApp, frise de suivi, formulaire d’avis | `commerce-flows.css`, `functions.php` | clé invalide, commande reçue, suivi par état |
| Cockpit | bandeau service, métriques, commandes, menu, insights, aide, tour, notifications, avis, palettes | `vendor-dashboard.php`, `vendor-dashboard-app.css`, `vendor-palettes.css` | états vides/erreur/succès, permissions, persistance |
| Onboarding | progression, étapes boutique, premier produit, reprise et confirmation | `vendor-onboarding.js`, `vendor-dashboard.php` | sauvegarde, reprise, abandon, boutique publiée |
| États transverses | chargement, vide, erreur, succès, focus, reduced motion, 404 | `accessibility-remediation.css`, templates et scripts de lot | message honnête et action suivante |

Les tokens de palette sont maintenus dans `assets/css/vendor-palettes.css`; les libellés métier persistés sont `comptoir`, `safran`, `jardin` et `nuit` afin de préserver les préférences existantes. Les couleurs réelles de Safran et Jardin sont désormais celles du tableau ci-dessus, et non les anciennes valeurs historiques conservées dans aucun composant actif.

## Accessibilité et mouvement

RestoCommerce applique une approche mobile-first. Chaque surface interactive est atteignable au clavier, possède un focus visible et respecte un ordre de tabulation qui suit la lecture. Les messages de succès ou d’erreur sont annoncés, les tiroirs ont un titre et une sortie claire, et les états vides expliquent la prochaine donnée attendue au lieu d’imiter un résultat.

| Sujet | Règle de mise en œuvre |
|---|---|
| Focus | Anneau visible de 3 px, jamais supprimé au profit d’un simple changement de couleur |
| Clavier | Échap ferme les surfaces modales ; retour focus au déclencheur |
| Contraste | Minimum 4,5:1 pour le texte nominal ; contrôle dédié aux palettes |
| Toucher | Contrôles assez grands et espacés pour un usage à une main |
| Formulaires | Label visible, erreur associée, contrainte explicitée avant soumission |
| Mouvement | Transitions de 200–320 ms, limitées à opacité et transform ; respect de `prefers-reduced-motion` |
| Données absentes | État explicite, sans métrique, avis, notification ni recommandation artificielle |

## Règles de contribution

Toute nouvelle surface doit commencer par préciser son utilisateur, son action principale, son état vide et sa stratégie de retour d’erreur. Elle réutilise les primitives existantes avant d’introduire une nouvelle variation. Les feuilles de style documentent en tête la direction visuelle du fichier ; elles restent ciblées à leur route afin de ne pas dégrader le storefront, le checkout ou la marketplace.

Avant livraison, une modification visuelle est vérifiée sur mobile, tablette et desktop, puis au clavier. Un composant qui dépend d’une donnée WooCommerce doit rendre un état honnête lorsque cette donnée n’existe pas. Une modification qui exige une écriture de préférence ou de données métier n’est exécutée qu’après un geste explicite de l’utilisateur concerné.

## Recherche home — 2.7.56

Le trigger de recherche est une action contextuelle de la home, placée entre la navigation et le contexte panier. Il doit rester une action discrète mais immédiatement identifiable, avec le raccourci `⌘K` visible sur desktop. Le dialogue reprend les primitives éditoriales RestoCommerce : surface ivoire, typographie serif de titre, accent corail réservé à l’action principale et suggestions sous forme de puces.

Le composant est rendu côté PHP dans `front-page.php` et ne doit pas être transformé en application React. Le clavier ouvre avec Ctrl/Cmd+K, place le focus dans le champ, accepte `Escape`, restitue le focus au trigger à la fermeture et maintient `aria-expanded` synchronisé. La soumission doit réutiliser le filtre marketplace existant et rendre un état vide honnête lorsque la requête ne correspond à aucune carte.
