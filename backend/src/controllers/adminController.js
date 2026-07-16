import {
  approveOwner,
  assignRestaurantOwner,
  blockUser,
  createRestaurantForAdmin,
  deactivateRestaurant,
  deleteReviewForModeration,
  getAdminOverview,
  listRestaurantsForAdmin,
  listReviewsForAdmin,
  listUsers,
  rejectOwner,
  setRestaurantVerification,
  unblockUser,
  updateReportStatus,
  updateRestaurantForAdmin
} from "../services/AdminService.js";
import { sendError } from "../utils/errors.js";

function handle(action) {
  return async (req, res) => {
    try {
      await action(req, res);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export const overview = handle(async (_req, res) => res.json(await getAdminOverview()));
export const users = handle(async (_req, res) => res.json(await listUsers()));
export const adminRestaurants = handle(async (_req, res) => res.json(await listRestaurantsForAdmin()));
export const adminReviews = handle(async (_req, res) => res.json(await listReviewsForAdmin()));

export const approveRestaurantOwner = handle(async (req, res) => {
  res.json(await approveOwner(req.params.userId, req.user.id));
});

export const rejectRestaurantOwner = handle(async (req, res) => {
  res.json(await rejectOwner(req.params.userId, req.user.id));
});

export const blockAccount = handle(async (req, res) => {
  res.json(await blockUser(req.params.userId, req.user.id));
});

export const unblockAccount = handle(async (req, res) => {
  res.json(await unblockUser(req.params.userId));
});

export const createRestaurant = handle(async (req, res) => {
  res.status(201).json(await createRestaurantForAdmin(req.body));
});

export const updateRestaurant = handle(async (req, res) => {
  res.json(await updateRestaurantForAdmin(req.params.id, req.body));
});

export const deactivateRestaurantById = handle(async (req, res) => {
  res.json(await deactivateRestaurant(req.params.id));
});

export const verifyRestaurant = handle(async (req, res) => {
  res.json(await setRestaurantVerification(req.params.restaurantId, req.user.id, true));
});

export const unverifyRestaurant = handle(async (req, res) => {
  res.json(await setRestaurantVerification(req.params.restaurantId, req.user.id, false));
});

export const assignOwner = handle(async (req, res) => {
  res.json(await assignRestaurantOwner(req.params.restaurantId, req.body.ownerId));
});

export const moderateReportStatus = handle(async (req, res) => {
  res.json(await updateReportStatus(req.params.reportId, req.user.id, req.body));
});

export const deleteReview = handle(async (req, res) => {
  res.json(await deleteReviewForModeration(req.params.reviewId));
});
