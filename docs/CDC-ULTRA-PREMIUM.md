# CDC — RestoCommerce Ultra Premium

**Version :** 1.1
**Date :** 24 août 2026
**Périmètre :** thème WordPress RestoCommerce, intégration WooCommerce/WCFM, staging puis production
**Objectif :** transformer l’expérience actuelle en produit de commande et de gestion restaurant visuellement premium, rapide, cohérent, accessible et sans rupture WCFM visible sur les parcours principaux.

## 1. Résumé exécutif

RestoCommerce possède déjà une direction éditoriale forte : typographie distinctive, palettes restaurant, cartes de contenu, cockpit vendeur personnalisé et parcours de commande courts. L’étape suivante n’est pas d’ajouter des ornements. Elle consiste à rendre cette qualité **constante, rapide et vérifiable** sur toutes les surfaces réellement utilisées.

Le présent CDC traite les quatre freins identifiés lors de l’audit : performance instable, validation mobile réelle insuffisante, couverture visuelle multi-moteur incomplète et coexistence avec les écrans WCFM legacy. Il impose une séparation stricte entre la couche d’expérience RestoCommerce et la couche métier WooCommerce/WCFM. WCFM reste autorisé pour les données, les permissions et certaines fonctions avancées; son interface ne doit plus constituer une rupture de marque dans les parcours quotidiens.

> **Promesse de release :** un client doit pouvoir découvrir, configurer et demander un plat sans écran technique; un restaurateur doit pouvoir ouvrir son service, gérer ses plats et faire avancer une commande sans jargon ni rupture visuelle; chaque action critique doit rester compréhensible, rapide et récupérable sur mobile.

## 2. Résultats attendus

| Résultat | Exigence de sortie |
| --- | --- |
| Identité premium | Une seule grammaire visuelle sur marketplace, restaurant, produit, panier, checkout, reçu et cockpit quotidien |
| Fluidité | Les budgets performance sont atteints sur les routes critiques et les actions ont un feedback immédiat |
| Continuité | Aucun passage silencieux vers un écran WCFM technique sur un parcours P0 |
| Accessibilité | WCAG 2.2 AA visée, axe zéro pour les violations critiques/sérieuses, clavier et lecteur natif testés |
| Responsive | Aucun débordement, perte de contenu ou commande inaccessible aux quatre formats CDC |
| Robustesse | Les erreurs réseau, permissions, état vide et reprise sont conçus, pas laissés au navigateur |
| Preuve | Chaque exigence possède un artefact, une mesure, une date, un moteur et un verdict |

## 3. État de départ à prendre en compte

La version staging observée est RestoCommerce 2.7.35. Les palettes, le cockpit et les surfaces publiques RestoCommerce ont une base visuelle solide. Le staging a toutefois produit des scores Lighthouse mobiles variables, environ 70 à 87 après limitation, et plusieurs actions critiques dépassent une seconde sous réseau dégradé. Le suivi client exige encore un rechargement pour refléter les changements de statut. Certaines routes secondaires restent rendues par WCFM classique. Ces constats sont des **données de départ**, pas des objectifs acceptés.

Le nouveau développement doit préserver les correctifs déjà prouvés : contrôle d’ownership vendeur, nonces, limites Sauce côté interface et serveur, palettes confinées au restaurant, avis liés à une commande terminée et absence de paiement réel tant que la décision métier n’est pas actée.

## 4. Principes non négociables

### 4.1 Premium utile

Chaque élément visuel doit servir une lecture, une décision ou une confiance. Il est interdit d’ajouter une animation, une ombre, une police ou un dégradé sans bénéfice utilisateur mesurable. La hiérarchie doit rester lisible en monochrome et avec une luminosité réduite.

### 4.2 Une seule source de vérité

Les tokens de couleur, typographie, spacing, rayons, transitions, focus et états sont centralisés dans le design system. Un composant ne doit pas introduire directement une nouvelle valeur visuelle sans mise à jour documentaire et test de contraste.

### 4.3 WCFM comme moteur, pas comme identité

Le navigateur ne doit pas recevoir une expérience technique simplement parce qu’une fonction est alimentée par WCFM. Les données et autorisations peuvent rester WCFM; la présentation des parcours P0 et P1 doit être RestoCommerce.

### 4.4 Retour immédiat et honnête

Toute action critique affiche immédiatement un état de travail, ne permet pas le double envoi, annonce le succès ou l’échec, et permet une reprise. Un état optimiste ne doit jamais annoncer une écriture serveur non confirmée.

### 4.5 Aucune sur-déclaration

Un lot est approuvé uniquement si son périmètre, ses moteurs, ses tailles, ses états, ses données et ses seuils sont explicitement prouvés. Une absence de test est un état **non vérifié**, jamais un succès implicite.

