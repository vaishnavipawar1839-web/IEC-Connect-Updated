// middleware/upload.js
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const storage = multer.memoryStorage(); // Keeps file in RAM as buffer (no disk)
const proposalUploadDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../private_uploads/proposals"
);
fs.mkdirSync(proposalUploadDirectory, { recursive: true });

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (_req, file, callback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only PDF, Word, JPEG, PNG, and WebP files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

const uploadErrorHandler = (uploader, fieldName) => (req, res, next) => {
  uploader.single(fieldName)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File exceeds the 10 MB upload limit" });
    }
    return res.status(400).json({ message: error.message || "Invalid uploaded file" });
  });
};

const proposalStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, proposalUploadDirectory),
  filename: (_req, _file, callback) => callback(null, randomUUID()),
});

const proposalUploader = multer({
  storage: proposalStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const uploadSingle = (fieldName = "file") => uploadErrorHandler(upload, fieldName);
export const uploadProposalSingle = (fieldName = "file") => uploadErrorHandler(proposalUploader, fieldName);