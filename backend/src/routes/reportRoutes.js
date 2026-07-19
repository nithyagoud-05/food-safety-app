import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getReports, submitReport, uploadReportEvidence } from "../controllers/reportController.js";
import { ApiError } from "../utils/errors.js";
import { sendError } from "../utils/errors.js";

const router = Router();
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Unsupported file type. Upload JPG, JPEG, PNG, or WEBP images"));
      return;
    }
    callback(null, true);
  }
});

function uploadEvidenceMiddleware(req, res, next) {
  upload.array("evidenceImages", 3)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof ApiError) return sendError(res, error);
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Each evidence image must be 5 MB or smaller"
        : "Upload a maximum of 3 images";
      return sendError(res, new ApiError(400, message));
    }
    return sendError(res, new ApiError(400, "Evidence upload failed"));
  });
}

router.get("/", requireAuth, requireRole("admin"), getReports);
router.post("/evidence", requireAuth, requireRole("user"), uploadEvidenceMiddleware, uploadReportEvidence);
router.post("/", requireAuth, requireRole("user"), submitReport);

export default router;
