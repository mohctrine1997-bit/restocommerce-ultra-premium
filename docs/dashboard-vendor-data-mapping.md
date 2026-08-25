# Mapping de données — Dashboard vendeur RestoCommerce

Le dashboard dédié remplace le rendu visuel WCFM sur `/store-manager/`. **WCFM conserve les permissions vendeur et les écrans de réglages ; WooCommerce reste la source des commandes et des produits.** Aucun tableau ou menu WCFM n’est rendu dans le template `wordpress-theme/restocommerce/vendor-dashboard.php`.

| Bloc du dashboard | Source / fonction | Écriture métier |
|---|---|---|
| Nom du restaurant | `restocommerce_vendor_store_name()` appelle `wcfmmp_get_store($vendor_id)->get_shop_name()` quand WCFM Marketplace l’expose ; repli sur `wcfmmp_profile_settings[store_name]`, puis sur le profil vendeur. | Les réglages WCFM restent accessibles dans `/store-manager/settings/`. |
| Ouvert / Fermé | `restocommerce_vendor_service_is_paused()` lit `restocommerce_service_paused` dans les métadonnées de l’utilisateur vendeur. | L’action AJAX `restocommerce_toggle_vendor_service` écrit ou supprime cette méta ; le filtre `woocommerce_is_purchasable` rend les produits du vendeur non achetables pendant la pause. |
| Commandes du vendeur | `restocommerce_vendor_orders()` utilise `wc_get_orders()` puis `restocommerce_vendor_order_items()` conserve uniquement les lignes de commande dont le produit a le vendeur comme auteur WordPress. | Aucune commande d’un autre vendeur n’est affichée ou modifiée. |
| Statut affiché | `restocommerce_vendor_order_state()` lit d’abord `_restocommerce_vendor_state_{vendor_id}`, sinon convertit le statut WooCommerce : commande traitée → « En cuisine », terminée/annulée/remboursée → « Terminée ». | L’action AJAX `restocommerce_vendor_advance_order` fait avancer la séquence `À confirmer → En cuisine → Prête → Terminée`, enregistre la méta par vendeur et synchronise WooCommerce sur `processing` puis `completed`. |
| Ventes du jour / panier moyen | `restocommerce_vendor_dashboard_data()` agrège les lignes vendeur des commandes via les totaux de lignes (`get_total()` + taxe) et les dates WooCommerce. | Données en lecture seule, recalculées à chaque rendu. |
| Rythme des ventes | `restocommerce_vendor_dashboard_data()` répartit les commandes vendeur du jour par tranche horaire de 11 h à 22 h. | Donnée en lecture seule, rendue en histogramme CSS. |
| Menu / prix / catégorie | `restocommerce_vendor_products_for_dashboard()` récupère les produits WooCommerce dont l’auteur est le vendeur ; le prix vient de `WC_Product::get_price_html()` et la catégorie de la taxonomie `product_cat`. | — |
| Disponible / indisponible | `WC_Product::is_in_stock()` définit l’état visible. | L’action AJAX `restocommerce_vendor_toggle_product` appelle `WC_Product::set_stock_status('instock'|'outofstock')` puis `save()`. |
| Horaires et profil | Les sections offrent l’accès à `/store-manager/settings/`, où WCFM fournit notamment l’onglet « Heures d’ouverture » et les champs boutique. | La prochaine itération peut intégrer ces formulaires dans le template dédié sans recopier la logique WCFM. |

## Limite volontaire actuelle

Le statut ouvert/fermé est stocké dans une méta RestoCommerce dédiée afin de bloquer immédiatement la commandabilité WooCommerce, indépendamment des options WCFM installées. Cette décision évite de supposer un champ « vacation mode » qui n’est pas exposé dans les réglages WCFM observés sur le site de test. Une synchronisation supplémentaire pourra être ajoutée lorsqu’un module de vacances WCFM sera activé et vérifié.
