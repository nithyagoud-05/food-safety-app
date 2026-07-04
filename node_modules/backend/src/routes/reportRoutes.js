import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getReports, submitReport } from "../controllers/reportController.js";

const router = Router();

router.get("/", getReports);
router.post("/", requireAuth, submitReport);

export default router;
