# RestoCommerce — Thème WordPress marketplace restaurants

# RestoCommerce

**Version de référence publique : 2.7.56.** Le staging associé sert le thème RestoCommerce 2.7.56. Cette version comprend une bibliothèque de carte pour catégories visuelles, groupes de choix par catégorie et suppléments tarifés avec recalcul côté serveur, ainsi qu’une recherche premium home avec filtrage client-side accessible.

RestoCommerce est un thème WordPress mobile-first pour une marketplace de restaurants sous **WooCommerce** et **WCFM Marketplace**. Il fournit une découverte de restaurants, des fiches de carte configurables, un panier latéral, un checkout WhatsApp et un cockpit vendeur propriétaire pour les opérations quotidiennes.

> Le dépôt contient du code et des scripts de recette. Il ne contient volontairement ni identifiant, ni mot de passe, ni export de base de données, ni archive de déploiement, ni capture de sessions de test.

## Passation développeur

Commencez par [`docs/handoff/DEVELOPER-HANDOFF.md`](docs/handoff/DEVELOPER-HANDOFF.md), qui décrit l’architecture WordPress/WooCommerce/WCFM, la version 2.7.56, le module catégories/options/suppléments, la recherche premium home, les règles de sécurité, le protocole de déploiement et les limites encore ouvertes. La note [`docs/handoff/home-search-2756.md`](docs/handoff/home-search-2756.md) détaille ce dernier incrément. Les contrats de migration et les rapports de recette assainis se trouvent dans [`docs/handoff/`](docs/handoff/).

## Périmètre du dépôt

| Dossier | Rôle |
| --- | --- |
| `wordpress-theme/restocommerce/` | Livrable WordPress principal : templates PHP, styles et scripts du thème. |
| `scripts/` | Recettes reproductibles Playwright, axe-core, Lighthouse, Pixelmatch et diagnostics de performance. |
| `docs/receipts/` | Rapports de recette versionnés et auditables. |
| `client/` | Prototype React de référence visuelle historique. Le produit déployé est le thème PHP WordPress. |

## Prérequis WordPress

Le thème cible WordPress 6.5+, PHP 8.1+, WooCommerce et WCFM Frontend Manager / WCFM Marketplace. Le cockpit propriétaire s’appuie sur les données et autorisations de WooCommerce/WCFM, mais remplace l’accueil visuel `/store-manager/` par une interface RestoCommerce.

| Composant | Usage dans le thème |
| --- | --- |
| WooCommerce | Produits, panier, commandes, métadonnées de lignes de commande. |
| WCFM / WCFM Marketplace | Rôle vendeur, boutique et permissions. |
| LiteSpeed Cache | Purge après changement de thème sur l’environnement de staging. |
| WhatsApp | Destination du checkout et aide contextualisée dans le wizard vendeur. |

## Installation locale et préparation

Installez les dépendances de recette avec `pnpm install`, puis créez localement un fichier `.env.local` selon le modèle documenté dans [`docs/QA_ENVIRONMENT.md`](docs/QA_ENVIRONMENT.md). Renseignez uniquement un **compte vendeur WCFM restreint** de votre environnement de staging. Ne réutilisez jamais un administrateur WordPress pour les recettes fonctionnelles.

```bash
pnpm install
set -a && source .env.local && set +a
```

Pour créer le package WordPress localement :

```bash
rm -f wordpress-archives/restocommerce-theme.zip
(cd wordpress-theme && zip -qr ../wordpress-archives/restocommerce-theme.zip restocommerce -x '*/.DS_Store')
unzip -t wordpress-archives/restocommerce-theme.zip
```

L’archive est volontairement ignorée par Git. Déployez-la via **Apparence → Thèmes → Ajouter → Téléverser un thème**, remplacez la version installée puis purgez LiteSpeed. Vérifiez enfin la version réellement servie depuis `wp-content/themes/restocommerce/style.css`.

## Architecture fonctionnelle

| Élément | Fichier principal | Responsabilité |
| --- | --- | --- |
| Chargement, règles WooCommerce et endpoints sécurisés | `wordpress-theme/restocommerce/functions.php` | Nonces, permissions vendeur, produits, options, panier et métadonnées commande. |
| Cockpit vendeur | `vendor-dashboard.php` | Vue dédiée : commandes, menu, disponibilités et assistant produit. |
| Assistant « Ajouter un plat » | `assets/js/vendor-product-wizard.js` et `assets/css/vendor-product-wizard.css` | Photo → famille → nom → prix → options → aperçu/publication. |
| Configuration client | `assets/js/cart.js` | Limites de choix, ajout panier Ajax et retour utilisateur. |
| Fiche restaurant | `storefront.php` | Carte publique, filtrage familles/options mises en pause. |

