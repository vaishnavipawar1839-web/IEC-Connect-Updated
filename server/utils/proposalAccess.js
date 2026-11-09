const researcherEditableFields = [
  "title", "administrative", "research", "participant", "consentData", "declaration",
  "sectionA", "sectionB", "sectionC", "sectionD", "sectionE", "sectionF", "sectionG",
  "checklist", "checklistFiles", "sectionBR", "sectionIC", "sectionSC", "sectionPub",
  "sectionDecl", "summary", "objectives", "methodology", "expectedOutcome",
];

export const getResearcherFields = (data = {}) => {
  const fields = Object.fromEntries(
    researcherEditableFields
      .filter((field) => Object.prototype.hasOwnProperty.call(data, field))
      .map((field) => [field, data[field]])
  );

  if (fields.sectionG) {
    const { paymentStatus, paymentMethod, transactionId, isVerified, ...sectionG } = fields.sectionG;
    fields.sectionG = sectionG;
  }

  return fields;
};

export const isProposalOwner = (proposal, userId) => {
  const researcherId = proposal.researcher?._id || proposal.researcher;
  return researcherId?.toString() === String(userId);
};

export const isAssignedReviewer = (proposal, userId) =>
  [...(proposal.reviewers || []), ...(proposal.assignedTo || [])]
    .some((reviewer) => (reviewer?._id || reviewer).toString() === String(userId));

export const canAccessProposal = (proposal, user) => {
  if (proposal.status === "approved") return true;
  if (!user) return false;
  if (isProposalOwner(proposal, user.id)) return true;
  if (["admin", "scrutiny"].includes(user.role)) return true;
  return user.role === "reviewer" && isAssignedReviewer(proposal, user.id);
};