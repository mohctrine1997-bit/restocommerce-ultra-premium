# RestoCommerce WhatsApp Checkout

Ce plugin ajoute une passerelle WooCommerce qui crée une commande avec le statut **En attente WhatsApp**, puis propose un bouton sécurisé de confirmation WhatsApp sur la page de remerciement. Le panier est vidé après la création de commande et le stock est réduit ; le restaurant doit donc confirmer ou annuler la commande dans son dashboard pour maintenir un stock fiable.

La fonction `restocommerce_order_whatsapp_number` expose le filtre `restocommerce_order_whatsapp_number`. L’intégration WCFM doit l’utiliser pour récupérer le numéro propre à chaque sous-commande restaurateur sans modifier le noyau du plugin.

> Avant la mise en production, un développeur doit contrôler le cycle de stock, les restrictions de zones, les mentions de confidentialité et les règles de consentement applicables au pays ciblé.
