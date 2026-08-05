import type { TranslationDict } from './en';

const fr: TranslationDict = {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    loading: 'Chargement…',
    error: "Une erreur s'est produite",
    retry: 'Réessayer',
    logout: 'Se déconnecter',
  },
  nav: {
    home: 'Accueil',
    jobs: 'Emplois',
    contracts: 'Contrats',
    messages: 'Messages',
    profile: 'Profil',
  },
  profile: {
    title: 'Profil',
    editProfile: 'Modifier le profil',
    wallet: 'Portefeuille et paiements',
    categories: 'Catégories',
    favorites: 'Favoris',
    support: 'Assistance',
    settings: 'Paramètres',
    admin: "Tableau de bord d'administration",
    switchToClient: 'Passer en mode client',
    switchToFreelancer: 'Passer en mode freelance',
  },
  settings: {
    title: 'Paramètres',
    appearance: 'Apparence',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    language: 'Langue',
    notifications: 'Notifications',
    pushNotifications: 'Notifications push',
    emailNotifications: 'Notifications par e-mail',
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    empty: 'Vous êtes à jour.',
  },
  ai: {
    seekerTitle: 'Recommandé pour vous',
    clientTitle: 'Présélection IA',
  },
};

export default fr;
