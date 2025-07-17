# FreelanHub - Place de Marché pour Freelances et Offres d'Emploi

Ceci est le README pour le projet FreelanHub, une place de marché en ligne conçue pour connecter les freelances avec des employeurs potentiels. Le projet est construit avec HTML, Tailwind CSS, et Sass.

## Aperçu du Projet

FreelanHub est un template de site web pour une plateforme qui permet aux freelances de présenter leurs services et aux employeurs de publier des offres d'emploi et des projets. Il comprend des pages pour les listes d'emplois, les profils de candidats, les tableaux de bord pour les employeurs et les candidats, et plus encore.

## Structure du Projet

Le projet est structuré comme suit :

-   `/assets`: Contient toutes les ressources statiques.
    -   `/css`: Fichiers CSS, y compris les bibliothèques tierces comme Swiper et Leaflet.
    -   `/images`: Toutes les images utilisées dans le projet.
    -   `/js`: Fichiers JavaScript, y compris les bibliothèques tierces et le script principal `main.js`.
    -   `/scss`: Fichiers Sass pour le style personnalisé.
-   `/dist`: Contient les fichiers CSS compilés.
    -   `output-tailwind.css`: Le fichier CSS généré par Tailwind.
    -   `output-scss.css`: Le fichier CSS généré par Sass.
-   `*.html`: Les différents fichiers HTML pour les pages du site.
-   `package.json`: Définit les dépendances et les scripts du projet.
-   `tailwind.config.js`: Fichier de configuration pour Tailwind CSS.

## Installation

Pour travailler avec ce projet, vous devez avoir Node.js et npm (ou un autre gestionnaire de paquets) installés.

1.  Clonez le dépôt sur votre machine locale.
2.  Ouvrez un terminal à la racine du projet.
3.  Installez les dépendances du projet en exécutant la commande suivante :

    ```bash
    npm install
    ```

## Développement

Pour commencer le développement, vous devez exécuter deux processus en parallèle pour compiler le CSS de Tailwind et le Sass.

1.  **Compiler Tailwind CSS**:
    Ouvrez un terminal et exécutez la commande suivante pour surveiller les changements dans les fichiers CSS et les recompiler à la volée :

    ```bash
    npm run dev
    ```

2.  **Compiler Sass**:
    Ouvrez un deuxième terminal et exécutez la commande suivante pour surveiller les changements dans les fichiers SCSS et les compiler en CSS :

    ```bash
    npm run sass
    ```

Après avoir lancé ces deux commandes, vous pouvez ouvrir n'importe quel fichier `.html` dans votre navigateur pour voir le site web. Les changements que vous apporterez aux fichiers `assets/css/style.css` ou `assets/scss/**/*.scss` seront automatiquement compilés.

## Dépendances

Les principales dépendances du projet sont :

-   **tailwindcss**: Un framework CSS "utility-first" pour créer rapidement des designs personnalisés.
-   **sass**: Un préprocesseur CSS qui ajoute des fonctionnalités comme les variables, les mixins et l'imbrication.