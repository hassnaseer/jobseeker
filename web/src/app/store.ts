import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { authReducer } from '@/features/auth/reducer';
import { uiReducer } from '@/features/ui/reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, undefined, applyMiddleware(thunk));

export type AppDispatch = typeof store.dispatch;
