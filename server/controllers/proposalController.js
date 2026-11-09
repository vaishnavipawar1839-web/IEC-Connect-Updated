import Proposal from "../models/Proposal.js";
import { getFeeInfo } from "./adminController.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unlink } from "node:fs/promises";
import User from "../models/User.js";
import {
  canAccessProposal,
  getResearcherFields,
  isAssignedReviewer,
  isProposalOwner,
} from "../utils/proposalAccess.js";
import { initializeProposalHistory, transitionProposal } from "../utils/proposalWorkflow.js";
import { notifyProposalUsers } from "../utils/proposalNotifications.js";
import { submitReviewerRecommendation } from "./trackingController.js";

const proposalUploadDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../private_uploads/proposals"
);

const removeUploadedFile = async (file) => {
  if (file?.path) await unlink(file.path).catch(() => {});
};

const getUploadFailureMessage = (error) => {
  if (["ENOSPC", "EACCES", "EROFS"].includes(error.code)) {
    return "Server file storage is unavailable. Please contact the administrator.";
  }
  if (error.code === 10334 || /BSONObj size|document is too large/i.test(error.message || "")) {
    return "This proposal is too large to save. Remove older attachments or contact the administrator.";
  }
  if (error.name === "ValidationError") {
    return "The file was received, but the proposal could not be updated. Check the proposal fields and try again.";
  }
  return "The file was received, but could not be saved. Please retry or contact the administrator.";
};

