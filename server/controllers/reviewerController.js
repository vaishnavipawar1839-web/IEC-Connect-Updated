import { submitReviewerRecommendation } from "./trackingController.js";

/* ================= ADD REVIEW COMMENT ================= */

export const addReviewComment = async (req, res) => {
  const recommendationByDecision = {
    approved: "approve",
    revision_required: "request_revision",
    rejected: "reject",
  };
  req.params.proposalId = req.params.id;
  req.body = {
    recommendation: recommendationByDecision[req.body.decision],
    comments: req.body.text,
  };
  return submitReviewerRecommendation(req, res);
};