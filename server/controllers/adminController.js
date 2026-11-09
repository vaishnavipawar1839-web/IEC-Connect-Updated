import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import { transitionProposal } from "../utils/proposalWorkflow.js";
import { notifyProposalUsers } from "../utils/proposalNotifications.js";
import { assignProposalReviewers, submitFinalDecision } from "./trackingController.js";

/* ─────────────────────────────────────────────
   FEE RULES  (based on the IEC fee schedule)
   Maps study-type keywords → fee label
   ───────────────────────────────────────────── */
const FEE_RULES = [
  {
    category: "Research from Other Institute",
    match: (p) => p.sectionA?.typeOfResearch?.includes("Research from Other Institute"),
    baseFee: 10000,
    gst: 0,
    accountNumber: "0493104000083232"
  },
  {
    category: "PG Student Dissertation Research",
    match: (p) => p.sectionA?.typeOfResearch?.includes("PG Student Dissertation Research"),
    baseFee: 5000,
    gst: 0,
    accountNumber: "0493104000083232"
  },
  {
    category: "Other Academic (DNB, DM, Nursing, PhD Research)",
    match: (p) => p.sectionA?.typeOfResearch?.includes("Other Academic (DNB, DM, Nursing, PhD Research)"),
    baseFee: 5000,
    gst: 0,
    accountNumber: "0493104000083232"
  },
  {
    category: "Clinical Trial",
    match: (p) => p.sectionA?.typeOfResearch?.includes("Clinical Trial"),
    baseFee: 95000,
    gst: 17100,
    accountNumber: "0458104000255486" // Pharma/Clinical account
  },
];

export function getFeeInfo(proposal) {
  let highestFeeRule = {
    required: false,
    feeCategory: "NIL",
    baseFee: 0,
    gstAmount: 0,
    totalPayable: 0,
    accountNumber: "N/A"
  };

  for (const rule of FEE_RULES) {
    if (rule.match(proposal)) {
      const currentTotal = rule.baseFee + rule.gst;
      
      // Keep track of the most expensive rule applicable
      if (currentTotal > highestFeeRule.totalPayable) {
        highestFeeRule = {
          required: true,
          feeCategory: rule.category,
          baseFee: rule.baseFee,
          gstAmount: rule.gst,
          totalPayable: currentTotal,
          accountNumber: rule.accountNumber
        };
      }
    }
  }

  return highestFeeRule;
}

/* ================= GET ALL REVIEWERS ================= */
export const getAllReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({ role: "reviewer" }).select(
      "_id name email shortCode"
    );
    res.json(reviewers);
  } catch {
    res.status(500).json({ message: "Failed to fetch reviewers" });
  }
};

/* ================= PROPOSALS AWAITING ADMIN ACTION ================= */
export const getProposalsForAssignment = async (req, res) => {
  try {
    // Show all proposals except drafts for admin to manage
    const proposals = await Proposal.find({
      status: { $ne: "draft" },
    })
      .select(
        "_id title status createdAt administrative research paymentStatus totalPayable paymentProofUrl rejectionReason withdrawnAt withdrawnBy"
      )
      .populate("withdrawnBy", "name role")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch proposals" });
  }
};

/* ================= MARK PAYMENT AS VERIFIED (Admin) ================= */
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    proposal.paymentStatus = "Payment Verified";
    transitionProposal(proposal, "submitted", req.user.id, "Payment verified by admin");
    proposal.paymentVerifiedBy = req.user.id;
    proposal.paymentVerifiedAt = new Date();

    await proposal.save();
    await notifyProposalUsers({
      recipients: [proposal.researcher],
      proposalId: proposal._id,
      type: "payment_verified",
      title: "Proposal payment verified",
      message: `Payment for ${proposal.title || "your proposal"} has been verified and it is awaiting admin review.`,
    });
    res.json({ message: "Payment verified successfully", proposal });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
};

/* ================= REJECT PAYMENT (Admin) ================= */
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Rejection reason is required" });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    proposal.paymentStatus = "Rejected";
    transitionProposal(proposal, "fees_pending", req.user.id, reason);
    proposal.rejectionReason = reason;

    await proposal.save();
    await notifyProposalUsers({
      recipients: [proposal.researcher],
      proposalId: proposal._id,
      type: "payment_rejected",
      title: "Proposal payment needs attention",
      message: `Payment proof for ${proposal.title || "your proposal"} was rejected. Reason: ${reason}`,
    });
    res.json({ message: "Payment rejected", proposal });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject payment", error: error.message });
  }
};

/* ================= ADMIN VERIFY & FORWARD TO SCRUTINY ================= */
export const verifyProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Block verification if fees are required but not yet verified
    if (proposal.totalPayable > 0 && proposal.paymentStatus !== "Payment Verified") {
      return res.status(400).json({
        message: `Review fee of ₹${proposal.totalPayable} must be verified as paid before verifying this proposal.`,
      });
    }

    const scrutinyUsers = await User.find({ role: "scrutiny" });
    if (scrutinyUsers.length === 0) {
      return res
        .status(400)
        .json({ message: "No Scrutiny Member found to assign." });
    }

    proposal.assignedTo = scrutinyUsers.map((u) => u._id);
    transitionProposal(proposal, "admin_verified", req.user.id, "Admin approved and forwarded to SRC");

    await proposal.save();
    await notifyProposalUsers({
      recipients: scrutinyUsers,
      proposalId: proposal._id,
      type: "src_review_required",
      title: "Proposal awaiting SRC review",
      message: `${proposal.title || "A proposal"} was approved by admin and is ready for SRC review.`,
    });

    res.json({
      message: "Proposal verified and forwarded to Scrutiny",
      proposal,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

/* ================= ASSIGN REVIEWERS (legacy) ================= */
export const assignReviewers = async (req, res) => {
  req.body = { reviewerIds: req.body.reviewerIds || req.body.reviewers };
  return assignProposalReviewers(req, res);
};

/* ================= RETURN PROPOSAL FOR CORRECTION (Admin) ================= */
export const returnProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason for return is required" });

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    transitionProposal(proposal, "returned", req.user.id, reason);
    proposal.returnReason = reason;

    // Optional: Reset payment status if needed? 
    // Usually correction is for form data, not payment.

    await proposal.save();
    await notifyProposalUsers({
      recipients: [proposal.researcher],
      proposalId: proposal._id,
      type: "proposal_returned",
      title: "Proposal returned for revision",
      message: `${proposal.title || "Your proposal"} was returned for revision. Reason: ${reason}`,
    });
    res.json({ message: "Proposal returned for correction", proposal });
  } catch (error) {
    res.status(500).json({ message: "Failed to return proposal", error: error.message });
  }
};

/* ================= REJECT PROPOSAL (Admin) ================= */
export const rejectProposal = async (req, res) => {
  req.body = { decision: "rejected", reason: req.body.reason };
  return submitFinalDecision(req, res);
};