# Architecture UX cible — RestoCommerce Ultra Premium

## Principe d’architecture

WCFM doit rester le moteur de données, de permissions et de compatibilité WooCommerce; il ne doit plus être la couche visuelle principale des parcours que le client ou le restaurateur utilise chaque jour. RestoCommerce devient la coque d’expérience : navigation, composants, états, microcopy, feedback, responsive et accessibilité sont fournis par le thème et ses modules dédiés.

Cette séparation évite deux erreurs : réécrire la logique métier sensible dans le thème, ou accepter indéfiniment le chrome technique de WCFM dans un produit qui revendique une expérience premium.

## Surfaces et stratégie de migration

| Surface | Cible UX | Source métier autorisée | Priorité |
| --- | --- | --- | ---: |
| Marketplace, accueil et recherche | Coque RestoCommerce complète | Templates thème + requêtes Woo/WCFM en lecture | P0 |
| Fiche restaurant et menu | Coque complète, palettes isolées au restaurant | Profil WCFM, produits WooCommerce, avis vérifiés | P0 |
| Fiche produit, options et panier | Coque complète, feedback instantané | WooCommerce et endpoints sécurisés du thème | P0 |
| Checkout, reçu et suivi | Coque complète et statut explicite | WooCommerce, clé de commande, métadonnées vendor state | P0 |
| `/store-manager/` accueil | Cockpit RestoCommerce complet | WCFM pour autorisations et résumé | P0 |
| Commandes vendeur | Écran RestoCommerce complet | Endpoint serveur nonce + ownership | P0 |
| Produits/menu vendeur | Wizard et liste RestoCommerce complets | Endpoint serveur nonce + ownership | P0 |
| Profil, horaires et capacité | Coque RestoCommerce complète | WCFM profile settings via adaptateur | P1 |
| Avis vendeur et notifications | Tiroirs RestoCommerce complets | Commentaires Woo + métadonnées de modération | P1 |
| Rapports et analytics avancés | Coque RestoCommerce avec cartes lisibles | WCFM/Woo analytics normalisés | P1 |
| Retraits, remboursements et réglages rares | WCFM conservé derrière une coque de transition | WCFM natif; aucune duplication métier | P2 |
| Admin WordPress/WooCommerce | Admin natif hors promesse de thème | WordPress/WooCommerce | Hors périmètre UI public |

## Règles de transition WCFM

Lorsqu’une fonction n’est pas encore migrée, la route WCFM doit afficher une barre RestoCommerce persistante avec le nom du produit, le fil d’Ariane, l’état de chargement, un bouton de retour au cockpit et une aide contextuelle. Les écrans techniques ne doivent jamais apparaître comme une rupture silencieuse. Leur statut doit être explicitement « compatibilité avancée » jusqu’à leur migration.

La migration se fait route par route. Une route n’est retirée de WCFM qu’après validation de ses permissions, de ses erreurs réseau, de ses états vide/chargement/succès/erreur, de son clavier, de son responsive et de ses temps p95. Le thème ne doit pas appeler des endpoints WCFM depuis le navigateur sans nonce, contrôle d’ownership et traitement d’erreur lisible.

## Coque visuelle unifiée

La coque premium doit conserver un header léger, une navigation desktop stable, une navigation mobile utilisable au pouce, un conteneur de contenu à largeur maîtrisée, une hiérarchie typographique constante et un système de feedback global. Chaque route connaît son contexte : client, restaurant courant ou cockpit vendeur. Le chrome global ne doit pas changer de palette lorsqu’un restaurant change sa propre identité.

Chaque composant visuel doit consommer un token documenté. Il ne doit pas introduire directement une couleur hexadécimale, un rayon ou une durée d’animation sans justification dans le design system. Les actions critiques ont un retour immédiat de chargement, un retour final annoncé et une possibilité de reprise sans duplication.

## Contrat données / UX

Les adaptateurs serveur exposent uniquement les champs nécessaires à la surface demandée. Les réponses contiennent un état explicite, un message destiné à l’utilisateur et, si nécessaire, une action de reprise. Les erreurs HTTP 401, 403, 404, 409 et 500 sont transformées en états UX distincts, sans afficher de stack trace ni de jargon WooCommerce/WCFM.

Les données de commande et de suivi restent protégées par une combinaison de nonce, identifiant de commande, clé WooCommerce et contrôle d’appartenance. Une mise à jour client ne peut jamais lire une autre commande en devinant un identifiant. Le temps réel doit accepter un fallback documenté lorsque la permission de notification est refusée ou que le réseau est interrompu.

## Découpage de livraison

| Phase | Résultat attendu |
| --- | --- |
| P0 — Continuité premium | Éliminer les ruptures visuelles sur les routes critiques et verrouiller les contrats de composants |
| P1 — Cockpit quotidien | Migrer commandes, produits, profil, avis et notifications hors chrome WCFM |
| P2 — Fonctions avancées | Habiller rapports, retraits, remboursements et réglages rares avec la même coque |
| P3 — Décommission | Retirer les écrans WCFM visibles uniquement après couverture fonctionnelle et non-régression |

La réussite ne se mesure pas au nombre de fichiers CSS. Elle se mesure au fait qu’un client et un restaurateur puissent accomplir leurs tâches principales sans voir une rupture de marque, sans jargon technique et sans perte de confiance.
