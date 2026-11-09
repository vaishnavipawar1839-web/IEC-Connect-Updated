import test from "node:test";
import assert from "node:assert/strict";
import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {
  assignProposalReviewers,
  submitFinalDecision,
  submitReviewerRecommendation,
} from "../controllers/trackingController.js";

const makeProposal = () => ({
  _id: "proposal-1",
  status: "under_review",
  reviewCycle: 1,
  reviewers: ["reviewer-1", "reviewer-2"],
  assignedTo: [],
  reviewRecords: [],
  comments: [],
  statusHistory: [],
  save: async () => {},
});

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const stubNotifications = (t) => {
  const originalFind = User.find;
  const originalInsertMany = Notification.insertMany;
  User.find = () => ({ select: async () => [] });
  Notification.insertMany = async () => [];
  t.after(() => {
    User.find = originalFind;
    Notification.insertMany = originalInsertMany;
  });
};

test("tracking API waits for every reviewer before admin decision", async (t) => {
  stubNotifications(t);
  const proposal = makeProposal();
  const originalFindById = Proposal.findById;
  Proposal.findById = async () => proposal;
  t.after(() => { Proposal.findById = originalFindById; });

  const firstResponse = makeResponse();
  await submitReviewerRecommendation({
    params: { id: proposal._id },
    user: { id: "reviewer-1" },
    body: { recommendation: "approve", comments: "Looks complete" },
  }, firstResponse);

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(proposal.status, "under_review");
  assert.equal(firstResponse.body.reviewProgress.completed, 1);

  const secondResponse = makeResponse();
  await submitReviewerRecommendation({
    params: { id: proposal._id },
    user: { id: "reviewer-2" },
    body: { recommendation: "request_revision", comments: "Clarify the methods" },
  }, secondResponse);

  assert.equal(secondResponse.statusCode, 200);
  assert.equal(proposal.status, "admin_decision_pending");
  assert.equal(proposal.reviewRecords.length, 2);
});

test("tracking API rejects duplicate reviewer submissions for the same cycle", async (t) => {
  const proposal = makeProposal();
  proposal.reviewRecords.push({ reviewer: "reviewer-1", cycle: 1 });
  const originalFindById = Proposal.findById;
  Proposal.findById = async () => proposal;
  t.after(() => { Proposal.findById = originalFindById; });

  const response = makeResponse();
  await submitReviewerRecommendation({
    params: { id: proposal._id },
    user: { id: "reviewer-1" },
    body: { recommendation: "approve", comments: "Duplicate" },
  }, response);

  assert.equal(response.statusCode, 409);
  assert.equal(proposal.reviewRecords.length, 1);
});

test("admin final decision is saved only after all reviews are complete", async (t) => {
  stubNotifications(t);
  const proposal = makeProposal();
  proposal.status = "admin_decision_pending";
  proposal.reviewRecords = [
    { reviewer: "reviewer-1", cycle: 1 },
    { reviewer: "reviewer-2", cycle: 1 },
  ];
  const originalFindById = Proposal.findById;
  Proposal.findById = async () => proposal;
  t.after(() => { Proposal.findById = originalFindById; });

  const response = makeResponse();
  await submitFinalDecision({
    params: { id: proposal._id },
    user: { id: "admin-1" },
    body: { decision: "approved", reason: "" },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(proposal.status, "approved");
  assert.equal(proposal.finalDecision.decidedBy, "admin-1");
  assert.equal(proposal.statusHistory.at(-1).from, "admin_decision_pending");
});

test("final rejection notifies the researcher and returns proposal for revision", async (t) => {
  stubNotifications(t);
  const proposal = makeProposal();
  proposal.status = "admin_decision_pending";
  proposal.reviewRecords = [
    { reviewer: "reviewer-1", cycle: 1 },
    { reviewer: "reviewer-2", cycle: 1 },
  ];
  const originalFindById = Proposal.findById;
  Proposal.findById = async () => proposal;
  t.after(() => { Proposal.findById = originalFindById; });

  const response = makeResponse();
  await submitFinalDecision({
    params: { id: proposal._id },
    user: { id: "admin-1" },
    body: { decision: "rejected", reason: "The study needs a revised methodology" },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "revision_required");
  assert.equal(proposal.finalDecision.decision, "rejected");
  assert.equal(proposal.statusHistory.at(-1).to, "revision_required");
});

test("admin assignment validates reviewers and starts the review stage", async (t) => {
  stubNotifications(t);
  const proposal = makeProposal();
  proposal.status = "scrutiny_verified";
  const reviewerId = "64b000000000000000000001";
  const originalFindById = Proposal.findById;
  const originalUserFind = User.find;
  Proposal.findById = async () => proposal;
  User.find = () => ({ select: async () => [{ _id: reviewerId }] });
  t.after(() => {
    Proposal.findById = originalFindById;
    User.find = originalUserFind;
  });

  const response = makeResponse();
  await assignProposalReviewers({
    params: { id: proposal._id },
    user: { id: "64b000000000000000000002" },
    body: { reviewerIds: [reviewerId] },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(proposal.status, "under_review");
  assert.deepEqual(proposal.reviewers, [reviewerId]);
  assert.equal(proposal.statusHistory.at(-1).to, "under_review");
});