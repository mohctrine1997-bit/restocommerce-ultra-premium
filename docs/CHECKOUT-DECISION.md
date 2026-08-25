# Décision checkout RestoCommerce

**Statut : décision humaine requise — aucune intégration de paiement n’est activée par ce document.**
**Date :** 24 août 2026
**Périmètre :** marketplace WooCommerce multi-restaurants, checkout WhatsApp existant et suivi de commande RestoCommerce.

## Décision recommandée

La recommandation est de conserver, à court terme, le parcours actuel **WooCommerce → confirmation WhatsApp → suivi de commande sécurisé** comme voie de commande principale, puis de décider séparément si l’activité exige réellement l’encaissement en ligne. Cette trajectoire préserve l’expérience conversationnelle voulue, limite le périmètre de changement et permet de valider d’abord l’exploitation réelle : disponibilité, prise en charge, préparation et récupération/livraison.

Pour un futur encaissement, le premier choix technique ne doit pas être un formulaire carte construit sur mesure. Il doit être une **passerelle WooCommerce hébergée ou redirigée**, compatible avec le pays, la devise, le modèle marketplace et le moyen de reversement des restaurants. WooCommerce distingue les passerelles redirigées, iFrame et directes ; les passerelles directes ajoutent des exigences de sécurité et de conformité, tandis que les parcours déportés réduisent le traitement de données de carte par le site [1].

> **Décision proposée :** ne pas activer de carte, portefeuille, paiement WhatsApp ni transaction réelle tant qu’un responsable métier n’a pas confirmé le pays d’exploitation, la devise de règlement, l’entité qui encaisse, le modèle de reversement vendeur et la passerelle retenue.

## Comparaison des scénarios

| Critère | WhatsApp + Lot 6 aujourd’hui | Carte / portefeuille via passerelle WooCommerce | Paiement WhatsApp natif / lien interactif |
|---|---|---|---|
| Intention | Commander simplement et finaliser l’échange avec le restaurant | Encaisser en ligne dans un parcours transactionnel | Rester dans WhatsApp tout en demandant le paiement |
| État RestoCommerce | Déployé, sans paiement réel | Non activé | Non activé |
| Complexité produit | Faible ; suit le catalogue et le suivi existants | Moyenne à élevée ; dépend de la passerelle, des webhooks et des règles marketplace | Élevée ; dépend de la disponibilité et du cadre de Meta / passerelle |
| Données de paiement | Aucune donnée carte traitée par RestoCommerce | Dépend du type de passerelle ; éviter le direct si non nécessaire | Référence de commande, lien et mises à jour de statut à corréler |
| Suivi de statut | Lot 6, clé WooCommerce et états cuisine | Réconciliation paiement + commande + états cuisine | Webhook passerelle puis message de statut corrélé |
| Décision requise | Aucune nouvelle activation | Choix fournisseur et validation opérationnelle | Vérification d’éligibilité produit/pays et partenaire |

La documentation officielle de Meta décrit les liens de paiement WhatsApp comme une fonctionnalité « non publiquement disponible » au 21 mai 2026. Elle prévoit une référence unique, un lien produit par une passerelle et la réception de mises à jour de transaction via webhook [2]. Cette documentation détaille par ailleurs une configuration `UPI` / `INR`, ce qui ne permet pas de supposer une disponibilité ou une adéquation pour le périmètre actuel sans vérification formelle de l’éligibilité [2].

## Pourquoi préserver WhatsApp maintenant

Le checkout WhatsApp existant répond à l’objectif de conversation directe entre client et restaurant. Le Lot 6 ajoute un suivi de commande accessible uniquement avec la clé native WooCommerce ; il complète donc le parcours sans prétendre qu’une commande est déjà payée. Cette séparation évite de confondre **intention de commande**, **acceptation du restaurant**, **paiement** et **exécution du service**.

Le parcours doit continuer à expliciter son statut : « demande transmise », « attente de confirmation » ou « suivi de préparation ». Il ne doit jamais employer un vocabulaire de paiement confirmé tant qu’aucune passerelle ne fournit un événement de succès vérifié. Cette règle protège l’expérience client autant que l’opération du restaurant.

