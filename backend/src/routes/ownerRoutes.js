import { Router } from "express";
import {
  createMenuItem,
  editMenuItem,
  removeMenuItem,
  reports,
  restaurant,
  restaurants,
  reviews,
  summary,
  updateRestaurant
} from "../controllers/ownerController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("restaurant_owner"));

router.get("/summary", summary);
router.get("/restaurants", restaurants);
router.get("/restaurants/:id", restaurant);
router.put("/restaurants/:id", updateRestaurant);
router.post("/restaurants/:id/menu", createMenuItem);
router.put("/restaurants/:id/menu/:itemId", editMenuItem);
router.patch("/restaurants/:id/menu/:itemId/deactivate", removeMenuItem);
router.get("/restaurants/:id/reviews", reviews);
router.get("/restaurants/:id/reports", reports);

export default router;
