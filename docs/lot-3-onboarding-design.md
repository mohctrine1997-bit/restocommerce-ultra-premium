# Lot 3 — Onboarding restaurateur : conception d’implémentation

> **Direction appliquée : « Atelier du Service ».** Le premier lancement doit ressembler à une conversation courte avec un assistant de quartier : une décision compréhensible par écran, des choix amples, pas de jargon d’administration et une sortie toujours explicite.

## Décision de conception

L’onboarding vit dans le cockpit vendeur propriétaire, sur `/store-manager/`. Il ne redirige jamais vers les formulaires WCFM. WCFM reste le moteur des rôles et du profil de boutique ; WooCommerce reste le moteur du premier plat, ouvert depuis l’assistant Lot 2 existant plutôt que dupliqué.

| Étape | Question affichée | Donnée persistée | Contrôle de sortie |
| --- | --- | --- | --- |
| 1 sur 6 | « Comment s’appelle votre restaurant ? » | `wcfmmp_profile_settings.store_name` | Nom non vide. |
| 2 sur 6 | « Où vous trouve-t-on ? » | `wcfmmp_profile_settings.address.city` et `street_1` | Ville ou quartier non vide. |
| 3 sur 6 | « Montrez votre devanture » | `wcfmmp_profile_settings.banner` et `list_banner` | Image valide ou réutilisation d’une image existante. |
| 4 sur 6 | « Quand servez-vous ? » | `restocommerce_store_hours` et reflet `store_hours` WCFM | Au moins une plage d’ouverture. |
| 5 sur 6 | « Quel est votre premier plat ? » | Produit WooCommerce via assistant Lot 2 | Produit publié appartenant au vendeur. |
| 6 sur 6 | « Votre restaurant est prêt » | `restocommerce_onboarding_completed` | Boutique publique et premier plat vérifiables. |

La palette est volontairement **annoncée mais non sélectionnable** : elle appartient au Lot 9 et ne doit pas être anticipée. Ainsi, le Lot 3 prépare l’emplacement visuel sans créer de règle ou de palette prématurée.

## Modèle de reprise

Le brouillon d’onboarding est conservé par vendeur dans la métadonnée utilisateur `restocommerce_vendor_onboarding`.

```text
{
  "version": 1,
  "status": "draft | complete",
  "step": 1..6,
  "values": {
    "storeName": "…",
    "city": "…",
    "street": "…",
    "coverId": 0,
    "hours": { "mon": { "open": "11:30", "close": "22:30" } }
  },
  "updatedAt": 0
}
```

Chaque étape termine par une sauvegarde AJAX protégée par nonce, puis le prochain écran ne s’ouvre qu’après confirmation serveur. Le brouillon est également conservé côté navigateur pendant l’action en cours, mais le serveur est la source de reprise après fermeture, changement de téléphone ou interruption réseau.

## Contrat WordPress/WCFM

| Besoin | Source d’autorité | Règle |
| --- | --- | --- |
| Droits | `wcfm_is_vendor()` | Tous les endpoints vérifient le rôle vendeur connecté et n’acceptent que ses propres métadonnées. |
| Profil public | `wcfmmp_profile_settings` | Le nom, l’adresse et les images sont écrits dans les clés déjà lues par le pont marketplace. |
| Horaires | Métadonnée RestoCommerce + reflet WCFM | La structure RestoCommerce stabilise le rendu futur sans dépendre d’un formulaire WCFM brut. |
| Premier plat | WooCommerce + assistant Lot 2 | L’onboarding transmet le contexte et exige le retour d’un produit publié du vendeur. |
| Publication | WCFM Bridge | Une mise à jour profil déclenche la purge ciblée de la home et de la boutique quand LiteSpeed est disponible. |

### Constat d’audit staging

L’audit lecture seule du staging confirme que WCFM expose les informations de profil et d’adresse, tandis que le pont RestoCommerce lit déjà `wcfmmp_profile_settings.store_name`, `address.city`, `banner` ou `list_banner` pour alimenter la marketplace. L’onboarding écrit donc ces mêmes clés, sans dépendre des formulaires WCFM visuels ni modifier les réglages globaux administrateur.

## Comportement première connexion

Un vendeur dont la boutique manque d’un élément essentiel voit l’assistant s’ouvrir au premier lancement ; les autres voient uniquement une carte de lancement volontaire dans leur cockpit. Il peut quitter l’assistant sans perdre le brouillon, puis le reprendre avec l’étape suivante indiquée. Après publication, cette carte devient un résumé « Boutique prête » avec le lien public ; elle ne bloque pas l’usage quotidien du dashboard.

Les boutiques existantes ne sont jamais modifiées automatiquement. Un vendeur existant peut ouvrir l’assistant volontairement depuis la section Profil pour compléter ses informations, sans remise à zéro de ses données.

## Recette attendue

La recette Lot 3 devra utiliser un vendeur de recette contrôlé, enregistrer l’état initial, parcourir les six étapes sur mobile WebKit, interrompre puis reprendre le brouillon, publier réellement le profil et le premier plat, puis vérifier :

1. la persistance des métadonnées par les endpoints propriétaires et l’interface publique ;
2. la présence de la boutique dans la marketplace après purge ciblée ;
3. l’affichage de son nom, quartier, image et premier plat ;
4. le focus clavier, axe-core, les trois moteurs, les quatre breakpoints, Lighthouse et Pixelmatch ;
5. l’archivage ou la restauration contrôlée des données de recette.
