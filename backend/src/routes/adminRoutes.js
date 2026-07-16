import { Router } from "express";
import {
  adminRestaurants,
  adminReviews,
  approveRestaurantOwner,
  assignOwner,
  blockAccount,
  createRestaurant,
  deactivateRestaurantById,
  deleteReview,
  moderateReportStatus,
  overview,
  rejectRestaurantOwner,
  unblockAccount,
  unverifyRestaurant,
  updateRestaurant,
  users,
  verifyRestaurant
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/overview", overview);
router.get("/users", users);
router.patch("/users/:userId/approve-owner", approveRestaurantOwner);
router.patch("/users/:userId/reject-owner", rejectRestaurantOwner);
router.patch("/users/:userId/block", blockAccount);
router.patch("/users/:userId/unblock", unblockAccount);

router.get("/restaurants", adminRestaurants);
router.post("/restaurants", createRestaurant);
router.put("/restaurants/:id", updateRestaurant);
router.patch("/restaurants/:id/deactivate", deactivateRestaurantById);
router.patch("/restaurants/:restaurantId/verify", verifyRestaurant);
router.patch("/restaurants/:restaurantId/unverify", unverifyRestaurant);
router.patch("/restaurants/:restaurantId/assign-owner", assignOwner);

router.patch("/reports/:reportId/status", moderateReportStatus);

router.get("/reviews", adminReviews);
router.delete("/reviews/:reviewId", deleteReview);

export default router;
