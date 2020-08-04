# Sheaft App

Ce projet correspond au portail applicatif web de Sheaft. Il est développé en Svelte (https://svelte.dev)

## Pré-requis

- NPM installé
- Une API Web, Sheaft.Api est disponible dans le repository https://github.com/sheaft-app/api. (Sheaft.SignalR, Sheaft.Functions ne sont pas requis pour pouvoir utiliser le portail applicatif, ni le compte Sendgrid).
- Un serveur d'identité, Sheaft.Identity est disponible dans le repository https://github.com/sheaft-app/identity. (le compte sendgrid n'est pas nécessaire pour utiliser le portail applicatif).

## Lancement

Pour lancer le portail, il suffit de :
- Executer "npm run portal:local" pour spécifier que nous souhaitons fonctionner sans la partie remote, hebergée sur Azure. 
- Démarrer l'api Sheaft.Api (https://localhost:5003).
- Démarrer l'api Sheaft.Identity (https://localhost:5001)

## Build

La compilation est assurée par rollup, le support des navigateur plus ancien est géré à l'aide de Babel.

## Public

Contient la page d'index.html du site ainsi que les images/assets du site.
La compilation svelte dépose le résultat dans le dossier /dist.
C'est ce répertoire qui est publié sur le Storage Azure Web.

## Src/Components

Cette partie contient les éléments réutilisable de l'application.

## Src/Routes

Cette partie contient les pages de l'application.

## Src/Services

Cette partie contient les services de base de l'application (GraphQL, Auth, Errors etc).

## Ajout d'une page

TODO
