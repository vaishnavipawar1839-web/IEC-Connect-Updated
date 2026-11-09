import User from "../models/User.js";
import Proposal from "../models/Proposal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});

export const registerUser = async (req, res) => {
  try {
    const {
    name,
    designation,
    qualification,
    department,
    subDepartment,
    institution,
    contact,
    email,
    password,
  } = req.body;

  const role = "researcher";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const requiredFields = [name, designation, qualification, department, institution, password];
  if (requiredFields.some((value) => typeof value !== "string" || !value.trim())) {
    return res.status(400).json({ message: "Complete all required registration fields" });
  }
  if (password.length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const rolePrefix = role === "reviewer" ? "REV" : role === "admin" ? "ADM" : role === "scrutiny" ? "SCR" : "RES";
    const count = await User.countDocuments({ role: role || "researcher" });
    const shortCode = `${rolePrefix}${String(count + 1).padStart(3, "0")}`;

    const newUser = new User({
      name,
      designation,
      qualification,
      department,
      subDepartment,
      institution,
      contact,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "researcher",
      shortCode
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Database Save Failed (registerUser):", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });
    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Select that role to sign in.`,
      });
    }

    // 🔑 Access token (short lived)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 🔁 Refresh token (long lived)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      ...refreshCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", refreshCookieOptions());
  res.json({ message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select("role");
    if (!user) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.sendStatus(403);
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const researchersCount = await User.countDocuments({ role: "researcher" });
    const proposalsCount = await Proposal.countDocuments();
    const approvedCount = await Proposal.countDocuments({ status: "approved" });
    const approvalRate =
      proposalsCount > 0 ? Math.round((approvedCount / proposalsCount) * 100) : 0;

    res.json({
      researchers: researchersCount,
      proposals: proposalsCount,
      approvalRate: approvalRate
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching public stats", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "No account with that email exists" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.ALLOWED_ORIGIN || "http://localhost:5173"}/reset-password/${resetToken}`;

    let transporter;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: "Server email is not configured. Please contact the administrator." });
    }

      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        secure: false,
        port: 587,
      });
      // Verify connection configuration
      transporter.verify((error, success) => {
        if (error) {
          console.error("Nodemailer configuration error:", error);
        } else {
          console.log("Nodemailer server is ready to take messages");
        }
      });

    const message = {
      from: `"EthixPortal" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e5e1ff; border-radius: 12px;">
      <h2 style="color: #3d3654; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="color: #7c73a0; font-size: 16px;">You recently requested to reset your password for your EthixPortal account.</p>
      <p style="color: #7c73a0; font-size: 16px;">Click the button below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b7cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
      <p style="color: #7c73a0; font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
      <p style="color: #a09ac0; font-size: 12px; margin-top: 30px;">This link will expire in 15 minutes.</p>
      </div>`,
    };

    await transporter.sendMail(message);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};