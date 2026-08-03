import type { Dispatch } from 'redux';
import * as aiApi from '@/api/ai';
import { extractErrorMessage } from '@/api/client';
import {
  AI_FAILURE,
  AI_MATCH_SCORES_SUCCESS,
  AI_MUTATE_REQUEST,
  AI_RECOMMENDED_JOBS_SUCCESS,
  AI_REQUEST,
  AI_SHORTLIST_SUCCESS,
  type AiAction,
} from './types';

export type AiThunk = (dispatch: Dispatch<AiAction>) => Promise<void>;

export function fetchRecommendedJobs(): AiThunk {
  return async (dispatch) => {
    dispatch({ type: AI_REQUEST });
    try {
      const items = await aiApi.getRecommendedJobs();
      dispatch({ type: AI_RECOMMENDED_JOBS_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: AI_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function runShortlist(jobId: string): AiThunk {
  return async (dispatch) => {
    dispatch({ type: AI_MUTATE_REQUEST });
    try {
      const result = await aiApi.shortlistApplicants(jobId);
      dispatch({ type: AI_SHORTLIST_SUCCESS, payload: result });
    } catch (error) {
      dispatch({ type: AI_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function fetchMatchScores(jobId: string): AiThunk {
  return async (dispatch) => {
    dispatch({ type: AI_REQUEST });
    try {
      const items = await aiApi.getMatchScoresForJob(jobId);
      dispatch({ type: AI_MATCH_SCORES_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: AI_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}