## 5. Architecture cible

### 5.1 Couche expérience

La couche RestoCommerce fournit le shell, la navigation, les templates, les composants, les états, le feedback, le responsive, les tokens, le tracking UX non sensible et les contrats de données nécessaires. Elle ne doit pas réimplémenter les règles de sécurité, le calcul des totaux WooCommerce ou les autorisations vendeur.

### 5.2 Couche métier

WooCommerce conserve panier, checkout, commandes, produits, totaux, taxes et statuts. WCFM conserve ownership, permissions vendeur, réglages marketplace et fonctions avancées. Un adaptateur RestoCommerce normalise les données exposées au front et transforme les réponses d’erreur en messages utilisables.

### 5.3 Contrats de réponse

Chaque endpoint RestoCommerce doit retourner un état explicite, un message lisible, une action de reprise éventuelle et une erreur HTTP cohérente. Les contrôles serveur obligatoires sont nonce, authentification, ownership et validation des types. Une clé de commande ne donne accès qu’au reçu correspondant; un identifiant deviné ne suffit jamais.

### 5.4 Règles de dégradation

Si le réseau est lent, le shell et la structure restent immédiatement visibles. Si une requête échoue, l’utilisateur reçoit un état d’erreur avec reprise ciblée. Si JavaScript ne charge pas, la navigation et les liens essentiels restent utilisables. Si la permission de notification est refusée, le badge et le suivi dans l’interface restent la source de vérité.

## 6. Périmètre de migration WCFM

| Niveau | Routes / fonctions | Décision |
| --- | --- | --- |
| P0 | Accueil marketplace, fiche restaurant, produit, panier, checkout, reçu, `/store-manager/`, commandes, menu | Expérience RestoCommerce complète obligatoire |
| P1 | Profil, horaires, capacité, avis, notifications, analytics quotidien | Migrer dans la coque RestoCommerce et conserver WCFM derrière l’adaptateur |
| P2 | Retraits, remboursements, réglages avancés, rapports complexes | Coque RestoCommerce, fonction métier WCFM conservée jusqu’à remplacement prouvé |
| Hors périmètre | Admin WordPress, réglages WooCommerce internes, outils de maintenance | Admin natif autorisé; ne pas le présenter comme une expérience client premium |

Toute route non migrée doit afficher une transition explicite : marque RestoCommerce, fil d’Ariane, retour cockpit, aide, état réseau et mention de fonction avancée. Le chrome WCFM ne doit pas apparaître sans contexte sur les parcours P0.

## 7. Lots de mise en conformité

### Lot UP-0 — Baseline, gouvernance et rollback

Le développeur établit une baseline versionnée de chaque route P0 et P1 : HTML, requêtes, screenshots, métriques, axe, erreurs console, taille des assets et matrice de navigateurs. Les tests s’exécutent sur une copie staging avec données QA isolées, journal horodaté et plan de restauration. Les secrets, cookies, nonces et PII restent hors dépôt.

**Acceptation :** une commande unique relance les tests publics; une autre relance les tests vendeur autorisés; les artefacts sont nommés par version, moteur, viewport et date; une restauration de version est documentée et testée.

### Lot UP-1 — Système visuel de niveau premium

Le design system doit décrire les tokens, la hiérarchie, les grilles, les composants, les états, les interactions, les règles de contenu, les palettes et les exceptions. Chaque composant livré possède une anatomie, des variantes, des états, une règle responsive et un exemple de message.

Le shell doit offrir une cohérence parfaite entre marketplace, restaurant, produit, commerce, reçu et cockpit. Les palettes restaurant ne peuvent modifier que la fiche, les produits, le panier de leurs articles et le cockpit concerné; le chrome global reste stable.

**Acceptation :** aucune couleur non documentée dans les composants P0/P1; aucun texte important posé directement sur une image sans couche de contraste; les quatre palettes passent le contrôle de contraste; le document de design system est mis à jour dans la même livraison que le composant.

### Lot UP-2 — Coque RestoCommerce et sortie du WCFM visible

Le développeur migre d’abord les commandes, le menu, le profil, les avis et les notifications. Chaque écran comporte une navigation desktop et mobile cohérente, un titre concret, une action primaire unique, des états vide/chargement/erreur/succès et une aide contextuelle. WCFM reste accessible comme moteur ou mode avancé, mais ne doit pas être le chemin par défaut.

**Acceptation :** un restaurateur débutant accomplit ouverture du service, ajout d’un plat, lecture d’une commande, transition de statut et consultation d’un avis sans voir de jargon « SKU », « variation » ou « attribut »; les routes avancées gardent une transition de marque explicite.

