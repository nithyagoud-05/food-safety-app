import { getRestaurantDetail, listRestaurants } from "../data/store.js";
import { sendError } from "../utils/errors.js";

export async function getRestaurants(req, res) {
  try {
    const restaurants = await listRestaurants({ search: req.query.search });
    res.json(restaurants);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getRestaurantById(req, res) {
  try {
    const restaurant = await getRestaurantDetail(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    sendError(res, error);
  }
}
