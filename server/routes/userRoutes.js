import express from "express";
import { registerUser, loginUser, logoutUser, refreshToken, getPublicStats, forgotPassword, resetPassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshToken);
router.get("/stats", getPublicStats);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
