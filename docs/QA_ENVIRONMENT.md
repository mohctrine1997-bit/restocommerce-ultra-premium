# Configuration locale des recettes authentifiées

Ce fichier explique la configuration **locale et non versionnée** des scripts de recette. Créez `.env.local` à la racine du projet ; ce fichier est ignoré par Git et ne doit jamais être téléversé.

```dotenv
# URL de staging WordPress utilisée par les recettes. Ne pas employer la production sans accord explicite.
RC_STAGING_ORIGIN=https://your-wordpress-staging.example

# Compte vendeur WCFM avec des droits limités, réservé à la recette.
RC_VENDOR_USER=
RC_VENDOR_PASSWORD=

# Optionnel : identifiants de plats de recette interrompus à archiver avant le prochain passage.
RC_ARCHIVE_IDS=
```

Chargez ces variables dans votre shell avant de lancer les scripts :

```bash
set -a && source .env.local && set +a
```

> Ne transmettez jamais ce fichier dans une issue, un pull request, une archive de thème ou un dépôt public.
