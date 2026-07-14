import Review from "../models/Review.js";
import { dbState } from "./db.js";

export async function ensureDatabaseIndexes() {
  if (!dbState.isMongoConnected) return;

  const obsoleteReviewIndex = "userId_1_restaurantId_1";
  const exists = await Review.collection.indexExists(obsoleteReviewIndex);
  if (exists) {
    await Review.collection.dropIndex(obsoleteReviewIndex);
    console.log(`Dropped obsolete index: reviews.${obsoleteReviewIndex}`);
  }

  await Review.syncIndexes();
}
