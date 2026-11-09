import express from "express";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";
import { approvedProposals } from "../controllers/documentController.js";
import { downloadDocuments } from "../controllers/proposalController.js";

const router = express.Router();

router.get("/approved", authenticate, approvedProposals);
router.get("/:id/download", optionalAuthenticate, downloadDocuments);

export default router;