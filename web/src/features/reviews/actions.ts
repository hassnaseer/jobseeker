import type { Dispatch } from 'redux';
import * as reviewsApi from '@/api/reviews';
import type { ReviewInput } from '@/api/reviews';
import { extractErrorMessage } from '@/api/client';
import {
  REVIEWS_FAILURE,
  REVIEWS_FOR_CONTRACT_REQUEST,
  REVIEWS_FOR_CONTRACT_SUCCESS,
  REVIEWS_MUTATE_REQUEST,
  REVIEWS_RECEIVED_REQUEST,
  REVIEWS_RECEIVED_SUCCESS,
  type ReviewsAction,
} from './types';

export type ReviewsThunk = (dispatch: Dispatch<ReviewsAction>) => Promise<void>;

export function fetchReviewsForContract(contractId: string): ReviewsThunk {
  return async (dispatch) => {
    dispatch({ type: REVIEWS_FOR_CONTRACT_REQUEST });
    try {
      const items = await reviewsApi.listReviewsForContract(contractId);
      dispatch({ type: REVIEWS_FOR_CONTRACT_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: REVIEWS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function fetchReceivedReviews(userId: string): ReviewsThunk {
  return async (dispatch) => {
    dispatch({ type: REVIEWS_RECEIVED_REQUEST });
    try {
      const items = await reviewsApi.listReviewsReceivedBy(userId);
      dispatch({ type: REVIEWS_RECEIVED_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: REVIEWS_FAILURE, payload: extractErrorMessage(error) });
    }
  };
}

export function submitReview(contractId: string, dto: ReviewInput): ReviewsThunk {
  return async (dispatch) => {
    dispatch({ type: REVIEWS_MUTATE_REQUEST });
    try {
      await reviewsApi.createReview(contractId, dto);
      const items = await reviewsApi.listReviewsForContract(contractId);
      dispatch({ type: REVIEWS_FOR_CONTRACT_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: REVIEWS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}

export function updateReview(id: string, contractId: string, dto: Partial<ReviewInput>): ReviewsThunk {
  return async (dispatch) => {
    dispatch({ type: REVIEWS_MUTATE_REQUEST });
    try {
      await reviewsApi.editReview(id, dto);
      const items = await reviewsApi.listReviewsForContract(contractId);
      dispatch({ type: REVIEWS_FOR_CONTRACT_SUCCESS, payload: items });
    } catch (error) {
      dispatch({ type: REVIEWS_FAILURE, payload: extractErrorMessage(error) });
      throw error;
    }
  };
}
