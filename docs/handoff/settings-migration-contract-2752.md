# Contrat de migration progressive — réglages vendeur

**Staging :** `darkblue-spoonbill-498612.hostingersite.com`
**Thème de référence :** RestoCommerce 2.7.52
**Date :** 25 août 2026
**Statut :** étude de périmètre; aucune implémentation ni sauvegarde de réglage approuvée.

## Décision

La route `/store-manager/settings/` reste WCFM legacy derrière son bandeau de transition. Elle ne doit pas être remplacée par un faux formulaire RestoCommerce tant que les capacités d’écriture, la persistance, les erreurs et le rollback ne sont pas prouvés. Le shell custom peut progressivement fournir une navigation, une synthèse et des liens contextualisés, mais WCFM demeure le moteur des données et des droits.

## Inventaire observé

L’artefact `vendor-secondary-settings-chromium-mobile.json` observe deux formulaires, 264 contrôles et les familles suivantes : nom et slug de boutique, e-mail, téléphone, logo, bannière statique/slider/vidéo, bannière mobile et de liste, description avec éditeur TinyMCE, visibilité, masquage des coordonnées, carte et politiques, emplacement paiement/livraison/SEO, horaires, support et coordonnées bancaires. Le même écran contient la navigation WCFM, des liens techniques et des contrôles multimédias.

Axe relève notamment `aria-allowed-role`, `aria-progressbar-name`, `button-name`, `color-contrast`, `image-alt`, `link-name`, `nested-interactive`, `page-has-heading-one` et `presentation-role-conflict`. Ces défauts sont structurels, notamment dans TinyMCE et les aperçus d’images; ils ne doivent pas être déclarés corrigés par CSS seul.

## Découpage recommandé

| Sous-surface | Première façade sûre | Écriture | Risque |
|---|---|---:|---|
| identité de boutique | résumé nom, slug et état de visibilité | non au premier incrément | moyen |
| contact | résumé masqué par défaut et lien vers mode avancé | non | élevé/confidentialité |
| médias | état des assets et dimensions, sans uploader dans la façade | non | moyen |
| description | lecture seule nettoyée, sans TinyMCE | non | élevé/XSS et formatage |
| horaires | résumé des créneaux | non au premier incrément | élevé/affichage public |
| politiques | liens d’état et accès WCFM contextualisé | non | élevé/juridique métier |
| paiement et coordonnées bancaires | aucun rendu sensible dans la façade initiale | non | critique |
| expédition | aucun remplacement sans contrat WCFM détaillé | non | critique/totaux |
| SEO/social | lien vers avancé, pas de faux champs | non | moyen |

## Contrat de lecture initial

Un futur endpoint de synthèse doit vérifier authentification, nonce, vendeur courant et ownership. Il ne renvoie que des indicateurs nécessaires à l’écran : nom affichable, slug non sensible, visibilité, présence contrôlée d’un logo/banner, résumé des horaires et liens vers les surfaces avancées. Il ne renvoie ni coordonnées bancaires, ni tokens sociaux, ni e-mail/téléphone lorsque le réglage de masquage l’interdit, ni contenu non nettoyé d’éditeur.

Les futurs endpoints d’écriture doivent être séparés par capacité, valider les types côté serveur, appeler les API WCFM officielles, retourner un état explicite et permettre une reprise. Une sauvegarde globale de settings ne doit pas être remplacée par plusieurs écritures optimistes non transactionnelles. Toute écriture de recette doit rester sur le vendeur QA et restaurer la valeur initiale.

## Garde-fous avant façade visible

| Gate | Preuve attendue | Statut |
|---|---|---|
| inventaire des champs et sources | mapping versionné WCFM/WooCommerce | partiel, à confirmer |
| synthèse lecture seule | endpoint minimal, réponse sans secret/PII | non exécuté |
| refus sans session | HTTP 400/401/403, aucune donnée | non exécuté |
| nonce invalide | HTTP 403, aucune donnée | non exécuté |
| ownership | vendeur B ne lit pas vendeur A | non exécuté |
| HTML éditeur | nettoyage et rendu sûr | non exécuté |
| sauvegarde | test QA isolé avec restauration | non exécuté |
| axe/clavier | zéro critique/sérieuse et focus stable | non exécuté |
| multi-moteur | Chromium/Firefox/WebKit × 390/768/1440/1920 | non exécuté |
| rollback | retour WCFM sans perte de configuration | non exécuté |

## Décision au 25 août 2026

Le prochain travail settings doit commencer par un **contrat de synthèse lecture seule** et une inspection des API WCFM réellement disponibles. Il ne faut ni rediriger la route, ni masquer les contrôles, ni publier un formulaire RestoCommerce incomplet. La route reste explicitement non approuvée pour l’expérience Ultra Premium jusqu’à preuve de l’équivalence et de la sécurité.
