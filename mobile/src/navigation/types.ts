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

export type JobsStackParamList = {
  JobsList: undefined;
  MyJobs: undefined;
  JobDetail: { jobId: string };
  PostJob: undefined;
  JobApply: { jobId: string };
  JobApplicants: { jobId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