## Conditions de décision avant intégration

La décision de paiement relève d’un responsable métier et, si nécessaire, de ses conseils juridiques, fiscaux, contractuels et prestataires. Elle ne peut pas être déduite d’un choix technique. Avant toute activation, les points ci-dessous doivent être validés par écrit.

| Décision à obtenir | Question de validation | Conséquence technique |
|---|---|---|
| Pays et devise | Où l’encaissement se produit-il et dans quelle devise ? | Écarter les passerelles non disponibles ou incompatibles |
| Entité encaissante | Marketplace, restaurant individuel ou autre entité ? | Définir l’identifiant marchand, les reçus et les remboursements |
| Reversement vendeur | Les restaurants sont-ils payés par la marketplace ou directement ? | Choisir une solution compatible avec le modèle de partage / versement |
| Moyens attendus | Carte, portefeuille, virement, paiement à la livraison ? | Limiter l’écran aux moyens réellement nécessaires |
| Gestion d’incident | Qui traite annulations, refus, remboursement et litige ? | Mapper les webhooks, notes, accès et messages client |
| Données et confidentialité | Quelles données sont transférées au processeur ? | Mettre à jour les informations de confidentialité et les contrats |
| Expérience mobile | Quel délai et quel nombre d’étapes sont acceptables ? | Privilégier le redirectionnel ou express si cela réduit la friction |

WooCommerce recommande de sélectionner les moyens selon le coût, la localisation, la sécurité et le besoin d’abonnements, tout en évitant de surcharger l’acheteur avec trop de méthodes [3]. La même documentation indique qu’une passerelle nécessite généralement un compte marchand et que les conditions et frais dépendent du processeur [3].

## Architecture cible conditionnelle

Si la décision humaine valide l’encaissement en ligne, la première itération doit être limitée à une passerelle officiellement maintenue et à un parcours de redirection ou portefeuille hébergé. Le thème ne doit pas contenir de clés de paiement, de logique de carte, ni de règles de capture. La passerelle doit être fournie et configurée comme extension WooCommerce, conformément au modèle de passerelles de WooCommerce [1].

| Étape | Livrable requis | Critère de sortie |
|---|---|---|
| 1. Décision métier | Pays, devise, entité encaissante, moyen retenu | Validation écrite du responsable |
| 2. Éligibilité fournisseur | Compte marchand et environnement de test | Confirmation de disponibilité contractuelle |
| 3. Configuration isolée | Extension de passerelle sur staging | Aucun secret dans le thème ou le dépôt public |
| 4. Mapping des événements | Paiement autorisé, échec, annulation, remboursement | État WooCommerce cohérent et non ambigu |
| 5. Tests transactionnels autorisés | Cartes/tests et webhooks sandbox du fournisseur | Aucun achat réel ; preuves assainies |
| 6. Revue exploitation | Processus restaurants, support, remboursement | Accord avant mise en service |

Les callbacks de passerelle doivent être authentifiés et testés en environnement de test. WooCommerce indique également que l’achèvement d’un paiement doit passer par le mécanisme de paiement de commande, qui gère notamment la transition de statut et le stock, plutôt qu’un changement de statut improvisé [1].

## Décision enregistrée pour ce CDC

Le code paiement reste **hors périmètre et non écrit**. La marketplace garde son checkout WhatsApp et le suivi Lot 6. Lorsqu’un responsable transmettra les décisions de la section précédente, une phase dédiée pourra sélectionner une passerelle, configurer des secrets hors dépôt, exécuter des transactions de test explicitement autorisées et produire une recette de réconciliation.

## Références

[1]: https://developer.woocommerce.com/docs/features/payments/payment-gateway-api/ "WooCommerce — Payment Gateway API"
[2]: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/payment-links/ "Meta for Developers — Accept Payments via Payment Links"
[3]: https://woocommerce.com/document/premium-payment-gateway-extensions/ "WooCommerce — Which payment option is right for me?"
