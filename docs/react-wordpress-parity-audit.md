# Audit de parité visuelle — React vers WordPress

La prévisualisation React définit la référence de RestoCommerce : fond ivoire chaud, grand titre éditorial vert, navigation compacte, encarts de service vert profond, recherches et filtres immédiats, puis cartes restaurants composées d’une grande image, d’un statut, d’un quartier, d’un accent de cuisine et d’un accès circulaire.

La home WordPress actuelle affiche bien les restaurants WCFM réels, mais sans les contrôles de recherche/filtres, la hiérarchie éditoriale complète, les informations secondaires de carte, l’encart de promesse ou les détails de navigation de la référence.

Une fiche WCFM publique confirme que les produits, variations et liens de commande fonctionnent déjà. Sa présentation reste cependant celle du fournisseur WCFM : bannière sombre, barre latérale et tuiles produits génériques. La refonte doit donc conserver les mécanismes WCFM/WooCommerce tout en leur appliquant un gabarit de boutique et une couche de styles RestoCommerce.

Le thème cible devra intégrer : la home éditoriale dynamique, le filtre client léger, un tiroir panier WooCommerce, des cartes produits et un habillage de boutique WCFM cohérent. Les éléments commerciaux resteront alimentés par WCFM et WooCommerce ; le thème ne dupliquera pas les données.

Lors de la préparation du déploiement, l’administration WordPress a connu un délai de réponse SSL ponctuel, tandis que la home publique restait à nouveau accessible quelques instants plus tard. L’archive de thème doit donc être installée dès que l’interface d’administration répond à nouveau, puis les caches LiteSpeed devront être purgés.

Après les actions Hostinger, la session WordPress administrateur est de nouveau accessible et le thème RestoCommerce est toujours actif. Le formulaire WordPress d’import de thème est présent sur `theme-install.php?upload` et attend l’archive `restocommerce-theme.zip` préparée en version 0.2.0.

L’archive a été validée par les contrôles PHP et JavaScript, puis mise à disposition pour l’import WordPress. Le formulaire natif d’import est présent mais son conteneur est rendu sans dimensions par l’administration, ce qui nécessite une sélection de fichier programmatiquement déclenchée dans la page avant l’installation native.

Le remplacement natif WordPress du thème a ensuite été exécuté avec succès : RestoCommerce est désormais installé en version 0.2.0. Le prochain contrôle porte sur le cache LiteSpeed, la home marketplace publique, les filtres et une fiche restaurant WCFM.

La home publique sert maintenant la composition éditoriale attendue : navigation RestoCommerce, hero ivoire, encart de promesse, recherche, filtres, cartes restaurants enrichies, tiroir panier et séquence explicative. La recherche « Tokyo » réduit correctement la sélection à Tokyo Bento. La boutique WCFM affiche également les boutons d’aperçu rapide et les options WooCommerce ; son habillage de bannière et de grille doit encore être resserré pour atteindre la même fidélité que la marketplace.

La structure WCFM publique utilise une bannière de 350 px (`.wcfm_banner_area` / `.banner_img`), suivie d’un en-tête `.header_wrapper` et d’une grille `ul.products` dans `.product_area`. L’image de bannière est déjà définie en arrière-plan ; le correctif doit donc rétablir son rendu visible, compacter l’en-tête sombre et ajuster la largeur latérale plutôt que remplacer le moteur WCFM.

Les images produits WCFM sont correctement chargées et dimensionnées à 300 × 300 px ; la correction porte donc sur la composition et les styles de conteneur, non sur le chargement des médias. L’image de bannière possède également les paramètres `cover` et `center`, ce qui permet de l’exploiter directement dans le gabarit compact.

La finition RestoCommerce 0.2.1 est installée : la boutique WCFM dispose d’un en-tête vert Service compact, d’une identité éditoriale, de cartes produits image/nom/prix/CTA et d’une grille responsive. L’aperçu rapide WooCommerce est opérationnel : il ouvre le plat, son prix, son texte et le lien vers les options de sauce sans quitter la boutique.
