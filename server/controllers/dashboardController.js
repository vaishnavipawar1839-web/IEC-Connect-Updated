import Proposal from "../models/Proposal.js";
import User from "../models/User.js";

/* ================= RESEARCHER ================= */

export const researcherDashboard = async (req, res) => {
  const researcherId = req.user.id;

  const proposals = await Proposal.find({ researcher: researcherId })
    .sort({ createdAt: -1 });

  const stats = {
    total: await Proposal.countDocuments({ researcher: researcherId }),
    underReview: await Proposal.countDocuments({
      researcher: researcherId,
      status: "under_review"
    }),
    awaitingDecision: await Proposal.countDocuments({
      researcher: researcherId,
      status: "admin_decision_pending"
    }),
    approved: await Proposal.countDocuments({
      researcher: researcherId,
      status: "approved"
    }),
    actionRequired: await Proposal.countDocuments({
      researcher: researcherId,
      status: { $in: ["revision_required", "fees_pending", "returned"] }
    })
  };

  res.json({ stats, recentProposals: proposals });
};

/* ================= REVIEWER ================= */

export const reviewerDashboard = async (req, res) => {
  try {
    const reviewerId = req.user.id;

    const assignedProposalDocuments = await Proposal.find({
      $or: [{ assignedTo: reviewerId }, { reviewers: reviewerId }]
    })
      .select("title status createdAt researcher reviewCycle reviewRecords")
      .populate("researcher", "shortCode")
      .sort({ createdAt: -1 });
    const assignedProposals = assignedProposalDocuments.map((proposal) => ({
      ...proposal.toObject(),
      myReviewSubmitted: (proposal.reviewRecords || []).some(
        (review) => review.reviewer.toString() === reviewerId &&
          (review.cycle || 1) === (proposal.reviewCycle || 1)
      ),
    }));

    const pendingCount = assignedProposals.filter(
      (proposal) => proposal.status === "under_review" && !proposal.myReviewSubmitted
    ).length;

    const stats = {
      totalAssigned: await Proposal.countDocuments({
        $or: [{ assignedTo: reviewerId }, { reviewers: reviewerId }]
      }),
      pending: pendingCount,
      completed: assignedProposals.filter((proposal) => proposal.myReviewSubmitted).length,
    };

    res.json({
      stats,
      assignedProposals
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load reviewer dashboard data"
    });
  }
};

/* ================= ADMIN ================= */

export const adminDashboard = async (req, res) => {
  try {
    const [
      totalProposals,
      approved,
      underReview,
      awaitingDecision,
      revisionRequired,
      rejected,
      totalUsers,
      totalResearchers,
      totalReviewers
    ] = await Promise.all([
      Proposal.countDocuments(),
      Proposal.countDocuments({ status: "approved" }),
      Proposal.countDocuments({ status: "under_review" }),
      Proposal.countDocuments({ status: "admin_decision_pending" }),
      Proposal.countDocuments({ status: "revision_required" }),
      Proposal.countDocuments({ status: "rejected" }),
      User.countDocuments(),
      User.countDocuments({ role: "researcher" }),
      User.countDocuments({ role: "reviewer" })
    ]);

    res.json({
      proposals: {
        total: totalProposals,
        approved,
        underReview,
        awaitingDecision,
        revisionRequired,
        rejected
      },
      users: {
        total: totalUsers,
        researchers: totalResearchers,
        reviewers: totalReviewers
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load admin dashboard data"
    });
  }
};