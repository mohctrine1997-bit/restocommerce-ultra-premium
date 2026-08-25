# Rapport final unique — Lots 0 à 12

**Date de mise à jour :** 24 août 2026
**Staging :** WordPress / WooCommerce / WCFM sur Hostinger réel
**Thème actif contrôlé :** RestoCommerce **2.7.35**
**Keleva Woo Addons :** désactivé
**Paiement réel :** aucun
**WhatsApp :** aucun lien ouvert et aucun message envoyé

## Règle de lecture

> Un statut **connecté vérifié** signifie qu’une action réelle a été effectuée sur des données de recette isolées. Il ne vaut pas certification globale lorsque le protocole CDC exige encore un moteur, une largeur, un appareil physique, une notification, une décision métier ou un seuil de performance non démontré.

Le CDC impose pour chaque lot l’environnement réel, Chromium/Firefox/WebKit aux quatre formats, axe-core, Lighthouse avec ses seuils, la régression visuelle chiffrée et une vérification humaine sur téléphone. La matrice ci-dessous distingue donc **fonctionnalité observée**, **couverture du protocole** et **approbation CDC**.

## Matrice de conformité factuelle

| Lot | Fonction livrée et preuve principale | Couverture actuelle | Statut senior |
| ---: | --- | --- | --- |
| 0 | Staging WordPress/WooCommerce/WCFM, Playwright trois moteurs, axe, Lighthouse et Pixelmatch installés; comptes QA isolés et harnais présents | WP-CLI Hostinger indisponible; les recettes navigateur et HTTP sont disponibles | **Base opérationnelle, non certification exhaustive** |
| 1 | États UX, cockpit vendeur, navigation, focus, onglets et bascule de service réellement testés | Chromium/Firefox/WebKit et quatre formats sur le périmètre exécuté; performance et téléphone restent transverses | **Connecté vérifié pour le périmètre testé** |
| 2 | Wizard produit, photo, catégories, Sauce limitée à deux choix côté interface et serveur, duplication, bibliothèque, ownership et archivage | Création et rendu client réels; défenses nonce/inter-vendeur exercées; limites générales du protocole transverses | **Connecté vérifié pour le périmètre testé** |
| 3 | Onboarding persistant et publication de boutique déployés; état `hasFirstProduct` et retour après premier plat traités | Preuve forte Chromium; recette WebKit complète exigée par le CDC non reconstruite dans cette passe; nettoyage du profil bloqué par le serveur | **Partiel — approbation CDC refusée** |
| 4 | Tour trois étapes, persistance, aide contextuelle, support WhatsApp inspecté sans ouverture, axe zéro | Chromium/Firefox/WebKit sur les formats exécutés; téléphone physique et lecteur natif non testés | **Fonctionnellement approuvé sur staging, non certification humaine globale** |
| 5 | Commande client réelle visible vendeur sans reload du badge/compteur par polling; tiroir et commandes actives alimentés | La liste statique de commandes demande un reload; notification navigateur jamais autorisée; son/vibration paramétrables mais non éprouvés; événement backend peut être `status-whatsapp-pending` | **Partiel — temps réel et notification CDC non entièrement prouvés** |
| 6 | Reçu client et séquence Reçue → En préparation → Prête → Récupérée/livrée après transitions vendeur | Le client a dû recharger le reçu; aucun polling client trouvé dans le JS; notification client automatique non prouvée; WhatsApp non ouvert | **Partiel — Definition of Done non satisfaite** |
| 7 | Avis 5/5 après commande terminée, publication publique, moyenne sur fiche et cartes marketplace; axe zéro sur 9 cas multi-moteurs | Modération vendeur par signalement exercée seulement partiellement, sans modifier l’avis QA existant | **Très fortement vérifié fonctionnellement, modération partielle** |
| 8 | Insights « plus vendu », tendances et « à remettre en lumière » alimentés par commandes réelles; quatre cartes éditoriales | 12 cas Chromium/Firefox/WebKit × 4 formats, axe zéro; Firefox signale des échecs Google Fonts dans certains runs | **Fonctionnellement validable avec réserves de performance et matériel** |
| 9 | Quatre palettes, labels CDC, persistance, `aria-pressed`, scope cockpit/fiche/panier et contraste axe zéro; tokens Safran/Jardin alignés sémantiquement | Chromium aux 390/768/1440/1920; Firefox/WebKit aux 390/1440; Firefox/WebKit 768/1920 non exécutés; captures Chromium mobile/desktop produites | **Très fortement vérifié, mais matrice multi-moteur CDC incomplète** |
| 10 | `DESIGN-SYSTEM.md` vivant mis à jour jusqu’à 2.7.34 avec palettes, typographies, spacing, composants, états, accessibilité et règles de contribution | Inventaire documentaire vérifié; téléphone et lecteur natif restent hors preuve | **Documentation conforme au périmètre livré** |
| 11 | Comparaison WhatsApp, carte/wallet et paiement WhatsApp; garde-fous et conditions de décision écrits; aucun code de paiement ajouté | Pays, devise, encaissement, reversement, moyens de paiement et gestion des litiges non décidés par le propriétaire | **Recommandation livrée, décision métier en attente** |
| 12 | Sous 390×844, latence 150 ms, 1,6 Mbps, 750 Kbps et CPU ×4: ajout/publication produit QA, archivage, commande QA et trois transitions mesurés | Lighthouse post-2.7.35: marketplace 70/79, restaurant NO_FCP puis 83, produit 87/82; ajout panier 1 568 ms, publication 3 524 ms, transitions 895/858/886 ms; Firefox/WebKit dégradés et téléphone réel non testés | **Partiel — seuil Performance ≥90 et retour ≤1 s non démontrés** |

