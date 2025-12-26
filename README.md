Application Mobylis de Transport en Commun Oujda 
Description du Projet
Cette application mobile concerne les bus de la ville d'Oujda. Elle permet aux utilisateurs de rechercher et consulter les lignes de bus disponibles de manière simple et intuitive.
Fonctionnalités Principales
1. Recherche de Bus

L'utilisateur peut rechercher les bus disponibles en utilisant deux champs : "De" et "Vers"
Les arrêts sont pré-remplis dans une liste déroulante pour faciliter la sélection
Affichage des itinéraires disponibles selon la recherche

2. Système d'Authentification
L'application offre deux options pour créer un compte ou se connecter :

Connexion manuelle : avec email et mot de passe
Connexion Google : authentification rapide via un compte Google

3. Fonctionnalités pour Utilisateurs Connectés
Lorsqu'un utilisateur est connecté, il bénéficie de :

Routes favorites : possibilité d'ajouter des itinéraires en favoris pour un accès rapide
Historique de recherche : toutes les recherches sont automatiquement sauvegardées dans la base de données

4. Réinitialisation de Mot de Passe

Option "Mot de passe oublié" disponible
L'utilisateur reçoit un email pour réinitialiser son mot de passe

Architecture Technique
Base de Données - Firebase
Authentication Service
    Authentification par email et mot de passe
    Authentification via compte Google
    Fonction de réinitialisation de mot de passe
Firestore Service
    La base de données Firestore contient 3 collections principales :
    Bus : informations sur les lignes de bus
    
    User : données des utilisateurs
    Sous-collection : favRoutes (routes favorites)
    Sous-collection : recentSearches (historique de recherches)
    
    Stop : liste des arrêts de bus

État Actuel du Projet
✅ Fonctionnalités Opérationnelles

Toutes les fonctionnalités mentionnées ci-dessus fonctionnent parfaitement dans la version web Ionic
Recherche de bus
Création de compte et connexion
Gestion des favoris
Sauvegarde de l'historique
____________________________________________________
⚠️ Problème en Cours
Problème de redirection sur Android :
Lorsque l'application est compilée pour Android (Android Studio), un problème survient lors de la connexion via Google :

L'utilisateur clique sur "Se connecter avec Google"
Une page de navigateur s'ouvre correctement
L'utilisateur sélectionne son compte Google
Toutes les étapes d'authentification se déroulent bien
_______________________________________________________
PROBLÈME : À la fin de la procédure, l'utilisateur est redirigé vers localhost/tabs/account dans le navigateur web au lieu de retourner dans l'application mobile
Impact : L'utilisateur reste bloqué sur une page web et ne revient pas automatiquement dans l'application.
_______________________________________________________
Tâches Restantes
 Résoudre le problème de redirection Google Auth sur Android
 Ajouter plus de données dans les collections (bus, arrêts)
 Tester et optimiser l'expérience utilisateur sur Android
Documentation Complémentaire
Le projet comprend :
Vidéo 1 : Démonstration de la version web Ionic (fonctionnement complet)
Vidéo 2 : Démonstration de l'application Android (montrant le problème de redirection)
Capture d'écran : Email de réinitialisation de mot de passe
Technologies Utilisées

Backend : Firebase (Authentication + Firestore)
Platform Mobile : Android
Langages : TypeScript, HTML, CSS
