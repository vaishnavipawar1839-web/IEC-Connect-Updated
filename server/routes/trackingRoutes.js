import express from "express";
import {
  assignProposalReviewers,
  getProposalTracking,
  submitFinalDecision,
  submitReviewerRecommendation,
} from "../controllers/trackingController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/proposals/:id", authenticate, getProposalTracking);
router.post(
  "/proposals/:id/assign-reviewers",
  authenticate,
  authorizeRoles("admin"),
  assignProposalReviewers
);
router.post(
  "/proposals/:id/reviews",
  authenticate,
  authorizeRoles("reviewer"),
  submitReviewerRecommendation
);
router.post(
  "/proposals/:id/final-decision",
  authenticate,
  authorizeRoles("admin"),
  submitFinalDecision
);

export default router;