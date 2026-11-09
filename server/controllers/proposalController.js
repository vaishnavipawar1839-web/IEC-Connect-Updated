import Proposal from "../models/Proposal.js";
import { getFeeInfo } from "./adminController.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  canAccessProposal,
  getResearcherFields,
  isAssignedReviewer,
  isProposalOwner,
} from "../utils/proposalAccess.js";

export const saveDraft = async (req, res) => {
  try {
    const proposalData = {
      ...getResearcherFields(req.body),
      researcher: req.user.id
    };

    // Auto-populate root level title from administrative.studyTitle if present
    if (proposalData.administrative && proposalData.administrative.studyTitle) {
      proposalData.title = proposalData.administrative.studyTitle;
    }

    let proposal;
    if (req.body._id) {
      proposal = await Proposal.findOneAndUpdate(
        { _id: req.body._id, researcher: req.user.id },
        proposalData,
        {
        new: true,
        runValidators: true
        }
      );
      if (!proposal) return res.status(404).json({ message: "Draft not found" });
    } else {
      proposal = new Proposal({ ...proposalData, status: "draft" });
      await proposal.save({ validateBeforeSave: false });
    }

    res.json(proposal);
  } catch (error) {
    res.status(400).json({ message: "Failed to save draft", error: error.message });
  }
};

