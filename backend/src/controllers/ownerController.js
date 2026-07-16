import {
  addMenuItem,
  deactivateMenuItem,
  getOwnerRestaurant,
  getOwnerSummary,
  listOwnerReports,
  listOwnerRestaurants,
  listOwnerReviews,
  updateMenuItem,
  updateOwnerRestaurant
} from "../services/OwnerService.js";
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

export const summary = handle(async (req, res) => res.json(await getOwnerSummary(req.user)));
export const restaurants = handle(async (req, res) => res.json(await listOwnerRestaurants(req.user)));
export const restaurant = handle(async (req, res) => res.json(await getOwnerRestaurant(req.user, req.params.id)));
export const updateRestaurant = handle(async (req, res) => res.json(await updateOwnerRestaurant(req.user, req.params.id, req.body)));
export const reviews = handle(async (req, res) => res.json(await listOwnerReviews(req.user, req.params.id)));
export const reports = handle(async (req, res) => res.json(await listOwnerReports(req.user, req.params.id)));

export const createMenuItem = handle(async (req, res) => {
  res.status(201).json(await addMenuItem(req.user, req.params.id, req.body));
});

export const editMenuItem = handle(async (req, res) => {
  res.json(await updateMenuItem(req.user, req.params.id, req.params.itemId, req.body));
});

export const removeMenuItem = handle(async (req, res) => {
  res.json(await deactivateMenuItem(req.user, req.params.id, req.params.itemId));
});
