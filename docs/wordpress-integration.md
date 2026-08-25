# Plan d’intégration WordPress, WooCommerce et WCFM

La maquette React est une **référence UX visuelle et fonctionnelle**. La version WordPress finale doit conserver la même structure de navigation, tout en laissant WooCommerce gérer le catalogue, le panier, les commandes et les comptes. Le thème reste responsable de la présentation ; la passerelle WhatsApp et les réglages des restaurateurs vivent dans une extension séparée pour éviter toute dépendance métier au thème.

La racine du site est une **marketplace**, tandis que chaque restaurant utilise le template `Fiche restaurant RestoCommerce`. La page d’accueil du thème expose le filtre `restocommerce_marketplace_restaurants` afin que l’intégration WCFM fournisse une liste normalisée de restaurants publiés, avec leur nom, URL, cuisine, zone, image et état d’ouverture. Cette séparation évite d’enfermer le thème dans une API interne de marketplace précise.

| Couche | Rôle | Décision de légèreté |
|---|---|---|
| `restocommerce` | Templates, styles, gabarits WooCommerce, Schema de base | Pas de page builder, CSS/JS propres et limités |
| WooCommerce | Produits, panier, compte, commandes, stock | Conserver les flux natifs et leurs hooks |
| WCFM Marketplace | Dashboard, vendeurs, produits et sous-commandes | Surcharger les vues par hooks/templates, jamais le cœur du plugin |
| `restocommerce-whatsapp-checkout` | Création de commande et lien WhatsApp | Fonction métier découplée, testable et remplaçable |
| Cache/CDN | Pages publiques et ressources statiques | Exclure le panier, le checkout, le compte et toutes les routes de session |

## Parcours de commande retenu

Le client ajoute ses plats au panier depuis la carte, consulte un side cart rapide, renseigne les données WooCommerce nécessaires puis sélectionne **Finaliser sur WhatsApp**. La passerelle crée d’abord la commande avec le statut `En attente WhatsApp`, réduit le stock et ouvre ensuite un lien WhatsApp prérempli. Le restaurateur avance manuellement le statut depuis son dashboard une fois la conversation confirmée.

Pour une marketplace, le filtre `restocommerce_order_whatsapp_number` sera branché au profil WCFM afin de récupérer le numéro de chaque restaurant à partir de la sous-commande concernée. Le thème ne doit jamais stocker ce numéro dans un script public ni tenter de déterminer seul le propriétaire d’une commande.

## Checklist de performance

| Sujet | Mise en œuvre attendue |
|---|---|
| CSS | Une feuille minifiée par route, CSS critique minimal dans l’en-tête si nécessaire |
| JavaScript | Chargement conditionnel pour quick view, side cart, tableau de bord et graphique ; pas de bibliothèque de slider inutile |
| Images | AVIF/WebP, taille responsive, `width`/`height` explicites, `loading="lazy"` hors LCP, une seule image LCP préchargée |
| Polices | WOFF2 auto-hébergé, sous-ensemblage latin, `font-display: swap`, un poids affiché au premier écran |
| Base de données | Limiter les requêtes WCFM au restaurant connecté, paginer commandes et produits, mettre en cache les lectures publiques |
| Cache | Cache de page/CDN pour catalogue et pages restaurants ; bypass strict pour panier, compte, checkout et fragments WooCommerce |
| Observabilité | Mesurer LCP/INP/CLS par page restaurant, par menu et par checkout après chaque extension ajoutée |

## Checklist SEO

Les pages restaurants doivent fournir un titre unique, une méta-description, une URL canonique, un fil d’Ariane accessible, une image sociale et un balisage `Restaurant` cohérent avec l’adresse, les horaires et les données menu réellement publiées. Les plats doivent utiliser des titres HTML hiérarchisés et de vrais liens, sans contenu injecté uniquement par JavaScript. Les variantes ou suppléments ne doivent pas créer de pages indexables dupliquées.

> Le cache est une optimisation des pages publiques ; les données de panier et de session ne doivent jamais être servies depuis un cache partagé.

## Mise en production

Avant de connecter un restaurant réel, tester les cas suivants sur un environnement de préproduction : plat indisponible pendant le checkout, annulation après réduction du stock, commande multi-restaurateurs, absence de numéro WhatsApp, double clic sur la confirmation, retour sur une page de remerciement et commande depuis mobile. Toute automatisation bidirectionnelle avec WhatsApp devra ensuite passer par l’API officielle ou un partenaire autorisé, dans une extension distincte.
