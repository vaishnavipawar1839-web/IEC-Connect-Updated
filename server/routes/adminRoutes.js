import express from "express";
import {
  getAllReviewers,
  createReviewer,
  getProposalsForAssignment,
  assignReviewers,
  verifyProposal,
  verifyPayment,
  rejectPayment,
  returnProposal,
  rejectProposal,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/reviewers",
  authenticate,
  authorizeRoles("admin"),
  getAllReviewers
);

router.post(
  "/reviewers",
  authenticate,
  authorizeRoles("admin"),
  createReviewer
);

router.get(
  "/proposals",
  authenticate,
  authorizeRoles("admin"),
  getProposalsForAssignment
);

router.post(
  "/proposals/:id/verify",
  authenticate,
  authorizeRoles("admin"),
  verifyProposal
);

router.post(
  "/proposals/:id/assign-reviewers",
  authenticate,
  authorizeRoles("admin"),
  assignReviewers
);

/* ── Fee management ── */
router.post(
  "/proposals/:id/verify-payment",
  authenticate,
  authorizeRoles("admin"),
  verifyPayment
);

router.post(
  "/proposals/:id/reject-payment",
  authenticate,
  authorizeRoles("admin"),
  rejectPayment
);

router.post(
  "/proposals/:id/return",
  authenticate,
  authorizeRoles("admin"),
  returnProposal
);

router.post(
  "/proposals/:id/reject",
  authenticate,
  authorizeRoles("admin"),
  rejectProposal
);

export default router;