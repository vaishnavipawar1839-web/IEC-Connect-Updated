import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import { transitionProposal } from "../utils/proposalWorkflow.js";
import { notifyProposalUsers } from "../utils/proposalNotifications.js";

/* ================= GET SCRUTINY DASHBOARD ================= */
export const getScrutinyDashboard = async (req, res) => {
    try {
        const scrutinyId = req.user.id;

        // Proposals assigned to scrutiny (status: admin_verified)
        const pendingProposals = await Proposal.find({
            status: "admin_verified",
            assignedTo: scrutinyId,
            // In the singleton model, we might not assume direct 'assignedTo' for scrutiny if we just use status.
            // But for consistency, let's assume Admin explicitly assigned it OR 
            // the system auto-assigned it. The status 'admin_verified' implies it's ready for Scrutiny.
        })
            .select("title status createdAt researcher")
            .populate("researcher", "name email shortCode")
            .sort({ createdAt: -1 });

        const scrutinyHistory = { statusHistory: { $elemMatch: { actor: scrutinyId } } };
        const [processedCount, verifiedCount] = await Promise.all([
            Proposal.countDocuments(scrutinyHistory),
            Proposal.countDocuments({
                statusHistory: { $elemMatch: { actor: scrutinyId, to: "scrutiny_verified" } },
            }),
        ]);


        res.json({
            pending: pendingProposals,
            stats: {
                pendingCount: pendingProposals.length,
                processedCount,
                verifiedCount,
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch dashboard" });
    }
};

/* ================= SCRUTINY ACTION ================= */
export const scrutinyAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, comments } = req.body; // decision: "approve" | "reject"

        const proposal = await Proposal.findById(id);
        if (!proposal) return res.status(404).json({ message: "Proposal not found" });

        if (proposal.status !== "admin_verified") {
            return res.status(400).json({ message: "Proposal is not pending scrutiny" });
        }

        if (decision === "approve") {
            transitionProposal(proposal, "scrutiny_verified", req.user.id, comments || "SRC approved proposal");
        } else if (decision === "reject") {
            transitionProposal(proposal, "revision_required", req.user.id, comments || "SRC requested a revision");
            proposal.comments.push({
                reviewer: req.user.id, // Scrutiny user
                text: comments || "Rejected by Scrutiny Committee",
                decision: "revision_required",
                createdAt: new Date()
            });
        } else {
            return res.status(400).json({ message: "Invalid decision" });
        }

        await proposal.save();
        if (decision === "approve") {
            const admins = await User.find({ role: "admin" }).select("_id");
            await notifyProposalUsers({
                recipients: admins,
                proposalId: proposal._id,
                type: "reviewer_assignment_required",
                title: "SRC approved proposal; assign a reviewer",
                message: `${proposal.title || "A proposal"} passed SRC review and is awaiting reviewer assignment.`,
            });
        } else {
            await notifyProposalUsers({
                recipients: [proposal.researcher],
                proposalId: proposal._id,
                type: "src_revision_required",
                title: "SRC requested a proposal revision",
                message: `${proposal.title || "Your proposal"} needs revision before it can continue. Reason: ${comments || "Please review the SRC feedback."}`,
            });
        }
        res.json({ message: "Action submitted successfully", proposal });

    } catch (error) {
        res.status(500).json({ message: "Action failed", error: error.message });
    }
};
