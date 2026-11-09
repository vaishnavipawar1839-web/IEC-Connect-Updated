// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage(); // Keeps file in RAM as buffer (no disk)

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"), false);
    }
  },
});

export const uploadSingle = (fieldName = "file") => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File exceeds the 50 MB upload limit" });
    }
    return res.status(400).json({ message: error.message || "Invalid uploaded file" });
  });
};