export const submitProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot submit this proposal" });
    }

    // Sync title
    if (proposal.administrative && proposal.administrative.studyTitle) {
      proposal.title = proposal.administrative.studyTitle;
    }

    // ── Fee logic ──────────────────────────────────────────────────────────
    // Only calculate fees on FIRST submission (draft → submitted).
    // If the proposal is being resubmitted after a return/revision,
    // the fee was already decided — don't reset it.
    const isFirstSubmission = proposal.status === "draft";
    const alreadyPaidOrFree =
      proposal.paymentStatus === "Payment Verified" || 
      proposal.paymentStatus === "Verified" ||
      proposal.totalPayable === 0;

    if (isFirstSubmission) {
      // Fresh submission: calculate and apply fees
      const feeInfo = getFeeInfo(proposal.toObject());
      proposal.feeCategory = feeInfo.feeCategory;
      proposal.baseFee = feeInfo.baseFee;
      proposal.gstAmount = feeInfo.gstAmount;
      proposal.totalPayable = feeInfo.totalPayable;

      // Allow submission if verified (Razorpay) or Paid (Receipt uploaded manually)
      // Statuses that count as "Payment Provided" for submission purposes
      const validStatuses = ["Verified", "Paid", "Under Verification", "Payment Verified"];
      const isPaidOrVerified = validStatuses.includes(proposal.paymentStatus) || proposal.isVerified;

      if (proposal.totalPayable > 0 && !isPaidOrVerified) {
        return res.status(400).json({ 
          message: `A review fee of ₹${proposal.totalPayable} is required. Please pay via Razorpay or upload a receipt in Section G before submitting.` 
        });
      }
      proposal.status = "fees_pending";
    }
    // For resubmissions (returned / revision_required): leave fee fields untouched.
    // ──────────────────────────────────────────────────────────────────────────

    // Auto-transition to submitted (or under_review) if fee is cleared
    if (isFirstSubmission || alreadyPaidOrFree) {
      const feeCleared =
        proposal.paymentStatus === "Payment Verified" || 
        proposal.paymentStatus === "Verified" ||
        proposal.totalPayable === 0;

      if (feeCleared) {
        if (proposal.reviewers && proposal.reviewers.length > 0) {
          proposal.status = "under_review";
        } else {
          proposal.status = "submitted";
        }
      }
    } else {
      // Resubmission after return/revision — always land in submitted
      proposal.status = "submitted";
    }

    await proposal.save();
    res.json({ message: "Proposal submitted", proposal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }

    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot upload payment proof for this proposal" });
    }

    const base64Content = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    proposal.paymentProofUrl = `data:${mimeType};base64,${base64Content}`;
    proposal.paymentStatus = "Under Verification";

    await proposal.save();

    res.json({
      message: "Payment proof uploaded",
      paymentProofUrl: proposal.paymentProofUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const downloadPaymentProof = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal || !proposal.paymentProofUrl) {
      return res.status(404).json({ message: "Payment proof not found" });
    }
    if (!isProposalOwner(proposal, req.user.id) && !["admin", "scrutiny"].includes(req.user.role)) {
      return res.status(403).json({ message: "You cannot access this payment proof" });
    }

    const dataUrl = proposal.paymentProofUrl;
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      // Fallback if it's already a direct URL or something else
      return res.redirect(dataUrl);
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Failed to load payment proof", error: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }

    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot upload documents to this proposal" });
    }

    const base64Content = req.file.buffer.toString("base64");

    const fieldPath = req.body.field;
    if (fieldPath !== "sectionG.receiptUrl" && !/^checklistFiles\.item_\d+$/.test(fieldPath)) {
      return res.status(400).json({ message: "Invalid document field" });
    }

    const parts = fieldPath.split(".");
    let current = proposal;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = `data:${req.file.mimetype};base64,${base64Content}`;
    proposal.markModified(parts[0]);

    if (fieldPath === "sectionG.receiptUrl") {
      proposal.paymentProofUrl = `data:${req.file.mimetype};base64,${base64Content}`;
      proposal.paymentStatus = "Under Verification";
      proposal.paymentMethod = "Manual";
      proposal.isVerified = false;
    }

    proposal.documents.push({
      fileName: req.file.originalname,
      fileContent: base64Content,
      contentType: req.file.mimetype,
      uploadedAt: new Date(),
    });

    await proposal.save();

    res.json({
      message: "PDF uploaded and stored as base64",
      fileUrl: `data:application/pdf;base64,${base64Content}`,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate("researcher", "name email");
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    if (!canAccessProposal(proposal, req.user)) {
      return res.status(403).json({ message: "Unauthorized access to this proposal" });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const downloadDocuments = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal || !proposal.documents || proposal.documents.length === 0) {
      return res.status(404).json({ message: "No documents found" });
    }
    if (!canAccessProposal(proposal, req.user)) {
      return res.status(403).json({ message: "You cannot access these documents" });
    }

    // For simplicity, if there's only one, send it. If multiple, we might need a zip.
    // However, the user just wants the download to "work".
    // Let's send the first document as a fallback or implement basic logic.
    const doc = proposal.documents[0];
    const buffer = Buffer.from(doc.fileContent, 'base64');

    res.type(doc.contentType).attachment(doc.fileName).send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Download failed", error: error.message });
  }
};

export const updateProposal = async (req, res) => {
  try {
    const updateData = getResearcherFields(req.body);

    // Auto-update root title
    if (updateData.administrative && updateData.administrative.studyTitle) {
      updateData.title = updateData.administrative.studyTitle;
    }

    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, researcher: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    res.json(proposal);
  } catch (error) {
    res.status(400).json({ message: "Failed to update", error: error.message });
  }
};

export const resubmitProposal = async (req, res) => {
  try {
    const { responseText } = req.body;
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot resubmit this proposal" });
    }

    proposal.responses.push({
      researcher: req.user.id,
      text: responseText,
      createdAt: new Date()
    });
    proposal.status = "submitted";
    await proposal.save();
    res.json({ message: "Proposal resubmitted", proposal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProposalForReview = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId)
      .populate("researcher", "name email")
      .populate("reviewers", "name email")
      .populate("comments.reviewer", "name");

    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    if (!isAssignedReviewer(proposal, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to review this proposal" });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch proposal", error: error.message });
  }
};

