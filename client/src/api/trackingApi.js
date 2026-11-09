import api from "./axios";

const recommendationByDecision = {
  approved: "approve",
  revision_required: "request_revision",
  rejected: "reject",
};

export const buildReviewRecommendationPayload = ({ decision, text }) => ({
  recommendation: recommendationByDecision[decision] || decision,
  comments: typeof text === "string" ? text.trim() : "",
});

export const buildFinalDecisionPayload = ({ decision, reason }) => ({
  decision,
  reason: typeof reason === "string" ? reason.trim() : "",
});

export const buildReviewerAssignmentPayload = (reviewerIds) => ({
  reviewerIds: [...new Set(reviewerIds || [])],
});

export const getProposalTracking = (proposalId) =>
  api.get(`/tracking/proposals/${proposalId}`);

export const submitReviewRecommendation = (proposalId, formValues) =>
  api.post(
    `/tracking/proposals/${proposalId}/reviews`,
    buildReviewRecommendationPayload(formValues)
  );

export const submitFinalDecision = (proposalId, formValues) =>
  api.post(
    `/tracking/proposals/${proposalId}/final-decision`,
    buildFinalDecisionPayload(formValues)
  );

export const assignProposalReviewers = (proposalId, reviewerIds) =>
  api.post(
    `/tracking/proposals/${proposalId}/assign-reviewers`,
    buildReviewerAssignmentPayload(reviewerIds)
  );