### Lot UP-3 — Performance et perception de vitesse

Le développeur doit mesurer puis réduire le TTFB, les assets globaux, les images, les polices et le JavaScript non nécessaire. Le HTML public doit être servi avec cache approprié lorsque la donnée le permet. Les images LCP sont dimensionnées, compressées et préchargées seulement lorsque cela apporte un gain mesuré. Les polices disposent d’un fallback métriquement acceptable et d’un comportement documenté en cas d’échec Google Fonts.

Les feuilles et scripts sont chargés par route. `wp-block-library`, WCFM, WooCommerce et les scripts de fragments ne doivent jamais être chargés sans nécessité démontrée. La suppression d’un asset ne peut être conservée que si les routes de contenu et les composants associés passent la non-régression.

**Budgets de sortie public mobile :**

| Mesure | Budget cible |
| --- | ---: |
| Lighthouse Performance | ≥ 90 sur deux passes consécutives par route |
| Lighthouse Accessibilité | ≥ 95 |
| Lighthouse Bonnes pratiques | ≥ 95 |
| LCP | ≤ 2,5 s sur le profil mobile de référence |
| CLS | ≤ 0,10 |
| TBT | ≤ 200 ms |
| TTFB | ≤ 800 ms cible p75 sur environnement représentatif |
| JavaScript initial compressé | ≤ 250 Ko sur marketplace et fiche restaurant |
| CSS initial compressé | ≤ 150 Ko sur marketplace et fiche restaurant |
| Feedback visuel action critique sous profil dégradé | ≤ 1 000 ms au p95 |

Ces budgets sont des objectifs de release sur un environnement représentatif; un staging instable ne peut pas être utilisé pour fabriquer un succès. Tout écart doit être expliqué par une mesure répétée et un plan de correction.

### Lot UP-4 — Actions critiques et temps réel

Le bouton d’ajout panier doit donner un état de travail immédiatement, empêcher le double envoi et afficher le résultat confirmé. L’ajout ou la publication d’un plat doit conserver les données saisies en cas d’erreur. Une transition de commande doit mettre à jour le cockpit sans reload et confirmer le nouvel état.

Le suivi client doit offrir un endpoint sécurisé de refresh borné par order key et contexte de commande. Sur le reçu et la page de suivi, un polling court et stoppable peut être utilisé si aucun push fiable n’est disponible. La fréquence, la fin du polling et le comportement hors ligne doivent être documentés. La notification navigateur, le son, la vibration et WhatsApp sont des canaux complémentaires; aucun ne doit être présenté comme envoyé sans preuve.

**Acceptation :** une transition vendeur est visible côté client en moins de cinq secondes sans rechargement dans une session de test; le mauvais order ID ou la mauvaise clé renvoie 403/404 sans fuite; le polling s’arrête après terminal ou expiration; les préférences son/vibration sont persistées et respectent reduced motion et le refus de permission.

### Lot UP-5 — Accessibilité native et qualité d’interaction

Le produit vise WCAG 2.2 AA sur les surfaces P0/P1. Les contrôles ont un nom accessible, un focus visible, un ordre logique, une cible tactile confortable et un message d’erreur associé. Les dialogues gèrent ouverture, fermeture par bouton et Échap, inertie du fond et retour du focus. Les changements de statut sont annoncés sans interrompre la navigation.

La recette doit couvrir clavier intégral, zoom 200 %, contraste, forced colors si disponible, reduced motion, lecteur d’écran desktop et au moins un lecteur d’écran mobile. Les icônes d’action ne peuvent jamais être dépourvues de label; les icônes décoratives sont masquées aux technologies d’assistance.

**Acceptation :** zéro violation axe critique ou sérieuse sur chaque page concernée; aucune perte de focus dans un parcours complet; aucune information exprimée uniquement par couleur; le parcours commande et le parcours vendeur sont réalisables avec clavier et lecteur natif.

### Lot UP-6 — Responsive, multi-moteur et tactile

La matrice obligatoire couvre Chromium, Firefox et WebKit aux tailles 390×844, 768×1024, 1440×900 et 1920×1080. Les tests contrôlent navigation, menus, dialogues, formulaires, focus, scroll, images, textes longs, RTL si activé et états d’erreur.

Le test tactile humain vérifie zones de pression, clavier virtuel, retour arrière, orientation, scroll horizontal involontaire, sélection d’options et lecture du reçu. Aucune conclusion sur iOS ou Android réel ne peut être déduite de WebKit headless seul.

**Acceptation :** zéro overflow horizontal non intentionnel; aucun CTA critique hors viewport ou recouvert; aucun texte tronqué sans moyen de lecture; chaque breakpoint possède une capture approuvée.