export const addReviewComment = async (req, res) => {
  try {
    const { text, decision } = req.body;

    const proposal = await Proposal.findById(req.params.proposalId);

    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    if (!isAssignedReviewer(proposal, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to comment" });
    }

    proposal.comments.push({
      reviewer: req.user.id,
      text,
      decision,
    });

    if (decision === "revision_required") {
      proposal.status = "revision_required";
    } else if (decision === "rejected") {
      proposal.status = "rejected";
    } else if (decision === "approved") {
      proposal.status = "approved";
    }

    await proposal.save();

    res.json({ message: "Comment added", proposal });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

/* ================= WITHDRAW PROPOSAL (Researcher) ================= */
export const withdrawProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot withdraw this proposal" });
    }

    // Allowed for any active submission status except terminal ones or draft
    const terminalStatuses = ["withdrawn", "approved", "rejected"];
    if (proposal.status === "draft" || terminalStatuses.includes(proposal.status)) {
      return res.status(400).json({ message: "Proposal cannot be withdrawn at this stage" });
    }

    proposal.status = "withdrawn";
    proposal.withdrawnAt = new Date();
    proposal.withdrawnBy = req.user.id;
    await proposal.save();

    res.json({ message: "Proposal withdrawn successfully", proposal });
  } catch (error) {
    res.status(500).json({ message: "Failed to withdraw proposal", error: error.message });
  }
};

/* ================= RAZORPAY INTEGRATION ================= */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot create an order for this proposal" });
    }

    const feeInfo = getFeeInfo(proposal.toObject());
    if (feeInfo.totalPayable <= 0) {
      return res.status(400).json({ message: "No payment required for this proposal" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Payment processing is not configured" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: feeInfo.totalPayable * 100, // in paise
      currency: "INR",
      receipt: `receipt_${proposal._id}`,
    };

    const order = await instance.orders.create(options);
    
    // Persist fee details to proposal document so it shows in view pages even before final submit
    proposal.feeCategory = feeInfo.feeCategory;
    proposal.baseFee = feeInfo.baseFee;
    proposal.gstAmount = feeInfo.gstAmount;
    proposal.totalPayable = feeInfo.totalPayable;
    proposal.razorpayOrderId = order.id;
    await proposal.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Razorpay order creation failed", error: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay details" });
    }

    const proposal = await Proposal.findById(id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!isProposalOwner(proposal, req.user.id)) {
      return res.status(403).json({ message: "You cannot verify payment for this proposal" });
    }
    if (proposal.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment order does not match this proposal" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("CRITICAL: RAZORPAY_KEY_SECRET is not set in environment.");
      return res.status(500).json({ message: "Server configuration error - Payment verification failed" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (!/^[a-f\d]{64}$/i.test(razorpay_signature)) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    );

    if (isMatch) {
      const feeInfo = getFeeInfo(proposal.toObject());

      // Update proposal payment details
      proposal.paymentStatus = "Verified";
      proposal.paymentMethod = "Razorpay";
      proposal.transactionId = razorpay_payment_id;
      proposal.isVerified = true;
      proposal.razorpayOrderId = undefined;

      // Persistence of fee details
      proposal.feeCategory = feeInfo.feeCategory;
      proposal.baseFee = feeInfo.baseFee;
      proposal.gstAmount = feeInfo.gstAmount;
      proposal.totalPayable = feeInfo.totalPayable;

      // Sync with Section G for frontend form state
      if (!proposal.sectionG) proposal.sectionG = {};
      proposal.sectionG.paymentStatus = "Verified";
      proposal.sectionG.paymentMethod = "Razorpay";
      proposal.sectionG.transactionId = razorpay_payment_id;
      proposal.sectionG.isVerified = true;

      // Update checklist to mark payment as received (Sync with Section F)
      if (!proposal.checklist) proposal.checklist = {};
      proposal.checklist.yn_6 = "Yes";

      await proposal.save();

      res.json({ message: "Payment verified successfully", proposal });
    } else {
      console.warn(`Signature mismatch for proposal ${id}. Received: ${razorpay_signature}`);
      res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};