import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendWorkflowEmail } from "./emailService.js";

export const notifyProposalUsers = async ({ recipients, proposalId, type, title, message }) => {
  const recipientIds = [...new Set((recipients || []).map((recipient) => String(recipient?._id || recipient)).filter(Boolean))];
  if (!recipientIds.length) return;

  const [notificationResult, userResult] = await Promise.allSettled([
    Notification.insertMany(recipientIds.map((recipient) => ({
      recipient,
      proposal: proposalId,
      type,
      title,
      message,
    }))),
    User.find({ _id: { $in: recipientIds } }).select("email"),
  ]);

  if (notificationResult.status === "rejected") {
    console.error("In-app proposal notification delivery failed:", notificationResult.reason.message);
  }
  if (userResult.status === "fulfilled") {
    await Promise.allSettled(userResult.value.map((user) => sendWorkflowEmail({
      to: user.email,
      subject: title,
      message,
      proposalId,
    })));
  } else {
    console.error("Could not load proposal notification recipients:", userResult.reason.message);
  }
};