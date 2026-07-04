import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { removeReview, saveReview } from "../controllers/reviewController.js";

const router = Router();

router.post("/", requireAuth, saveReview);
router.delete("/:restaurantId", requireAuth, removeReview);

export default router;
