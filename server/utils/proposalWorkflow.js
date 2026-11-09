export const allowedProposalTransitions = {
  draft: ["fees_pending", "submitted", "withdrawn"],
  fees_pending: ["submitted", "admin_verified", "under_review", "returned", "rejected", "withdrawn"],
  payment_completed: ["submitted", "admin_verified", "rejected"],
  submitted: ["fees_pending", "admin_verified", "under_review", "returned", "rejected", "withdrawn"],
  admin_verified: ["scrutiny_verified", "under_review", "revision_required", "returned", "rejected", "withdrawn"],
  scrutiny_verified: ["under_review", "revision_required", "returned", "rejected", "withdrawn"],
  under_review: ["admin_decision_pending", "revision_required", "returned", "rejected", "withdrawn"],
  admin_decision_pending: ["approved", "returned", "revision_required"],
  revision_required: ["submitted", "returned", "rejected", "withdrawn"],
  returned: ["submitted", "fees_pending", "rejected", "withdrawn"],
  approved: [],
  rejected: [],
  withdrawn: [],
};

export const initializeProposalHistory = (proposal, actorId, reason = "Draft created") => {
  if (!Array.isArray(proposal.statusHistory)) proposal.statusHistory = [];
  if (proposal.statusHistory.length === 0) {
    proposal.statusHistory.push({
      from: null,
      to: proposal.status,
      actor: actorId,
      reason,
      createdAt: new Date(),
    });
  }
};

export const transitionProposal = (proposal, to, actorId, reason = "") => {
  initializeProposalHistory(proposal, actorId, "Existing proposal entered tracking");
  const from = proposal.status;
  if (from === to) return false;

  if (!allowedProposalTransitions[from]?.includes(to)) {
    const error = new Error(`Invalid proposal status transition: ${from} -> ${to}`);
    error.statusCode = 409;
    throw error;
  }

  proposal.status = to;
  proposal.statusHistory.push({ from, to, actor: actorId, reason, createdAt: new Date() });
  return true;
};

const normalizeId = (value) => String(value?._id || value);

export const getReviewProgress = (proposal) => {
  const assignedReviewers = [...new Set([
    ...(proposal.reviewers || []),
    ...(proposal.assignedTo || []),
  ].map(normalizeId))];
  const currentCycle = proposal.reviewCycle || 1;
  const completedReviewers = new Set((proposal.reviewRecords || [])
    .filter((review) => (review.cycle || 1) === currentCycle)
    .map((review) => normalizeId(review.reviewer)
    ));

  return {
    assigned: assignedReviewers.length,
    completed: assignedReviewers.filter((id) => completedReviewers.has(id)).length,
    pending: assignedReviewers.filter((id) => !completedReviewers.has(id)),
    allComplete: assignedReviewers.length > 0 && assignedReviewers.every((id) => completedReviewers.has(id)),
  };
};