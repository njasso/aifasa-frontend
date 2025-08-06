Frontend - Plateforme de Gestion de l'Association
Ce dossier contient le code du frontend pour la plateforme de gestion de l'association des ingénieurs agronomes, forestiers et halieutes. Il utilise React avec Tailwind CSS pour le style et axios pour les appels API.
Prérequis

Node.js (v16 ou supérieur)
Backend configuré (voir dossier server/)

Installation

Clonez le dépôt :git clone <repository-url>
cd client


Installez les dépendances :npm install


Configurez les variables d'environnement dans .env :REACT_APP_API_URL=http://localhost:5000/api


Lancez l'application :npm start



Structure

public/ : Fichiers statiques (HTML, favicon).
src/assets/ : Images et polices.
src/components/ : Composants réutilisables (cartes, tableau, navigation).
src/pages/ : Pages principales (Accueil, Documents, Membres, Trésorerie, Projets, Galerie, Connexion).
src/services/ : Appels API avec axios.
src/context/ : Gestion de l'état global (authentification).
src/styles/ : Styles Tailwind CSS.
src/App.jsx : Composant racine avec React Router.
src/index.js : Point d'entrée JavaScript.

Fonctionnalités

Authentification : Connexion avec JWT, rôles (admin, treasurer, member).
Documents : Affichage, ajout (admin), suppression (admin).
Membres : Affichage, ajout (admin), modification (admin), suppression (admin).
Trésorerie : Affichage des transactions, ajout (trésorier/admin), résumé des soldes et corrélations (trésorier/admin).
Projets AGR : Affichage, ajout (admin), modification (admin), suppression (admin).
Galerie : Affichage, ajout (admin), suppression (admin).

Sécurité

Les tokens JWT sont stockés dans localStorage et envoyés dans les en-têtes des requêtes.
Les actions sensibles (ajout, modification, suppression) sont réservées aux rôles appropriés.

Déploiement

Construisez l'application :npm run build


Déployez le dossier build/ sur un service comme Netlify ou Vercel.
Configurez REACT_APP_API_URL dans l'environnement de déploiement pour pointer vers le backend.
