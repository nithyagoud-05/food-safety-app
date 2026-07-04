import { getRestaurantDetail, listRestaurants } from "../data/store.js";

export async function getRestaurants(req, res) {
  const restaurants = await listRestaurants({ search: req.query.search });
  res.json(restaurants);
}

export async function getRestaurantById(req, res) {
  const restaurant = await getRestaurantDetail(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  res.json(restaurant);
}