### Lot UP-7 — Régression visuelle et direction artistique

Une baseline est capturée avant chaque modification structurante. Pixelmatch ou équivalent compare les pages à chaque moteur et taille. Les différences attendues sont annotées; les différences inattendues sont bloquantes sur le shell, la navigation, les CTA, les cartes produit, le reçu et le cockpit.

**Seuils proposés :** moins de 0,30 % de pixels modifiés sur les zones stables du shell; moins de 1,00 % sur une page dont le contenu dynamique est masqué ou normalisé; aucune différence critique de contraste, position, visibilité ou texte, quel que soit le pourcentage.

La revue humaine examine la hiérarchie, l’équilibre des blancs, la densité, la qualité des images, la cohérence des alignements, la sensation de calme et la crédibilité des messages. Une capture jolie mais lente ou inaccessible n’est pas premium.

### Lot UP-8 — Sécurité, données et exploitation

Tous les endpoints sensibles appliquent nonce, authentification, validation, ownership et limitation des données retournées. Les erreurs ne révèlent ni stack trace, ni token, ni order key d’une autre commande. Les liens WhatsApp sont inspectés sans être ouverts dans les recettes automatisées; aucun message n’est envoyé sans protocole explicite.

Les commandes, produits et commentaires QA sont préfixés, isolés et archivés ou supprimés selon le plan de nettoyage. Les données non-QA sont conservées. Chaque déploiement comprend un hash d’archive, une confirmation WordPress, un smoke HTTP, une vérification de version et un scénario de rollback.

## 8. Protocole de recette obligatoire

| Axe | Preuve requise |
| --- | --- |
| Fonctionnel | Parcours bout en bout sur données QA réelles, avec résultat serveur et résultat visuel |
| Multi-moteur | Chromium, Firefox, WebKit × 390, 768, 1440, 1920 sur le périmètre concerné |
| Accessibilité | axe par page, clavier intégral, focus, lecteur natif lorsque requis |
| Performance | Deux passes Lighthouse par route, limitation documentée, métriques brutes et synthèse |
| Visuel | Avant/après, Pixelmatch chiffré, captures lisibles et revue humaine |
| Réseau | Réponses 2xx/4xx/5xx classées, erreurs console avec URL, reprise testée |
| Sécurité | Tests nonce, non connecté, ownership inter-vendeur et order key invalide |
| Exploitation | Version, hash, logs nettoyés, rollback vérifié |

Aucune campagne monolithique ne doit contourner la protection WAF du staging. Les cas sont exécutés séquentiellement, avec temporisation et contrôle HTTP après chaque série. Une interruption WAF est un état de recette, pas un succès.

## 9. Critères de sortie d’une version Ultra Premium

La version est **Candidate Premium** lorsque tous les lots P0 sont fonctionnels, que les budgets performance sont atteints sur deux campagnes, que les écarts visuels sont approuvés, que les écrans WCFM P0 ont disparu du chemin par défaut et que les tests clavier sont verts.

La version est **Release Premium** lorsque Candidate Premium est complétée par la matrice multi-moteur complète, le lecteur natif, le téléphone réel, les tests de reprise réseau, le rollback, la décision checkout et la validation humaine du propriétaire.

La version ne peut pas être appelée **100 % conforme** si l’un des éléments suivants manque : téléphone réel, lecteur d’écran natif, moteur/format obligatoire, performance cible, suivi temps réel, décision paiement, test de sécurité ou plan de rollback.

## 10. Feuille de route recommandée

| Étape | Durée indicative | Dépendance | Livrable |
| --- | ---: | --- | --- |
| Semaine 1 — baseline et inventaire | 2–3 jours | Aucune | UP-0, budgets confirmés, captures de référence |
| Semaines 1–2 — shell et tokens | 4–6 jours | UP-0 | UP-1, design system verrouillé |
| Semaines 2–4 — commandes et menu | 7–10 jours | UP-1 | UP-2 P0, routes WCFM quotidiennes remplacées |
| Semaines 3–5 — performance | 5–8 jours | Baseline | UP-3, budgets et régression mesurés |
| Semaines 4–6 — suivi et notifications | 5–8 jours | Contrats serveur | UP-4, suivi sans reload et fallback |
| Semaines 5–7 — accessibilité et responsive | 5–8 jours | Shell stable | UP-5/UP-6, clavier, lecteur, tactile |
| Semaines 6–8 — visuel et release | 4–6 jours | Tous P0 | UP-7/UP-8, rollback et rapport final |

Les durées sont des estimations de développement, pas des promesses de livraison. Tout ajout de fonctionnalité métier doit être accompagné d’un impact sur les budgets, la matrice et le design system.

