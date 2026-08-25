# Lot 11 — Décision stratégique du checkout

**Date de mise à jour :** 24 août 2026
**Périmètre :** staging Hostinger RestoCommerce 2.7.34
**Statut :** **Recommandation livrée; décision métier explicite encore requise**

Le document `docs/CHECKOUT-DECISION.md` compare trois trajectoires : conserver WooCommerce → confirmation WhatsApp → suivi de commande; intégrer une passerelle carte ou portefeuille via une extension WooCommerce; ou étudier un paiement WhatsApp interactif sous réserve d’éligibilité. Il recommande de conserver le parcours WhatsApp à court terme, car il évite de confondre intention de commande, acceptation, paiement et exécution du service, et n’introduit aucune donnée de carte dans le thème.

| Élément | Résultat |
| --- | --- |
| Comparaison WhatsApp / passerelle WooCommerce / paiement WhatsApp | Documentée |
| Avantages, limites et effort d’intégration | Documentés |
| Code de carte ou passerelle ajouté au thème | Non |
| Secret ou compte marchand configuré | Non |
| Paiement réel ou transaction de test | Non |
| Décision métier finale du propriétaire | Non reçue |

La décision finale doit préciser au minimum le pays d’exploitation, la devise, l’entité qui encaisse, le modèle de reversement des restaurants, les moyens de paiement attendus et le traitement des annulations, remboursements et litiges. Tant que ces paramètres ne sont pas validés par écrit, aucun code de paiement ne doit être ajouté et le checkout WhatsApp ne doit pas être présenté comme un paiement confirmé.

> **Conclusion senior :** Lot 11 est complet du point de vue de l’analyse et des garde-fous, mais il ne peut pas être déclaré « terminé » au sens strict du CDC tant que le propriétaire n’a pas acté explicitement le maintien de WhatsApp ou le lancement d’une passerelle de paiement.
