import api from "./api";

export type ReviewTag =
  | "PROFESSIONAL"
  | "ON_TIME"
  | "CLEAN_WORK"
  | "FRIENDLY"
  | "GOOD_VALUE"
  | "SKILLED";

export interface Review {
  id: string;
  customerId?: string;
  serviceProviderId?: string;
  rating: number;
  likedTags: ReviewTag[];
  comment?: string | null;
  providerReply?: string | null;
  customer?: { id?: string; name?: string; customerProfile?: { firstName?: string; lastName?: string } };
  serviceProvider?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewInput {
  rating: number;
  likedTags: ReviewTag[];
  comment: string;
}

export async function getProviderReviews(providerId: string) {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data;
}

export async function createReview(
  serviceProviderId: string,
  data: ReviewInput
) {
  const response = await api.post("/reviews", {
    serviceProviderId,
    ...data,
  });
  return response.data;
}

export async function getReviewById(reviewId: string) {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
}

export async function updateReview(reviewId: string, data: ReviewInput) {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
}

export async function deleteReview(reviewId: string) {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
}
