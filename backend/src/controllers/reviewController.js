import { deleteReview, upsertReview } from "../data/store.js";
import { sendError } from "../utils/errors.js";

export async function saveReview(req, res) {
  try {
    const { restaurantId, rating, comment } = req.body;
    if (!restaurantId || !rating || !comment) {
      return res.status(400).json({ message: "Restaurant, rating, and comment are required" });
    }
    const review = await upsertReview(req.user, {
      restaurantId,
      rating: Number(rating),
      title: req.body.title,
      comment,
      visitDate: req.body.visitDate
    });
    res.status(201).json(review);
  } catch (error) {
    sendError(res, error);
  }
}

export async function removeReview(req, res) {
  try {
    await deleteReview(req.user.id, req.params.restaurantId);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
