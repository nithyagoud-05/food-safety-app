import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { removeReview, saveReview } from "../controllers/reviewController.js";

const router = Router();

router.post("/", requireAuth, requireRole("user"), saveReview);
router.delete("/:restaurantId", requireAuth, requireRole("user"), removeReview);

export default router;
