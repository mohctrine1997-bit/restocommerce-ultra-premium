# Notes staging — Lot 2

Le staging concerné est `https://aliceblue-bison-433987.hostingersite.com`. La version publique de `style.css` a confirmé successivement 2.2.0, 2.2.1 puis **2.2.2** après chaque remplacement WordPress. Le cache LiteSpeed a été purgé après le déploiement 2.2.2 et l’administration WordPress a confirmé que toutes les entrées LSCache avaient été purgées.

La recette réelle `run-lot-2-receipt.mjs` a créé le 23 août 2026 les objets WooCommerce suivants avant de s’interrompre sur un contrôle axe-core public : produit source **190** et duplication **191**. Le produit source a été lu avec succès via l’endpoint vendeur, avec une image, le prix `89`, une URL publique et un groupe d’options persistant. Les deux produits sont toujours à archiver via l’endpoint propriétaire `restocommerce_vendor_archive_product` avant la livraison finale, car l’interruption est survenue avant l’étape de nettoyage.

Le premier passage a détecté un contraste insuffisant dans l’étape photo du wizard ; il a conduit au correctif 2.2.1. Le second passage a validé axe sur cette étape mais a détecté des contrastes publics dans la fiche produit ; le correctif 2.2.2 a renforcé les règles concernées. La recette complète doit être relancée depuis 2.2.2.
