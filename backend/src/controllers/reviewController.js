import { deleteReview, upsertReview } from "../data/store.js";

export async function saveReview(req, res) {
  const { restaurantId, rating, comment } = req.body;
  if (!restaurantId || !rating || !comment) {
    return res.status(400).json({ message: "Restaurant, rating, and comment are required" });
  }
  const review = await upsertReview(req.user, {
    restaurantId,
    rating: Number(rating),
    comment
  });
  res.status(201).json(review);
}

export async function removeReview(req, res) {
  await deleteReview(req.user.id, req.params.restaurantId);
  res.status(204).send();
}
