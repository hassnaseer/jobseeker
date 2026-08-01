import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { authReducer } from '@/features/auth/reducer';
import { uiReducer } from '@/features/ui/reducer';
import { profileReducer } from '@/features/profile/reducer';
import { jobsReducer } from '@/features/jobs/reducer';
import { applicationsReducer } from '@/features/applications/reducer';
import { catalogsReducer } from '@/features/catalogs/reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  profile: profileReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  catalogs: catalogsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, undefined, applyMiddleware(thunk));

export type AppDispatch = typeof store.dispatch;