## 11. Priorités et arbitrages

| Priorité | Travail | Décision |
| --- | --- | --- |
| P0 bloquant | Performance, WCFM P0, suivi client, accessibilité native, responsive critique | Aucun lancement sans clôture |
| P1 important | Notifications enrichies, analytics avancés, migrations WCFM secondaires, Pixelmatch complet | Peut suivre la Candidate Premium |
| P2 premium | Animations avancées, personnalisation éditoriale, préchargement intelligent, micro-interactions supplémentaires | Uniquement si les budgets restent verts |
| Métier | Maintien WhatsApp ou paiement intégré | Décision écrite avant tout code de paiement |

## 12. Definition of Done finale

Le développement est terminé lorsque le dépôt contient le code, les tests, le design system, les rapports, les captures, les budgets, le changelog et la procédure de rollback; lorsque le staging confirme la version installée; lorsque les données QA sont identifiables; et lorsque le propriétaire a validé la recette humaine sur téléphone.

Le produit est déclaré **Ultra Premium** uniquement si la qualité esthétique, la vitesse, l’accessibilité, la continuité de marque et la robustesse fonctionnelle sont toutes démontrées ensemble. Une excellente identité graphique ne compense pas une interface lente, un écran WCFM abrupt ou un suivi client qui ne se met à jour qu’après reload.

## Références internes

[1]: CDC-MAITRE.md "CDC maître RestoCommerce"
[2]: receipts/final-lots-1-12-report.md "Matrice actuelle Lots 0–12"
[3]: receipts/lot-12-report.md "Mesures Lot 12 actualisées"
[4]: DESIGN-SYSTEM.md "Design system vivant"

## 13. Annexe opérationnelle — sandbox et outillage obligatoire

Cette annexe transforme le CDC en protocole exécutable. Un développeur ne peut pas déclarer un lot terminé en indiquant seulement que le code existe. Il doit fournir le résultat des commandes, les rapports bruts et la matrice signée pour la version exacte testée.

### 13.1 Pré-requis de la sandbox

La sandbox de recette doit être séparée du dépôt public et ne doit jamais contenir de secrets commitables. Les variables sensibles sont chargées depuis un fichier local ignoré ou depuis le gestionnaire de secrets de l’environnement. Les valeurs de connexion, cookies, nonces, order keys et PII ne doivent apparaître ni dans stdout, ni dans un screenshot, ni dans un artefact publié.

| Outil | Version à verrouiller | Rôle | Contrôle obligatoire |
| --- | --- | --- | --- |
| Git | version disponible documentée | versionnement, diff, rollback | `git --version` |
| PHP CLI | 8.1 ou supérieur, idéalement identique au staging | lint PHP et contrôles statiques | `php -v` et `php -l` |
| Node.js | 22.x documenté | exécution des harnais | `node --version` |
| pnpm | version verrouillée par le projet | dépendances reproductibles | `pnpm --version` |
| Playwright | version du lockfile | Chromium, Firefox, WebKit | `pnpm exec playwright --version` |
| Navigateurs Playwright | mêmes révisions que Playwright | matrice multi-moteur | `pnpm exec playwright install --dry-run` |
| axe-core | version lockfile | accessibilité automatisée | import ou test axe dans le harnais |
| Lighthouse | version lockfile | performance mobile et catégories CDC | `pnpm exec lighthouse --version` |
| pixelmatch + pngjs | versions lockfile | diff visuel chiffré | test de comparaison sur deux PNG |
| curl | version disponible documentée | smoke HTTP et en-têtes | `curl --version` |
| jq ou parseur JSON Node | version documentée | synthèse sans exposer les secrets | validation des JSON |
| ImageMagick ou Sharp | version documentée si utilisé | dimensions et normalisation images | test d’ouverture et de taille |
| ESLint | version lockfile | qualité JavaScript | `pnpm exec eslint` sur les fichiers modifiés |
| PHPStan ou PHPCS/WPCS | version lockfile si adopté | analyse PHP approfondie | commande documentée et niveau fixé |

Le projet doit pinner les versions dans `package.json`, le lockfile et, si possible, une image de recette. Les navigateurs doivent être installés avant la campagne et ne doivent pas être téléchargés implicitement au milieu d’un run.

### 13.2 Installation et contrôle initial

Les commandes suivantes constituent un exemple de bootstrap. Elles doivent être adaptées au gestionnaire de versions du dépôt, mais le résultat attendu ne change pas.

