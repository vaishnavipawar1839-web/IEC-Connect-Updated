import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendWorkflowEmail = async ({ to, subject, message, proposalId }) => {
  const mailer = getTransporter();
  if (!mailer || !to) return false;

  const appUrl = process.env.APP_URL || process.env.ALLOWED_ORIGIN || "http://localhost:5173";
  const proposalUrl = `${appUrl.replace(/\/$/, "")}/proposals/${proposalId}`;

  try {
    await mailer.sendMail({
      from: `IEC Connect <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: `${message}\n\nView proposal: ${proposalUrl}`,
      html: `<p>${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p><p><a href="${proposalUrl}">View proposal</a></p>`,
    });
    return true;
  } catch (error) {
    console.error("Workflow email delivery failed:", error.message);
    return false;
  }
};