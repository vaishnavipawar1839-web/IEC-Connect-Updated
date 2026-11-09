import express from "express";
import {
  saveDraft,
  submitProposal,
  uploadDocument,
  resubmitProposal,
  getProposalById,
  updateProposal,
  getProposalForReview,
  addReviewComment,
  downloadDocuments,
  downloadProposalFile,
  uploadPaymentProof,
  downloadPaymentProof,
  withdrawProposal,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/proposalController.js";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadProposalSingle } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/draft",
  authenticate,
  authorizeRoles("researcher"),
  saveDraft
);

router.post(
  "/:proposalId/submit",
  authenticate,
  authorizeRoles("researcher"),
  submitProposal
);

router.post(
  "/:proposalId/upload",
  authenticate,
  authorizeRoles("researcher"),
  uploadProposalSingle("file"),
  uploadDocument
);

router.post(
  "/:proposalId/payment-proof",
  authenticate,
  authorizeRoles("researcher"),
  uploadProposalSingle("file"),
  uploadPaymentProof
);

router.get(
  "/:id",
  optionalAuthenticate,
  getProposalById
);

router.get(
  "/:id/download",
  authenticate,
  downloadDocuments
);

router.get(
  "/:id/files/:fileId",
  authenticate,
  downloadProposalFile
);
 
router.get(
  "/:id/payment-proof",
  authenticate,
  downloadPaymentProof
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("researcher"),
  updateProposal
);

router.post(
  "/:id/resubmit",
  authenticate,
  authorizeRoles("researcher"),
  resubmitProposal
);

router.post("/:id/withdraw", authenticate, authorizeRoles("researcher"), withdrawProposal);
router.post("/:id/create-order", authenticate, authorizeRoles("researcher"), createRazorpayOrder);
router.post("/:id/verify-payment", authenticate, authorizeRoles("researcher"), verifyRazorpayPayment);

router.get("/:proposalId/review", authenticate, authorizeRoles("reviewer"), getProposalForReview);
router.post("/:proposalId/review/comment", authenticate, authorizeRoles("reviewer"), addReviewComment);

export default router;