```bash
cd /home/ubuntu/restocommerce-audit
node --version
pnpm --version
php -v
curl --version
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm exec playwright --version
pnpm exec lighthouse --version
node -e "for (const p of ['axe-core','pixelmatch','pngjs']) { try { console.log(p, require.resolve(p)) } catch { process.exitCode=1; console.error('missing',p) } }"
```

Si une dépendance manque, le développeur l’ajoute au projet avec une version explicite, met à jour le lockfile et exécute la vérification de licence et de vulnérabilités. Il ne doit pas installer silencieusement une dépendance globale qui rendrait la recette non reproductible.

Les contrôles statiques minimaux avant toute recette sont :

```bash
find wordpress-theme/restocommerce -type f -name '*.php' -print0 | xargs -0 -n1 php -l
pnpm exec eslint qa --max-warnings=0
pnpm audit --audit-level=high
find . -type f \( -name '*.env*' -o -name '*secret*' -o -name '*cookie*' \) -not -path './node_modules/*' -print
 git diff --check
```

La dernière commande de recherche doit produire uniquement des fichiers explicitement ignorés et locaux, jamais un secret à publier. Si PHPCS/WPCS ou PHPStan est installé, il est obligatoire sur les fichiers PHP modifiés; sinon le rapport doit préciser son absence et la raison.

### 13.3 Variables et conventions de recette

Les harnais utilisent exclusivement des variables locales non affichées. Les noms recommandés sont `RC_BASE_URL`, `RC_QA_VENDOR_LOGIN`, `RC_QA_VENDOR_PASSWORD`, `RC_QA_CLIENT_LOGIN`, `RC_QA_CLIENT_PASSWORD`, `RC_QA_OUT`, `RC_ENGINE`, `RC_SIZE` et `RC_OUTPUT`. Les valeurs ne doivent jamais être imprimées.

Chaque run écrit un manifeste sans secret : version du thème, commit local, date UTC, URL de staging sans query sensible, moteur, viewport, réseau, CPU, test lancé, navigateur, résultat et chemins des artefacts. Les URLs contenant `key=`, les nonces et les en-têtes `Cookie` sont supprimés du manifeste.

### 13.4 Matrice navigateur et viewport obligatoire

| Moteur | Mobile | Tablette | Desktop | Large desktop |
| --- | --- | --- | --- | --- |
| Chromium | 390×844 | 768×1024 | 1440×900 | 1920×1080 |
| Firefox | 390×844 | 768×1024 | 1440×900 | 1920×1080 |
| WebKit | 390×844 | 768×1024 | 1440×900 | 1920×1080 |

La campagne complète représente 12 couples moteur/viewport par surface. Pour limiter les blocages WAF, elle est exécutée par petits groupes séquentiels : un moteur et une largeur à la fois, contrôle HTTP après chaque groupe, pause documentée, puis reprise. Un cas interrompu par WAF est **non exécuté**, jamais vert par défaut.

Chaque cas doit produire au minimum un screenshot de la page stable, un rapport axe, les erreurs console avec URL assainie, un résumé réseau, les métriques et le verdict fonctionnel. Les screenshots doivent être pris après stabilisation des polices et des données dynamiques; les éléments volatils sont normalisés ou masqués dans le diff, jamais supprimés de la recette fonctionnelle.

### 13.5 Données QA et règles de mutation

Le staging utilise au minimum un compte vendeur QA, un compte client QA et un second contexte vendeur pour les tests d’ownership. Les produits, commandes et avis créés portent un préfixe unique `QA-ULTRA-<run-id>`. Les données existantes non QA sont protégées par une liste d’exclusion et ne doivent pas être supprimées, archivées ou modifiées.

| Objet QA | Création autorisée | Nettoyage attendu |
| --- | --- | --- |
| Produit de recette | Oui, avec ownership vendeur | Archiver ou supprimer après preuve, selon le lot |
| Commande de recette | Oui, sans paiement réel | Conserver si elle documente un état; marquer QA |
| Avis de recette | Oui après commande terminée | Supprimer ou conserver selon plan approuvé |
| Image de test | Oui, fichier non sensible | Supprimer si elle n’est plus nécessaire |
| Configuration vendeur | Oui sur compte QA | Restaurer la valeur initiale si le lot le permet |
| Données non QA | Non | Jamais toucher |

Aucun test ne doit ouvrir un lien WhatsApp, envoyer un message, traiter un paiement réel ou modifier un compte non QA. Les tests de permissions doivent utiliser des réponses HTTP et des comptes isolés; ils ne doivent pas déduire de données par enumeration.

### 13.6 Tests obligatoires par lot

