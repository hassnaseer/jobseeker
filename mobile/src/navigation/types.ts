export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  SaLogin: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Contracts: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Wallet: undefined;
  Withdraw: undefined;
  Categories: undefined;
  Favorites: undefined;
  Support: undefined;
  Settings: undefined;
  Catalogs: undefined;
  CatalogDetail: { catalogId: string };
  CatalogForm: { catalogId?: string };
  Disputes: undefined;
  DisputeDetail: { disputeId: string };
  AdminDashboard: undefined;
  AdminApprovals: undefined;
  AdminDisputes: undefined;
  AdminCategories: undefined;
  AdminConfig: undefined;
  AdminTeam: undefined;
};

export type MessagesStackParamList = {
  ConversationsList: undefined;
  ChatThread: { conversationId: string };
};

export type ContractsStackParamList = {
  ContractsList: undefined;
  ContractDetail: { contractId: string };
};

export type JobsStackParamList = {
  JobsList: undefined;
  MyJobs: undefined;
  JobDetail: { jobId: string };
  PostJob: undefined;
  JobApply: { jobId: string };
  JobApplicants: { jobId: string };
  HireApplicant: { jobId: string; applicationId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
