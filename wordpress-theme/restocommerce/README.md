# RestoCommerce WordPress Theme

Ce dossier contient la fondation légère du thème WordPress à installer dans `wp-content/themes/restocommerce`. Il reste volontairement centré sur la présentation, les templates WooCommerce, les actifs réduits et les signaux SEO. La commande WhatsApp est isolée dans le plugin compagnon `restocommerce-whatsapp-checkout`, afin que le changement de thème ne casse jamais le cycle de commande.

La maquette React à la racine du projet est la référence UX des gabarits à décliner dans les templates WooCommerce et les surcharges WCFM. Pour la version finale, les polices doivent être auto-hébergées, sous-ensemblées en WOFF2, puis préchargées seulement lorsqu’elles sont nécessaires au rendu initial.