## Correctifs récents et vérifications

Le blocage apparent de l’onboarding dans le premier probe Lot 12 a été analysé au niveau du code. Le harnais ajoutait `?rcqa=...` à la route cockpit; `vendor-onboarding.js` interprète précisément cette query comme un mode d’auto-ouverture différée du dialogue. Le harnais a donc été corrigé pour utiliser un paramètre neutre. La route normale, sans `rcqa`, a ensuite été testée: dashboard custom présent, aucun dialogue spontané à l’arrivée, ouverture par le raccourci et fermeture par le bouton utilisateur réussies, sans erreur.

Le thème 2.7.35 ajoute par ailleurs un dequeue ciblé de `wp-block-library` sur les routes custom qui n’impriment aucun bloc Gutenberg. PHP lint est propre, WordPress a confirmé le remplacement de 2.7.34 par 2.7.35, les trois routes publiques ont répondu HTTP 200 et la home ne contient plus de référence `wp-block-library`. La nouvelle campagne Lighthouse ne montre toutefois pas de gain stable vers 90: la variance Hostinger reste dominante et une passe restaurant a produit `NO_FCP`.

## Gaps bloquants avant « 100 % conforme »

| Gap | Pourquoi il bloque une certification globale | Action de clôture |
| --- | --- | --- |
| Performance | Les scores mesurés restent sous 90 et les actions critiques dépassent parfois une seconde | Réduire TTFB/variabilité serveur, fixer un budget, rejouer deux passes stables par route |
| Lot 6 temps réel | Le client ne se met pas à jour sans reload et aucune notification automatique n’est prouvée | Ajouter un endpoint de refresh sécurisé et un polling client borné, puis tester l’isolation par order key |
| Lot 5 notification | La preuve du badge vendeur ne prouve pas notification navigateur, son ou vibration | Tester les préférences et le signal sur navigateur autorisé; documenter le fallback si permission refusée |
| Matrice navigateurs Lot 9 | Firefox/WebKit 768/1920 n’ont pas été exécutés après le changement sémantique | Rejouer ces quatre cas par moteur, avec délai anti-WAF |
| Lot 3 WebKit complet | La Definition of Done exige un parcours mobile WebKit complet aboutissant à boutique visible | Rejouer le parcours complet sur un profil nouveau ou explicitement réinitialisé, sans contourner la restauration refusée |
| Appareil réel et assistance native | Le CDC exige téléphone et lecteur d’écran natif; Playwright ne suffit pas | Recette humaine documentée sur l’appareil cible et lecteur choisi |
| Lot 11 décision métier | Le choix WhatsApp/paiement intégré doit être acté avant tout code de paiement | Obtenir une décision écrite du propriétaire |
| Protocole visuel complet | Les captures et Pixelmatch ne couvrent pas trois moteurs à toutes les tailles pour tous les lots | Exécuter la matrice visuelle complète lorsque le WAF et l’environnement le permettent |

## Décision finale

Le thème est **fonctionnellement avancé et plusieurs lots sont fortement vérifiés sur le staging réel**, mais il serait incorrect de le déclarer **100 % conforme au CDC** aujourd’hui. Les blocages déterminants sont le suivi client sans reload et sa notification, la décision métier du checkout, les seuils de performance, la couverture Firefox/WebKit complète du Lot 9, la recette WebKit complète du Lot 3, et la validation humaine sur téléphone/lecteur d’écran.

La bonne décision de release est donc **ne pas promouvoir en production comme “100 % conforme”**. Le staging peut servir de candidat de pré-release après clôture des gaps ci-dessus et après une branche/release propre excluant les secrets QA, cookies, nonces et artefacts privés.

## Références de preuve

[1]: lot-0-report.md "Rapport Lot 0"
[2]: lot-1-correction-report.md "Rapport Lot 1"
[3]: lot-2-correction-report.md "Rapport Lot 2"
[4]: lot-3-report.md "Rapport Lot 3"
[5]: lot-4-report.md "Rapport Lot 4"
[6]: lot-5-report.md "Rapport Lot 5"
[7]: lot-6-report.md "Rapport Lot 6"
[8]: lot-7-report.md "Rapport Lot 7"
[9]: lot-8-report.md "Rapport Lot 8"
[10]: lot-9-report.md "Rapport Lot 9"
[11]: lot-10-report.md "Rapport Lot 10"
[12]: lot-11-report.md "Rapport Lot 11"
[13]: lot-12-report.md "Rapport Lot 12 actualisé"
[14]: ../../restocommerce-audit/qa/validate-onboarding-normal-path.json "Validation onboarding normale"
[15]: ../../restocommerce-audit/qa/lot12-vendor-1787612992826.json "Ajout et archivage vendeur sous throttling"
[16]: ../../restocommerce-audit/qa/lot12-status-1787613408929.json "Transitions commande sous throttling"
