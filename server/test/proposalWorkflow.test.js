import test from "node:test";
import assert from "node:assert/strict";
import {
  getReviewProgress,
  initializeProposalHistory,
  transitionProposal,
} from "../utils/proposalWorkflow.js";

test("status transitions append actor, reason, and timestamps to history", () => {
  const proposal = { status: "draft", statusHistory: [] };
  initializeProposalHistory(proposal, "researcher-1");
  transitionProposal(proposal, "submitted", "researcher-1", "Researcher submitted");

  assert.equal(proposal.status, "submitted");
  assert.equal(proposal.statusHistory.length, 2);
  assert.equal(proposal.statusHistory[1].from, "draft");
  assert.equal(proposal.statusHistory[1].to, "submitted");
  assert.equal(proposal.statusHistory[1].actor, "researcher-1");
  assert.equal(proposal.statusHistory[1].reason, "Researcher submitted");
  assert.ok(proposal.statusHistory[1].createdAt instanceof Date);
});

test("invalid status transitions are rejected without changing state", () => {
  const proposal = { status: "approved", statusHistory: [] };

  assert.throws(
    () => transitionProposal(proposal, "under_review", "admin-1"),
    { statusCode: 409 }
  );
  assert.equal(proposal.status, "approved");
  assert.equal(proposal.statusHistory.length, 1);
  assert.equal(proposal.statusHistory[0].to, "approved");
});

test("review progress waits until every assigned reviewer responds", () => {
  const proposal = {
    reviewers: ["reviewer-1", "reviewer-2"],
    assignedTo: ["reviewer-1"],
    reviewRecords: [{ reviewer: "reviewer-1" }],
  };

  assert.deepEqual(getReviewProgress(proposal), {
    assigned: 2,
    completed: 1,
    pending: ["reviewer-2"],
    allComplete: false,
  });
});

test("fee verification can forward an already-assigned proposal to review", () => {
  const proposal = { status: "fees_pending", statusHistory: [] };

  assert.equal(transitionProposal(proposal, "under_review", "admin-1", "Payment verified"), true);
  assert.equal(proposal.status, "under_review");
  assert.equal(proposal.statusHistory[1].from, "fees_pending");
});

test("first transition initializes history for a proposal created before tracking", () => {
  const proposal = { status: "submitted" };

  transitionProposal(proposal, "admin_verified", "admin-1", "Forwarded to SRC");

  assert.equal(proposal.statusHistory.length, 2);
  assert.equal(proposal.statusHistory[0].to, "submitted");
  assert.equal(proposal.statusHistory[1].to, "admin_verified");
});