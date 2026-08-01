import {
  CATALOGS_DETAIL_REQUEST,
  CATALOGS_DETAIL_SUCCESS,
  CATALOGS_FAILURE,
  CATALOGS_LIST_REQUEST,
  CATALOGS_LIST_SUCCESS,
  CATALOGS_MINE_REQUEST,
  CATALOGS_MINE_SUCCESS,
  CATALOGS_MUTATE_REQUEST,
  CATALOGS_MUTATE_SUCCESS,
  type CatalogsAction,
  type CatalogsState,
} from './types';

const initialState: CatalogsState = {
  list: [],
  mine: [],
  detail: null,
  status: 'idle',
  error: null,
};

export function catalogsReducer(state = initialState, action: CatalogsAction): CatalogsState {
  switch (action.type) {
    case CATALOGS_LIST_REQUEST:
    case CATALOGS_MINE_REQUEST:
    case CATALOGS_DETAIL_REQUEST:
      return { ...state, status: 'loading', error: null };
    case CATALOGS_MUTATE_REQUEST:
      return { ...state, status: 'saving', error: null };
    case CATALOGS_LIST_SUCCESS:
      return { ...state, status: 'ready', list: action.payload };
    case CATALOGS_MINE_SUCCESS:
      return { ...state, status: 'ready', mine: action.payload };
    case CATALOGS_DETAIL_SUCCESS:
      return { ...state, status: 'ready', detail: action.payload };
    case CATALOGS_MUTATE_SUCCESS: {
      const catalog = action.payload;
      const exists = state.mine.some((c) => c.id === catalog.id);
      return {
        ...state,
        status: 'ready',
        detail: state.detail?.id === catalog.id ? catalog : state.detail,
        mine: exists ? state.mine.map((c) => (c.id === catalog.id ? catalog : c)) : [catalog, ...state.mine],
      };
    }
    case CATALOGS_FAILURE:
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
