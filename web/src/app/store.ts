import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { authReducer } from '@/features/auth/reducer';
import { uiReducer } from '@/features/ui/reducer';
import { profileReducer } from '@/features/profile/reducer';
import { jobsReducer } from '@/features/jobs/reducer';
import { applicationsReducer } from '@/features/applications/reducer';
import { catalogsReducer } from '@/features/catalogs/reducer';
import { contractsReducer } from '@/features/contracts/reducer';
import { timesheetsReducer } from '@/features/timesheets/reducer';
import { paymentsReducer } from '@/features/payments/reducer';
import { chatReducer } from '@/features/chat/reducer';
import { notificationsReducer } from '@/features/notifications/reducer';
import { adminReducer } from '@/features/admin/reducer';
import { aiReducer } from '@/features/ai/reducer';
import { disputesReducer } from '@/features/disputes/reducer';
import { reviewsReducer } from '@/features/reviews/reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  profile: profileReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  catalogs: catalogsReducer,
  contracts: contractsReducer,
  timesheets: timesheetsReducer,
  payments: paymentsReducer,
  chat: chatReducer,
  notifications: notificationsReducer,
  admin: adminReducer,
  ai: aiReducer,
  disputes: disputesReducer,
  reviews: reviewsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, undefined, applyMiddleware(thunk));

export type AppDispatch = typeof store.dispatch;