| Lot | Tests fonctionnels obligatoires | Tests techniques obligatoires | Gate de sortie |
| ---: | --- | --- | --- |
| 0 | Installation, login QA, route home, création d’un run | trois navigateurs, axe, Lighthouse, Pixelmatch smoke, PHP/JS lint | outils et premier rapport disponibles |
| 1 | états loading/empty/error/success sur marketplace, menu et commandes; clavier et focus | axe par état, captures, mesure de transition 200–320 ms, responsive | quatre états prouvés sur trois listes |
| 2 | wizard photo→catégorie→nom→prix→options→aperçu→publication; Sauce max 2; duplication; toggle; archivage | ownership, nonce, UI/server limit, rendu public, axe et visuel | produit réel et règle serveur prouvés |
| 3 | onboarding complet nom/adresse/photo/horaires/premier plat/palette/publication; abandon et reprise | persistance, WebKit mobile complet, retour focus, HTTP et axe | boutique réellement visible sur marketplace |
| 4 | tour ≤4 étapes, aide, fermeture, persistance, support inspecté sans ouverture | clavier, axe, reduced motion, screenshots et localStorage assaini | tour non réapparaît après fin |
| 5 | commande client→badge vendeur→drawer→commandes actives; lecture et mark seen | polling ou push mesuré, permission refusée, son/vibration, erreurs console | commande visible sans reload et signal documenté |
| 6 | reçu et quatre états de suivi; transitions vendeur | refresh client sans reload, isolation order key, notification/fallback, axe | état client mis à jour en moins de 5 s |
| 7 | commande terminée→avis→moyenne fiche/cartes; signalement vendeur | vérification ownership, modération, doublon, axe et rendu public | avis réel public et politique modération prouvée |
| 8 | top seller, tendances 7/30 jours, plat inactif; données avant/après | calcul chiffré, absence de données, carte éditoriale, axe et visuel | insights raccordés aux commandes réelles |
| 9 | quatre palettes, save/persist, storefront, panier mono/multi-vendeur, cockpit | axe contraste, aria-pressed, isolation CSS, 3×4×4 progressive, Pixelmatch | aucune fuite de palette ni violation axe |
| 10 | ajout d’un composant et mise à jour documentaire | inventaire tokens, couleurs orphelines, documentation complète | document à jour à la même version |
| 11 | validation de la décision WhatsApp ou paiement simulé uniquement | sécurité, pays/devise/encaissement/reversement, aucun secret carte | décision métier écrite avant code |
| 12 | ajout panier, ajout plat, statut commande sous CPU/réseau dégradés | Lighthouse deux passes, TTFB/LCP/CLS/TBT, console/network, téléphone réel | budgets atteints ou écart accepté formellement |

### 13.7 Commandes types par famille de test

**Smoke public et contrôle WAF :**

```bash
curl -sS -D artifacts/http/home.headers -o artifacts/http/home.html "$RC_BASE_URL/"
curl -sS -L -o /dev/null -w '%{http_code} %{url_effective}\n' "$RC_BASE_URL/"
```

Le smoke vérifie HTTP 200 sur la home, la fiche restaurant, la fiche produit, le panier, le checkout et le reçu lorsque la clé QA est fournie uniquement au contexte local. Les sorties publiques ne doivent pas contenir de CAPTCHA, de trace serveur ni de cookie.

**Playwright multi-moteur :**

```bash
RC_ENGINE=chromium RC_SIZE=mobile RC_OUTPUT=artifacts/lot-<n>/chromium-390 \
  node qa/lot-<n>-<scenario>.mjs
RC_ENGINE=firefox RC_SIZE=desktop RC_OUTPUT=artifacts/lot-<n>/firefox-1440 \
  node qa/lot-<n>-<scenario>.mjs
RC_ENGINE=webkit RC_SIZE=wide RC_OUTPUT=artifacts/lot-<n>/webkit-1920 \
  node qa/lot-<n>-<scenario>.mjs
```

**Lighthouse :**

```bash
pnpm exec lighthouse "$URL" \
  --output=json --output-path="artifacts/lighthouse/<route>-<run>.json" \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --throttling-method=simulate \
  --chrome-flags='--headless --no-sandbox --disable-gpu'
```

Chaque route concernée est mesurée deux fois après une courte période de stabilisation. Le rapport conserve les valeurs brutes; le résumé ne doit pas remplacer les JSON Lighthouse.

**Axe et clavier :** le harnais charge `axe-core` après stabilisation et échoue sur toute violation critique ou sérieuse non explicitement justifiée. Le test clavier commence au header et termine sur l’action métier; il enregistre l’élément actif avant et après chaque dialogue, le retour de focus, Échap, Tab et Shift+Tab.

**Pixelmatch :**

