import { Router } from "express";
import { getRestaurantById, getRestaurants } from "../controllers/restaurantController.js";

const router = Router();

router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

export default router;