const sendProposalFile = (res, document, download = false) => {
  if (document.storageKey) {
    const storageKey = path.basename(document.storageKey);
    if (storageKey !== document.storageKey) {
      return res.status(400).json({ message: "Invalid stored file reference" });
    }
    const response = res.type(document.contentType || "application/octet-stream");
    if (download) response.attachment(document.fileName || "proposal-document");
    return response.sendFile(path.join(proposalUploadDirectory, storageKey), (error) => {
      if (error && !res.headersSent) {
        res.status(404).json({ message: "Stored file is missing" });
      }
    });
  }

  if (document.fileContent) {
    const buffer = Buffer.from(document.fileContent, "base64");
    res.type(document.contentType || "application/octet-stream");
    if (download) res.attachment(document.fileName || "proposal-document");
    return res.send(buffer);
  }

  return res.status(404).json({ message: "Stored file is missing" });
};

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
      initializeProposalHistory(proposal, req.user.id);
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
    const isRevision = ["returned", "revision_required"].includes(proposal.status);

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
    }
    if (isRevision) {
      proposal.reviewCycle = (proposal.reviewCycle || 1) + 1;
      proposal.finalDecision = undefined;
      proposal.rejectionReason = undefined;
      proposal.returnReason = undefined;
    }

    transitionProposal(
      proposal,
      "submitted",
      req.user.id,
      isRevision ? "Researcher revised and resubmitted proposal" : "Researcher submitted proposal"
    );
    await proposal.save();
    const admins = await User.find({ role: "admin" }).select("_id");
    await notifyProposalUsers({
      recipients: [proposal.researcher, ...admins],
      proposalId: proposal._id,
      type: isRevision ? "proposal_resubmitted" : "proposal_submitted",
      title: isRevision ? "Revised proposal resubmitted" : "Proposal submitted",
      message: isRevision
        ? `${proposal.title || "A proposal"} has been revised and resubmitted for admin approval.`
        : `${proposal.title || "A proposal"} has been submitted and is awaiting admin review.`,
    });
    res.json({ message: "Proposal submitted", proposal });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: "Server error", error: error.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }

    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      await removeUploadedFile(req.file);
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (!isProposalOwner(proposal, req.user.id)) {
      await removeUploadedFile(req.file);
      return res.status(403).json({ message: "You cannot upload payment proof for this proposal" });
    }

    proposal.documents.push({
      fileName: req.file.originalname,
      storageKey: req.file.filename,
      fieldPath: "sectionG.receiptUrl",
      contentType: req.file.mimetype,
      uploadedAt: new Date(),
    });
    const storedDocument = proposal.documents[proposal.documents.length - 1];
    const fileUrl = `/api/proposals/${proposal._id}/files/${storedDocument._id}`;
    proposal.paymentProofFileId = storedDocument._id;
    proposal.paymentProofUrl = fileUrl;
    if (!proposal.sectionG) proposal.sectionG = {};
    proposal.sectionG.receiptUrl = fileUrl;
    proposal.markModified("sectionG");
    proposal.paymentStatus = "Under Verification";

    await proposal.save();

    res.json({
      message: "Payment proof uploaded",
      paymentProofUrl: proposal.paymentProofUrl,
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    console.error("Upload error:", error);
    res.status(error.statusCode || 500).json({ message: getUploadFailureMessage(error) });
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

    if (proposal.paymentProofFileId) {
      const document = proposal.documents.id(proposal.paymentProofFileId);
      if (!document) return res.status(404).json({ message: "Payment proof file not found" });
      return sendProposalFile(res, document);
    }

    const dataUrl = proposal.paymentProofUrl;
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(404).json({ message: "Payment proof file not found" });
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
      await removeUploadedFile(req.file);
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (!isProposalOwner(proposal, req.user.id)) {
      await removeUploadedFile(req.file);
      return res.status(403).json({ message: "You cannot upload documents to this proposal" });
    }

    const fieldPath = req.body.field;
    if (fieldPath !== "sectionG.receiptUrl" && !/^checklistFiles\.item_\d+$/.test(fieldPath)) {
      await removeUploadedFile(req.file);
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
    proposal.documents.push({
      fileName: req.file.originalname,
      storageKey: req.file.filename,
      fieldPath,
      contentType: req.file.mimetype,
      uploadedAt: new Date(),
    });
    const storedDocument = proposal.documents[proposal.documents.length - 1];
    const fileUrl = `/api/proposals/${proposal._id}/files/${storedDocument._id}`;
    current[parts[parts.length - 1]] = fileUrl;
    proposal.markModified(parts[0]);

    if (fieldPath === "sectionG.receiptUrl") {
      proposal.paymentProofUrl = fileUrl;
      proposal.paymentProofFileId = storedDocument._id;
      proposal.paymentStatus = "Under Verification";
      proposal.paymentMethod = "Manual";
      proposal.isVerified = false;
    }

    await proposal.save();

    res.json({
      message: "Document uploaded",
      fileUrl,
      fileName: req.file.originalname,
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    console.error("Upload error:", error);
    res.status(error.statusCode || 500).json({ message: getUploadFailureMessage(error) });
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
    res.status(error.statusCode || 500).json({ message: "Server error", error: error.message });
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

    return sendProposalFile(res, proposal.documents[0], true);
  } catch (error) {
    res.status(500).json({ message: "Download failed", error: error.message });
  }
};

export const downloadProposalFile = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });
    if (!canAccessProposal(proposal, req.user)) {
      return res.status(403).json({ message: "You cannot access this document" });
    }

    const document = proposal.documents.id(req.params.fileId);
    if (!document) return res.status(404).json({ message: "Document not found" });
    return sendProposalFile(res, document);
  } catch (error) {
    res.status(500).json({ message: "Failed to load document", error: error.message });
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
    if (!["returned", "revision_required"].includes(proposal.status)) {
      return res.status(409).json({ message: "Proposal is not awaiting researcher revision" });
    }
    proposal.reviewCycle = (proposal.reviewCycle || 1) + 1;
    proposal.finalDecision = undefined;
    transitionProposal(proposal, "submitted", req.user.id, "Researcher revised and resubmitted proposal");
    await proposal.save();
    const admins = await User.find({ role: "admin" }).select("_id");
    await notifyProposalUsers({
      recipients: [proposal.researcher, ...admins],
      proposalId: proposal._id,
      type: "proposal_resubmitted",
      title: "Revised proposal resubmitted",
      message: `${proposal.title || "A proposal"} has been revised and resubmitted for admin approval.`,
    });
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
  const recommendationByDecision = {
    approved: "approve",
    revision_required: "request_revision",
    rejected: "reject",
  };
  req.body = {
    recommendation: recommendationByDecision[req.body.decision],
    comments: req.body.text,
  };
  return submitReviewerRecommendation(req, res);
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

    transitionProposal(proposal, "withdrawn", req.user.id, "Researcher withdrew proposal");
    proposal.withdrawnAt = new Date();
    proposal.withdrawnBy = req.user.id;
    await proposal.save();

    res.json({ message: "Proposal withdrawn successfully", proposal });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: "Failed to withdraw proposal", error: error.message });
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