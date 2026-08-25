# Contrat de migration progressive — paiements vendeur

**Staging :** `darkblue-spoonbill-498612.hostingersite.com`
**Thème de référence :** RestoCommerce 2.7.52
**Date :** 25 août 2026
**Statut :** contrat d’architecture et de recette; aucune implémentation ni migration financière approuvée.

## Décision de périmètre

La route `/store-manager/payments/` reste une surface WCFM legacy non approuvée. Elle ne doit pas être redirigée ou masquée tant qu’une façade RestoCommerce n’a pas démontré la parité métier, la sécurité d’ownership et la lisibilité des états financiers. Aucun export, retrait, impression, remboursement ou réglage financier n’est déclenché dans cette étude.

Le premier incrément recommandé est une **vue lecture seule** dans la coque RestoCommerce. Elle doit afficher les données financières déjà autorisées au vendeur courant, sans réimplémenter le calcul WooCommerce/WCFM. Les actions d’export, de retrait et de modification restent derrière un lien explicite vers le mode avancé WCFM, avec avertissement de transition, jusqu’à preuve séparée.

## Contrat de données minimal proposé

| Champ façade | Source métier à confirmer | Règle d’exposition |
|---|---|---|
| période sélectionnée | filtre de la table WCFM | valeur validée côté serveur; intervalle borné |
| statut de transaction | ligne transaction WCFM | enum normalisée : approuvé, en cours, annulé |
| montant brut | transaction WooCommerce/WCFM | valeur numérique + devise du contexte, jamais calculée dans le navigateur |
| charges/commission | transaction WCFM | valeur retournée par le moteur, non recalculée côté front |
| montant net/paiement | transaction WCFM | somme serveur explicitement étiquetée; absence distinguée de zéro |
| date | transaction WCFM | format localisé après réception d’une date structurée |
| identifiant d’affichage | transaction WCFM | identifiant non sensible ou libellé tronqué; ne jamais exposer de clé de commande |
| pagination | requête serveur | limite et curseur/page validés; pas d’énumération libre |
| état de réponse | adaptateur RestoCommerce | `success`, `empty`, `error`, `forbidden` avec message et reprise |

Les noms réels des champs, les tables, les capacités d’export et le modèle de retrait doivent être confirmés par inspection WCFM contrôlée ou documentation versionnée avant tout endpoint. Ce document ne les invente pas.

## Contrôles serveur obligatoires

Toute lecture doit vérifier l’authentification, un nonce dédié, l’identité du vendeur courant et son ownership WCFM. La période, le statut, la page et la taille doivent être validés et bornés. Une requête sans session doit être refusée; un nonce invalide doit être refusé; un vendeur ne doit jamais pouvoir lire les transactions d’un autre vendeur en modifiant un identifiant ou un paramètre. Les erreurs ne doivent révéler ni SQL, ni stack trace, ni token, ni clé de commande.

La réponse doit être agrégée au minimum nécessaire. Les données client, adresses, téléphones, e-mails, détails de paiement et secrets de passerelle sont hors de cette façade. Les totaux et commissions doivent venir de WooCommerce/WCFM; le front ne peut pas les recalculer pour « corriger » une divergence.

## États d’interface obligatoires

La coque doit fournir un titre de niveau 1, une période lisible, un état chargement, un état vide, un état erreur avec reprise ciblée, un état interdit et un état succès. Elle doit annoncer les mises à jour sans déplacer le focus. Les tableaux desktop et cartes mobiles doivent conserver les en-têtes, la devise et les libellés de statut. Les exports doivent rester désactivés dans l’incrément lecture seule tant que leur contrat de permissions et leur téléchargement sécurisé ne sont pas prouvés.

## Preuves avant redirection de la route

| Gate | Preuve attendue | Statut actuel |
|---|---|---|
| lecture vendeur courant | données réelles QA non financières sensibles ou jeu de transactions QA | non exécuté |
| non connecté | HTTP 400/401/403 cohérent et aucune donnée | non exécuté pour ce futur endpoint |
| nonce invalide | HTTP 403 et aucune donnée | non exécuté pour ce futur endpoint |
| ownership inter-vendeur | vendeur B ne lit pas vendeur A | non exécuté |
| période/statut bornés | paramètres invalides rejetés | non exécuté |
| état vide | affichage sans headers vides ni jargon | écran WCFM actuel seulement |
| axe et clavier | axe zéro, focus et lecture clavier | écran WCFM actuel en échec |
| responsive | 390, 768, 1440, 1920 × Chromium/Firefox/WebKit | non exécuté |
| exports/retraits | contrat et test sécurisé séparés | volontairement non déclenché |
| rollback | retour WCFM vérifié sans perte de données | à préparer |

## État observé au 25 août 2026

L’artefact `vendor-secondary-payments-audit-2748.json` observe un vendeur QA connecté, un shell RestoCommerce extérieur mais un shell WCFM présent, un tableau de transactions vide pour la période affichée et 129 contrôles. Les liens `IMPRIMER`, `PDF`, `EXCEL`, `CSV` et le lien de retrait sont présents. Axe relève notamment `color-contrast`, `empty-table-header`, `image-alt`, `link-name`, `page-has-heading-one` et `select-name`. Aucun export, impression, retrait ou opération financière n’a été déclenché.

La version 2.7.52 ne change pas cette décision : elle migre uniquement le profil vers le cockpit custom et conserve les réglages avancés WCFM. Payments reste donc **P2 à contrat préalable**, non migré et non approuvé.
