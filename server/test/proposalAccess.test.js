import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessProposal,
  getResearcherFields,
  isAssignedReviewer,
  isProposalOwner,
} from "../utils/proposalAccess.js";

const objectId = (value) => ({ toString: () => value });

test("proposal ownership supports populated and unpopulated researcher IDs", () => {
  assert.equal(isProposalOwner({ researcher: objectId("researcher-1") }, "researcher-1"), true);
  assert.equal(
    isProposalOwner({ researcher: { _id: objectId("researcher-1") } }, "researcher-1"),
    true
  );
  assert.equal(isProposalOwner({ researcher: objectId("researcher-2") }, "researcher-1"), false);
});

test("only assigned reviewers can access non-public proposals", () => {
  const proposal = {
    status: "under_review",
    researcher: objectId("researcher-1"),
    reviewers: [objectId("reviewer-1")],
  };

  assert.equal(canAccessProposal(proposal, { id: "reviewer-1", role: "reviewer" }), true);
  assert.equal(canAccessProposal(proposal, { id: "reviewer-2", role: "reviewer" }), false);
  assert.equal(isAssignedReviewer(proposal, "reviewer-1"), true);
  assert.equal(
    isAssignedReviewer({ reviewers: [{ _id: objectId("reviewer-1") }] }, "reviewer-1"),
    true
  );
});

test("approved proposals and designated staff retain read access", () => {
  const proposal = { status: "approved", researcher: objectId("researcher-1") };
  assert.equal(canAccessProposal(proposal, null), true);

  proposal.status = "submitted";
  assert.equal(canAccessProposal(proposal, { id: "admin-1", role: "admin" }), true);
  assert.equal(canAccessProposal(proposal, { id: "scrutiny-1", role: "scrutiny" }), true);
  assert.equal(canAccessProposal(proposal, null), false);
});

test("researcher updates exclude server-owned fields and payment verification", () => {
  const fields = getResearcherFields({
    title: "Study",
    researcher: "attacker",
    status: "approved",
    reviewers: ["reviewer-1"],
    paymentStatus: "Verified",
    sectionG: {
      receiptUrl: "uploaded-proof",
      paymentStatus: "Verified",
      paymentMethod: "Razorpay",
      transactionId: "forged",
      isVerified: true,
    },
  });

  assert.deepEqual(fields, { title: "Study", sectionG: { receiptUrl: "uploaded-proof" } });
});