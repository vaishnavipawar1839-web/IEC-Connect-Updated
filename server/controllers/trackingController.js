import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { canAccessProposal, isAssignedReviewer } from "../utils/proposalAccess.js";
import { getReviewProgress, transitionProposal } from "../utils/proposalWorkflow.js";
import { notifyProposalUsers } from "../utils/proposalNotifications.js";

const recommendationDecisions = {
  approve: "approved",
  request_revision: "revision_required",
  reject: "rejected",
};

export const getProposalTracking = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("statusHistory.actor", "name role")
      .populate("reviewRecords.reviewer", "name role shortCode")
      .populate("finalDecision.decidedBy", "name role");

    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!canAccessProposal(proposal, req.user)) {
      return res.status(403).json({ message: "You cannot access this proposal timeline" });
    }

    const statusHistory = proposal.statusHistory?.length
      ? proposal.statusHistory
      : [{
        from: null,
        to: proposal.status,
        actor: null,
        reason: "Current status before tracking history was enabled",
        createdAt: proposal.updatedAt || proposal.createdAt,
      }];

    res.json({
      proposalId: proposal._id,
      status: proposal.status,
      reviewCycle: proposal.reviewCycle || 1,
      statusHistory,
      reviewRecords: proposal.reviewRecords,
      reviewProgress: getReviewProgress(proposal),
      finalDecision: proposal.finalDecision,
      assignedReviewers: proposal.reviewers,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load proposal tracking", error: error.message });
  }
};

export const submitReviewerRecommendation = async (req, res) => {
  try {
    const { recommendation, comments } = req.body;
    const normalizedComments = typeof comments === "string" ? comments.trim() : "";

    if (!Object.hasOwn(recommendationDecisions, recommendation) || !normalizedComments) {
      return res.status(400).json({
        message: "A valid recommendation and comments are required",
      });
    }
    if (normalizedComments.length > 10000) {
      return res.status(400).json({ message: "Comments must be 10,000 characters or fewer" });
    }

    const proposalId = req.params.id || req.params.proposalId;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!isAssignedReviewer(proposal, req.user.id)) {
      return res.status(403).json({ message: "You are not assigned to this proposal" });
    }
    if (proposal.status !== "under_review") {
      return res.status(409).json({ message: "This proposal is not accepting reviews" });
    }

    const cycle = proposal.reviewCycle || 1;
    const alreadySubmitted = (proposal.reviewRecords || []).some(
      (review) => review.cycle === cycle && review.reviewer.toString() === req.user.id
    );
    if (alreadySubmitted) {
      return res.status(409).json({ message: "You have already submitted a recommendation for this review cycle" });
    }

    proposal.reviewRecords.push({
      reviewer: req.user.id,
      cycle,
      recommendation,
      comments: normalizedComments,
    });
    proposal.comments.push({
      reviewer: req.user.id,
      text: normalizedComments,
      decision: recommendationDecisions[recommendation],
    });

    const reviewProgress = getReviewProgress(proposal);
    if (reviewProgress.allComplete) {
      transitionProposal(
        proposal,
        "admin_decision_pending",
        req.user.id,
        "All assigned reviewers submitted recommendations"
      );
    }

    await proposal.save();
    if (reviewProgress.allComplete) {
      const admins = await User.find({ role: "admin" }).select("_id");
      await notifyProposalUsers({
        recipients: admins,
        proposalId: proposal._id,
        type: "final_decision_required",
        title: "Proposal ready for final decision",
        message: `${proposal.title || "A proposal"} has received all reviewer recommendations and awaits your final decision.`,
      });
    }
    res.json({
      message: reviewProgress.allComplete
        ? "All recommendations are in; proposal is awaiting the admin decision"
        : "Recommendation submitted",
      status: proposal.status,
      reviewProgress,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Failed to submit recommendation",
    });
  }
};

export const submitFinalDecision = async (req, res) => {
  try {
    const { decision, reason } = req.body;
    const normalizedReason = typeof reason === "string" ? reason.trim() : "";
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be approved or rejected" });
    }
    if (decision === "rejected" && !normalizedReason) {
      return res.status(400).json({ message: "A reason is required for rejection" });
    }
    if (normalizedReason.length > 10000) {
      return res.status(400).json({ message: "Reason must be 10,000 characters or fewer" });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (proposal.status !== "admin_decision_pending") {
      return res.status(409).json({ message: "Proposal is not awaiting a final decision" });
    }

    const reviewProgress = getReviewProgress(proposal);
    if (!reviewProgress.allComplete) {
      return res.status(409).json({ message: "All assigned reviewer recommendations are required first" });
    }

    proposal.finalDecision = {
      decision,
      reason: normalizedReason,
      decidedBy: req.user.id,
      decidedAt: new Date(),
    };
    const nextStatus = decision === "rejected" ? "revision_required" : "approved";
    if (decision === "rejected") proposal.rejectionReason = normalizedReason;
    transitionProposal(
      proposal,
      nextStatus,
      req.user.id,
      decision === "rejected" ? `Final rejection; revision requested: ${normalizedReason}` : "Final approval by admin"
    );

    await proposal.save();
    await notifyProposalUsers({
      recipients: [proposal.researcher],
      proposalId: proposal._id,
      type: decision === "approved" ? "proposal_approved" : "proposal_revision_required",
      title: decision === "approved" ? "Proposal approved" : "Proposal rejected; revision requested",
      message: decision === "approved"
        ? `${proposal.title || "Your proposal"} has received final approval.`
        : `${proposal.title || "Your proposal"} was rejected at final review. Revise and resubmit it for another admin review. Reason: ${normalizedReason}`,
    });
    res.json({
      message: decision === "approved" ? "Proposal approved" : "Proposal rejected; revision requested",
      status: proposal.status,
      finalDecision: proposal.finalDecision,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Failed to record final decision",
    });
  }
};

export const assignProposalReviewers = async (req, res) => {
  try {
    const requestedReviewerIds = req.body.reviewerIds;
    if (!Array.isArray(requestedReviewerIds) || !requestedReviewerIds.length) {
      return res.status(400).json({ message: "Select at least one reviewer" });
    }
    const reviewerIds = [...new Set(requestedReviewerIds)];
    if (reviewerIds.some((reviewerId) => !mongoose.isValidObjectId(reviewerId))) {
      return res.status(400).json({ message: "Select at least one valid reviewer" });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (proposal.status !== "scrutiny_verified") {
      return res.status(409).json({ message: "Proposal is not awaiting reviewer assignment" });
    }

    const reviewers = await User.find({ _id: { $in: reviewerIds }, role: "reviewer" }).select("_id");
    if (reviewers.length !== reviewerIds.length) {
      return res.status(400).json({ message: "One or more selected users are not reviewers" });
    }

    proposal.reviewers = reviewers.map((reviewer) => reviewer._id);
    proposal.assignedTo = reviewers.map((reviewer) => reviewer._id);
    transitionProposal(proposal, "under_review", req.user.id, "Reviewers assigned by admin");
    await proposal.save();

    await notifyProposalUsers({
      recipients: reviewers,
      proposalId: proposal._id,
      type: "review_assigned",
      title: "Proposal assigned for review",
      message: `You have been assigned to review ${proposal.title || "a proposal"}.`,
    });

    res.json({ message: "Reviewers assigned successfully", proposal });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Failed to assign reviewers",
    });
  }
};