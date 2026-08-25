# Intégration Hostinger — RestoCommerce

## État du 22 août 2026

Le thème **RestoCommerce 0.1.1** est actif sur le site WordPress Hostinger. WooCommerce, WCFM Frontend Manager et WCFM Marketplace sont installés et activés. Le module **RestoCommerce WhatsApp Checkout 0.1.1** ainsi que le pont **RestoCommerce WCFM Bridge** sont installés pour relier les restaurants publiés à la page d’accueil marketplace.

La visibilité WooCommerce est réglée sur **En ligne**. LiteSpeed Cache est présent ; le cache a été purgé après les mises à jour du thème, des extensions et de la visibilité.

Un vendeur de validation nommé **Restaurant Démo** a été créé avec le rôle WCFM « Propriétaire du Magasin (Vendeur) ». Sa fiche publique est disponible sous `/restaurant/restaurant-demo/`, et la page d’accueil marketplace le fait apparaître lorsque la réponse n’est pas servie par un cache antérieur.

## Paramètres à renseigner avant les vraies commandes

Le module WhatsApp est volontairement laissé sans numéro réel et sans activation de passerelle tant qu’un numéro de réception n’a pas été fourni. Chaque véritable restaurateur devra compléter son profil WCFM, renseigner sa carte WooCommerce, son adresse et son numéro WhatsApp. Les données de démonstration doivent être supprimées ou remplacées avant l’ouverture aux utilisateurs finaux.

## Démonstration marketplace ajoutée

L’extension **RestoCommerce Demo Content** a créé dix restaurants fictifs WCFM, trente produits WooCommerce et leurs variations de sauces. Les restaurants sont visibles sur une requête fraîche de la page marketplace. Dix fichiers média portant le préfixe `demo-` ont ensuite été téléversés pour servir d’images de couverture et d’images produit ; une resynchronisation de l’extension doit être effectuée une fois le téléversement terminé afin d’associer les médias aux profils et aux produits.

Les visuels de démonstration réemploient volontairement les photographies culinaires existantes du projet à la demande du propriétaire. Les noms des fichiers sont adaptés au restaurant affiché afin que le générateur puisse les associer automatiquement après synchronisation.
