# Recherche premium home — incrément 2.7.56

## Résumé

RestoCommerce 2.7.56 ajoute une recherche premium dans l’en-tête de la home publique, sans React ni Astryx. Le rendu reste PHP/HTML/CSS du thème WordPress existant et la logique est intégrée au script public `assets/js/cart.js`.

Le trigger `Rechercher ⌘K` est rendu uniquement lorsque WordPress évalue `is_front_page()`. Le dialogue `#rc-home-search` est imprimé uniquement par `front-page.php`. Les suggestions rapides transmettent des valeurs textuelles au champ de recherche du dialogue; elles ne déclenchent pas de navigation.

## Parcours utilisateur

Le trigger ouvre un `<dialog>` avec le titre `Recherche locale`, un champ de recherche, les suggestions `Burgers`, `Cuisine marocaine` et `Casablanca`, puis le CTA `Voir les adresses`. À la soumission, la valeur est copiée dans le champ marketplace `[data-rc-search]`, l’événement `input` déclenche le filtre client-side déjà présent, le dialogue est fermé et le script fait défiler `#restaurants`. Après le délai de défilement, le focus revient sur le champ marketplace.

La fermeture fonctionne par bouton, clic extérieur lorsque le navigateur le permet et touche `Escape`. Dans tous les cas contrôlés, `aria-expanded` revient à `false` et le focus retourne au trigger. Ctrl/Cmd+K ouvre à nouveau le dialogue et place le focus dans le champ.

## Fichiers

| Fichier | Rôle |
|---|---|
| `wordpress-theme/restocommerce/header.php` | Trigger conditionnel de la recherche dans l’en-tête home |
| `wordpress-theme/restocommerce/front-page.php` | Dialogue, formulaire, suggestions et libellés accessibles |
| `wordpress-theme/restocommerce/assets/css/frontend.css` | Styles du trigger, dialogue, suggestions et responsive mobile |
| `wordpress-theme/restocommerce/assets/js/cart.js` | Ouverture/fermeture, focus, raccourci et transfert vers le filtre existant |
| `wordpress-theme/restocommerce/style.css` | Version publique 2.7.56 |

## Validation de staging

Le déploiement WordPress a été confirmé par le message `Le thème a bien été mis à jour.` après comparaison `2.7.55` vers `2.7.56`. La recette Chromium mobile 390×844 et desktop 1440×1000 a confirmé HTTP 200, le filtrage `Burgers` vers `Smash Atelier`, la masquage des cartes non correspondantes, le focus clavier, zéro violation axe dans le dialogue et zéro erreur console applicative.

Le smoke HTTP borné a aussi obtenu 200 sur `/`, `/boutique/` et `/store-manager/`. Une annulation de ressource WCFM legacy `notification.mp3` reste documentée comme anomalie réseau non bloquante; elle n’est pas présentée comme une exécution réseau totalement propre.

Ces preuves sont des validations de sous-périmètre staging et ne constituent pas une certification globale du CDC. Firefox/WebKit pour cet incrément, le téléphone physique, le lecteur d’écran natif, les budgets de performance, les surfaces settings/payments et les lots CDC restants doivent être évalués séparément.

## Reproduction locale

Le harnais privé utilisé pendant la recette est conservé hors de l’export public. Un intégrateur peut reproduire le comportement dans un environnement de staging en inspectant les sélecteurs indiqués ci-dessus et en lançant les tests Playwright du projet avec un compte de recette séparé. Ne commitez jamais de cookies, nonces, identifiants, archives de déploiement ou captures contenant des données personnelles.

## Limites de conception

La recherche actuelle filtre les cartes déjà rendues sur la home; elle ne fait pas de recherche serveur ni de géolocalisation. Les résultats sont donc bornés au catalogue marketplace chargé dans la page. La recherche n’ouvre pas le checkout, ne déclenche aucun paiement et n’envoie aucun message WhatsApp.