### Règles métier importantes

Le serveur impose une photo avant publication d’un nouveau plat. Les groupes d’options sont liés aux produits via les métadonnées `restocommerce_option_group_ids`. Les limites telles que **Sauce max 2** sont vérifiées côté interface *et* côté endpoint d’ajout panier afin d’empêcher le contournement par JavaScript. Les groupes et familles désactivés par le vendeur sont masqués côté client.

## Recette et audit

Les scripts de recette nécessitent les variables `RC_ORIGIN`, `RC_VENDOR_USER` et `RC_VENDOR_PASSWORD` dans l’environnement local. `RC_QA_OUT` est optionnelle : sans elle, chaque recette écrit dans son dossier `docs/receipts/*-artifacts/`, ignoré par Git pour ne pas publier de traces de session. Les trois moteurs Playwright sont des dépendances de développement explicites du projet.

```bash
# Parcours Lot 2 : création réelle, groupe Sauce max 2, duplication, client, axe et Pixelmatch
RC_ORIGIN="https://staging.example" RC_VENDOR_USER="$RC_VENDOR_USER" RC_VENDOR_PASSWORD="$RC_VENDOR_PASSWORD" node scripts/run-lot-2-receipt.mjs

# Parcours Lot 3 : boutique vierge, reprise serveur, premier plat, publication publique,
# axe-core, clavier, multi-moteurs et nettoyage du seul vendeur de recette.
RC_ORIGIN="https://staging.example" RC_VENDOR_USER="$RC_VENDOR_USER" RC_VENDOR_PASSWORD="$RC_VENDOR_PASSWORD" RC_QA_OUT="/tmp/restocommerce-lot3-proof" node scripts/run-lot-3-receipt.mjs

# Lighthouse mobile : cockpit vendeur authentifié et fiche restaurant
RC_ORIGIN="https://staging.example" RC_VENDOR_USER="$RC_VENDOR_USER" RC_VENDOR_PASSWORD="$RC_VENDOR_PASSWORD" node scripts/run-lot-2-lighthouse.mjs

# Inventaire des ressources réellement chargées dans le cockpit
RC_ORIGIN="https://staging.example" RC_VENDOR_USER="$RC_VENDOR_USER" RC_VENDOR_PASSWORD="$RC_VENDOR_PASSWORD" node scripts/inventory-vendor-assets.mjs

# Régression de routes en lecture seule : marketplace, route canonique et legacy,
# 404 éditoriale, produit, panier, commande et cockpit vendeur authentifié
RC_ORIGIN="https://staging.example" RC_VENDOR_USER="$RC_VENDOR_USER" RC_VENDOR_PASSWORD="$RC_VENDOR_PASSWORD" RC_QA_OUT="/tmp/restocommerce-route-proof" pnpm qa:routes
```

Consultez [`docs/CDC-MAITRE.md`](docs/CDC-MAITRE.md) pour les exigences, les lots et le protocole de validation ; [`docs/receipts/lot-2-report.md`](docs/receipts/lot-2-report.md) contient le périmètre et les résultats du Lot 2. L’optimisation 2.2.6 isole l’accueil vendeur des ressources publiques et WCFM inutiles ; sur la mesure mobile authentifiée de référence, le LCP passe de 4,1 s à 3,1 s.

## Sécurité et contribution

Avant toute contribution, lancez une recherche de secrets et vérifiez les fichiers ignorés. Les scripts historiques sont conçus pour lire des variables d’environnement ; aucun secret ne doit être ajouté au code, aux rapports ou aux issues publiques.

Les modifications touchant à `functions.php`, au wizard, au panier ou aux permissions vendeur doivent être validées sur un staging WordPress réel avec Chromium, Firefox et WebKit aux largeurs 390, 768, 1440 et 1920 px, axe-core, clavier, Lighthouse et une vérification humaine.

## Licence

Ce dépôt est distribué sous licence [MIT](LICENSE). Elle permet l’utilisation, la modification, la distribution et la commercialisation du code, sous réserve de conserver la notice de copyright et de licence.