```bash
node qa/compare-screenshots.mjs \
  --before artifacts/baseline/<route>/<engine>-<size>.png \
  --after artifacts/current/<route>/<engine>-<size>.png \
  --diff artifacts/diff/<route>/<engine>-<size>.png
```

Le résumé doit afficher largeur, hauteur, nombre de pixels différents, pourcentage et zones exclues justifiées. Toute variation de texte, contraste, CTA, navigation ou position critique bloque indépendamment du pourcentage.

### 13.8 Gating automatique et statut autorisé

Chaque lot produit un fichier `result.json` avec le schéma minimal suivant :

```json
{
  "lot": 12,
  "version": "2.7.35",
  "engine": "chromium",
  "viewport": "390x844",
  "profile": {"latencyMs": 150, "downloadMbps": 1.6, "cpuSlowdown": 4},
  "functional": "pass",
  "axe": {"violations": 0},
  "lighthouse": {"performance": 90, "accessibility": 100, "bestPractices": 96},
  "visual": {"diffPercent": 0.12},
  "networkErrors": [],
  "mutation": {"qaOnly": true, "cleanup": "pass"},
  "status": "candidate"
}
```

Le fichier réel ne doit pas contenir d’identifiant secret, de clé de commande ou de donnée client. Les statuts autorisés sont :

| Statut | Signification |
| --- | --- |
| `not-run` | Aucun test exploitable |
| `blocked` | Test interrompu par WAF, login, serveur ou environnement |
| `fail` | Test exécuté avec échec fonctionnel, accessibilité, performance ou visuel |
| `pass-scope` | Périmètre exécuté vert, couverture CDC incomplète |
| `candidate` | Lot complet du périmètre prévu, revue et artefacts disponibles |
| `approved` | Gate CDC satisfaite, revue humaine et validation propriétaire effectuées |

Un script de gate doit refuser la publication si une route obligatoire est `blocked`, si un axe sérieux existe, si une des deux passes Lighthouse est sous budget, si une mutation QA n’est pas nettoyée ou si un artefact attendu manque.

### 13.9 Checklist de validation avant chaque lot

Le responsable de recette coche les points suivants dans le rapport du lot :

| Contrôle | Oui/Non | Preuve |
| --- | --- | --- |
| Version du thème et commit enregistrés |  |  |
| Staging répond HTTP 200 sans CAPTCHA |  |  |
| Backup/rollback disponible |  |  |
| Compte et données QA confirmés |  |  |
| Moteurs et révisions installés |  |  |
| Tous les états métier couverts |  |  |
| Nonce/ownership/permissions testés |  |  |
| Axe et clavier exécutés |  |  |
| Lighthouse deux passes exécutées |  |  |
| Screenshots et diff Pixelmatch produits |  |  |
| Console/network classés |  |  |
| Cleanup exécuté et vérifié |  |  |
| Revue humaine effectuée si requise |  |  |
| Verdict signé sans extrapolation |  |  |

### 13.10 Règle d’acceptation par lot

Un lot est accepté uniquement lorsque le rapport contient le code livré, les commandes exécutées, les résultats bruts, les captures, les écarts, les données modifiées et la décision du responsable. Un test manquant est un **gap**; un test bloqué est un **blocked**; une capture non faite n’est pas remplacée par une description textuelle.

Le propriétaire peut accepter un écart explicitement, mais l’acceptation doit indiquer la portée, le risque, la date d’expiration et l’action corrective. Une exception temporaire ne transforme pas le lot en conformité complète.

## 14. Ordre de réalisation recommandé pour le développeur

Le développeur commence par UP-0 et ne code pas les optimisations au hasard. Il établit d’abord la baseline, confirme que le TTFB et les assets sont les vrais goulots, puis traite les routes P0. Il migre ensuite les écrans WCFM quotidiens, sécurise le contrat de suivi client, exécute les tests d’accessibilité native et termine par la matrice visuelle complète et la recette téléphone.

À chaque pull request, il joint le rapport du lot concerné, le diff du design system, le résultat du gate automatique, les captures attendues et la liste des risques non résolus. La branche ne peut pas être fusionnée avec un test rouge masqué, une dépendance non verrouillée ou une donnée QA non identifiée.

## 15. Décision attendue du propriétaire

Avant le démarrage de la phase de réalisation, le propriétaire doit valider par écrit : le seuil Performance cible, les appareils physiques disponibles, le lecteur d’écran mobile choisi, la politique de migration WCFM, la stratégie de suivi temps réel, le maintien de WhatsApp ou le lancement d’un paiement intégré, et l’autorisation de conserver ou nettoyer les commandes QA.

Cette validation ne remplace pas les tests techniques. Elle fixe seulement les décisions de produit nécessaires pour que le développeur puisse fermer les gates sans inventer une règle métier.
