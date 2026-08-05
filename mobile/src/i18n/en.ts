const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading…',
    error: 'Something went wrong',
    retry: 'Retry',
    logout: 'Log out',
  },
  nav: {
    home: 'Home',
    jobs: 'Jobs',
    contracts: 'Contracts',
    messages: 'Messages',
    profile: 'Profile',
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit profile',
    wallet: 'Wallet & payments',
    categories: 'Categories',
    favorites: 'Favorites',
    support: 'Support',
    settings: 'Settings',
    admin: 'Admin dashboard',
    switchToClient: 'Switch to Client mode',
    switchToFreelancer: 'Switch to Freelancer mode',
  },
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    notifications: 'Notifications',
    pushNotifications: 'Push notifications',
    emailNotifications: 'Email notifications',
  },
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    empty: "You're all caught up.",
  },
  ai: {
    seekerTitle: 'Recommended for you',
    clientTitle: 'AI shortlist',
  },
};

export default en;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type TranslationDict = Widen<typeof en>;
