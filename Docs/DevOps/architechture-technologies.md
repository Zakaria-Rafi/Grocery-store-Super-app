### **Architecture et Technologies \- Trinity**

### Le projet Trinity répond aux besoins d’une chaîne de supermarchés souhaitant améliorer sa compétitivité à travers le développement de solutions numériques avancées. Le projet est structuré en trois parties distinctes et complémentaires : DevOps, développement Web, et développement d'application mobile.

### **Choix technologies :**

* **Backend \- NestJS** :  
  * NestJS est un framework backend qui utilise TypeScript, facilitant la gestion des APIs RESTful et des fonctionnalités complexes. Il est bien adapté pour une application nécessitant des API sécurisées et performantes, essentielles pour la gestion des stocks, des ventes, et des utilisateurs.  
  * NestJS utilise l'architecture modulaire inspirée d'Angular, permettant de séparer les responsabilités et facilitant la scalabilité et la maintenance du projet, ce qui est crucial pour la gestion de différentes parties de l’application.  
  * Il propose des outils pour sécuriser facilement les requêtes HTTP (comme les intercepteurs, les guards et la gestion des JWT) pour contrer les attaques CSRF et XSS.  
* **Frontend Web \- Vue/Nuxt** :  
  * Vue/Nuxt permet une expérience utilisateur fluide et réactive grâce au rendu côté serveur (SSR) et aux optimisations de chargement dynamique, idéales pour un front office interactif et intuitif. Cela améliore la vitesse de navigation et l'expérience de l’utilisateur final.  
  * Grâce à Pinia pour la gestion de l’état et aux composants réutilisables de Vue, le développement est simplifié et plus maintenable. Nuxt structure les projets Vue en facilitant le routage et la pré-récupération des données, utile pour une application nécessitant de nombreuses interactions et du contenu dynamique.  
  * Nuxt s'intègre facilement dans un pipeline CI/CD pour automatiser les tests et les déploiements. Il est aussi compatible avec les bonnes pratiques de sécurité pour protéger les échanges de données entre le frontend et le backend.  
* **Mobile \- Flutter** :  
  * Flutter permet de créer des applications à la fois pour iOS et Android avec un code unique, réduisant le temps de développement et les coûts pour fournir une expérience homogène sur les deux plateformes, essentiel pour toucher un large public client.  
  * Flutter offre des animations fluides et une interface utilisateur personnalisable, rendant l’application intuitive et agréable, ce qui améliore l'expérience d'achat et la satisfaction des clients, objectifs principaux du projet.  
  * Flutter est compatible avec l'intégration de systèmes de paiement comme PayPal, permettant de sécuriser les paiements en ligne et d’améliorer la fiabilité des transactions, tout en assurant une expérience utilisateur sans faille.


### **Architecture du projet**

* **Architecture globale :**

Le projet est composé de trois principales parties (Backend/API, Frontend Web, et Application Mobile). Voici comment chaque partie interagit dans l’architecture :

* Backend/API:  
  * Fournit une API RESTful centralisée pour exposer les données des utilisateurs, des produits, et des transactions.  
  * Gère l’authentification et la sécurité grâce à JWT.  
  * Communique avec une base de données relationnelle en Postgresql.  
  * Offre des endpoints pour la gestion des stocks, des utilisateurs et des rapports analytiques.  
* Frontend Web:  
  * Sert de tableau de bord pour les gestionnaires.  
  * Interagit avec le backend pour récupérer les données en temps réel (stocks, ventes, KPI).  
  * Offre une interface utilisateur intuitive pour gérer les produits, les utilisateurs et consulter des rapports.  
* Application Mobile:  
  * Ciblée pour les clients finaux pour simplifier le processus d'achat.  
  * Utilise l'API pour afficher des informations produits, gérer les paniers, et effectuer des paiements sécurisés.  
  * Implémente un scanner pour lire les codes-barres des produits et récupérer leurs détails via l’API.  
* API externes:  
  * L’API Paypal est appelée lors de la gestion du paiement.  
  * L’API Open Food facts API est utilisée.  
      
* **Organisation des répertoires :**  
  * Le répertoire va s’organiser sous la forme de plusieurs dossiers :   
    * frontend  
    * backend  
    * mobile  
    * documentation

                           ***Schéma Architecture projet trinity***

  


