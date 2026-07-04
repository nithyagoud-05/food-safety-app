import bcrypt from "bcryptjs";
import { dbState } from "../config/db.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Dish from "../models/Dish.js";
import Review from "../models/Review.js";
import Report from "../models/Report.js";

const imageBase = "https://images.unsplash.com";

const memory = {
  users: [],
  restaurants: [
    {
      id: "r1",
      name: "Green Spoon Kitchen",
      image: `${imageBase}/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80`,
      location: "Indiranagar, Bengaluru",
      area: "Indiranagar",
      cuisine: "Healthy Indian",
      rating: 4.7,
      safetyScore: 92,
      complaintResolution: 94,
      ingredientTransparency: 96
    },
    {
      id: "r2",
      name: "Casa Basil",
      image: `${imageBase}/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80`,
      location: "Banjara Hills, Hyderabad",
      area: "Banjara Hills",
      cuisine: "Italian",
      rating: 4.4,
      safetyScore: 84,
      complaintResolution: 78,
      ingredientTransparency: 90
    },
    {
      id: "r3",
      name: "Tandoor Trust",
      image: `${imageBase}/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80`,
      location: "Koregaon Park, Pune",
      area: "Koregaon Park",
      cuisine: "North Indian",
      rating: 4.1,
      safetyScore: 71,
      complaintResolution: 66,
      ingredientTransparency: 78
    },
    {
      id: "r4",
      name: "Miso Mindful",
      image: `${imageBase}/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80`,
      location: "Adyar, Chennai",
      area: "Adyar",
      cuisine: "Asian",
      rating: 4.6,
      safetyScore: 88,
      complaintResolution: 84,
      ingredientTransparency: 92
    }
  ],
  dishes: [
    {
      id: "d1",
      restaurantId: "r1",
      dishName: "Millet Power Bowl",
      description: "Foxtail millet, grilled paneer, greens, and lemon herb dressing.",
      ingredients: ["Foxtail Millet", "Paneer", "Spinach", "Sesame", "Lemon"],
      allergens: ["Dairy", "Sesame"]
    },
    {
      id: "d2",
      restaurantId: "r1",
      dishName: "Cashew Curry Plate",
      description: "Vegetable curry with cashew cream and steamed rice.",
      ingredients: ["Cashew", "Coconut", "Carrot", "Beans", "Rice"],
      allergens: ["Nuts"]
    },
    {
      id: "d3",
      restaurantId: "r2",
      dishName: "Pesto Penne",
      description: "Penne tossed with basil pesto, parmesan, and toasted pine nuts.",
      ingredients: ["Wheat Pasta", "Basil", "Parmesan", "Pine Nuts", "Olive Oil"],
      allergens: ["Gluten", "Dairy", "Nuts"]
    },
    {
      id: "d4",
      restaurantId: "r3",
      dishName: "Butter Chicken",
      description: "Classic tomato gravy with butter, cream, cashew, and tandoori chicken.",
      ingredients: ["Tomato", "Butter", "Cream", "Cashew", "Chicken"],
      allergens: ["Dairy", "Nuts"]
    },
    {
      id: "d5",
      restaurantId: "r4",
      dishName: "Tofu Ramen",
      description: "Miso broth with tofu, noodles, mushrooms, and scallions.",
      ingredients: ["Soy", "Wheat Noodles", "Tofu", "Mushroom", "Miso"],
      allergens: ["Soy", "Gluten"]
    }
  ],
  reviews: [
    { id: "v1", userId: "seed", userName: "Aarav", restaurantId: "r1", rating: 5, comment: "Clear allergen labels and careful staff." },
    { id: "v2", userId: "seed2", userName: "Meera", restaurantId: "r2", rating: 4, comment: "Good transparency, but I had to ask twice about nuts." },
    { id: "v3", userId: "seed3", userName: "Dev", restaurantId: "r3", rating: 3, comment: "Tasty food, ingredient notes could be more detailed." }
  ],
  reports: []
};

function publicUser(user) {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  const { password, ...safeUser } = doc;
  return { ...safeUser, id: doc.id || doc._id?.toString() };
}

function normalizeDoc(doc) {
  const value = doc.toObject ? doc.toObject() : doc;
  return { ...value, id: value.id || value._id?.toString() };
}

function safetyBadge(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Moderate";
  return "Warning";
}

function withScore(restaurant, reviews = []) {
  const relevant = reviews.filter((review) => review.restaurantId?.toString() === restaurant.id?.toString());
  const averageRating = relevant.length
    ? relevant.reduce((sum, review) => sum + Number(review.rating), 0) / relevant.length
    : Number(restaurant.rating || 0);
  const reviewScore = Math.round((averageRating / 5) * 100);
  const score = Math.round(
    reviewScore * 0.4 +
      Number(restaurant.complaintResolution || 75) * 0.3 +
      Number(restaurant.ingredientTransparency || 75) * 0.3
  );

  return {
    ...restaurant,
    rating: Number(averageRating.toFixed(1)),
    reviewCount: relevant.length,
    safetyScore: score,
    badge: safetyBadge(score)
  };
}

export async function createUser(payload) {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  if (dbState.isMongoConnected) {
    const exists = await User.findOne({ email: payload.email.toLowerCase() });
    if (exists) throw new Error("Email already registered");
    const user = await User.create({ ...payload, email: payload.email.toLowerCase(), password: hashedPassword });
    return publicUser(user);
  }

  const exists = memory.users.find((user) => user.email === payload.email.toLowerCase());
  if (exists) throw new Error("Email already registered");
  const user = {
    id: `u${Date.now()}`,
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: hashedPassword,
    allergies: payload.allergies || [],
    preferences: payload.preferences || [],
    savedRestaurants: []
  };
  memory.users.push(user);
  return publicUser(user);
}

export async function authenticateUser(email, password) {
  const user = dbState.isMongoConnected
    ? await User.findOne({ email: email.toLowerCase() })
    : memory.users.find((item) => item.email === email.toLowerCase());
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? publicUser(user) : null;
}

export async function findUserById(id) {
  if (dbState.isMongoConnected) {
    const user = await User.findById(id).select("-password");
    return user ? publicUser(user) : null;
  }
  return publicUser(memory.users.find((user) => user.id === id));
}

export async function updateUserProfile(id, payload) {
  if (dbState.isMongoConnected) {
    const user = await User.findByIdAndUpdate(
      id,
      { allergies: payload.allergies || [], preferences: payload.preferences || [] },
      { new: true }
    ).select("-password");
    return publicUser(user);
  }
  const user = memory.users.find((item) => item.id === id);
  if (!user) return null;
  user.allergies = payload.allergies || [];
  user.preferences = payload.preferences || [];
  return publicUser(user);
}

export async function listRestaurants(query = {}) {
  if (dbState.isMongoConnected) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, "i") },
        { cuisine: new RegExp(query.search, "i") },
        { area: new RegExp(query.search, "i") }
      ];
    }
    const [restaurants, reviews] = await Promise.all([Restaurant.find(filter), Review.find()]);
    return restaurants.map(normalizeDoc).map((restaurant) => withScore(restaurant, reviews.map(normalizeDoc)));
  }

  const search = query.search?.toLowerCase() || "";
  return memory.restaurants
    .filter(
      (restaurant) =>
        !search ||
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.cuisine.toLowerCase().includes(search) ||
        restaurant.area.toLowerCase().includes(search)
    )
    .map((restaurant) => withScore(restaurant, memory.reviews));
}

export async function getRestaurantDetail(id) {
  if (dbState.isMongoConnected) {
    const [restaurant, dishes, reviews, reports] = await Promise.all([
      Restaurant.findById(id),
      Dish.find({ restaurantId: id }),
      Review.find({ restaurantId: id }).populate("userId", "name"),
      Report.find({ restaurantId: id }).sort({ createdAt: -1 })
    ]);
    if (!restaurant) return null;
    const normalizedReviews = reviews.map((review) => ({
      ...normalizeDoc(review),
      userName: review.userId?.name || "Verified user"
    }));
    return {
      ...withScore(normalizeDoc(restaurant), normalizedReviews),
      dishes: dishes.map(normalizeDoc),
      reviews: normalizedReviews,
      safetyHistory: reports.map(normalizeDoc)
    };
  }

  const restaurant = memory.restaurants.find((item) => item.id === id);
  if (!restaurant) return null;
  return {
    ...withScore(restaurant, memory.reviews),
    dishes: memory.dishes.filter((dish) => dish.restaurantId === id),
    reviews: memory.reviews.filter((review) => review.restaurantId === id),
    safetyHistory: memory.reports.filter((report) => report.restaurantId === id)
  };
}

export async function upsertReview(user, payload) {
  if (dbState.isMongoConnected) {
    const review = await Review.findOneAndUpdate(
      { userId: user.id, restaurantId: payload.restaurantId },
      { rating: payload.rating, comment: payload.comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return normalizeDoc(review);
  }

  const existing = memory.reviews.find(
    (review) => review.userId === user.id && review.restaurantId === payload.restaurantId
  );
  if (existing) {
    existing.rating = payload.rating;
    existing.comment = payload.comment;
    return existing;
  }
  const review = {
    id: `v${Date.now()}`,
    userId: user.id,
    userName: user.name,
    restaurantId: payload.restaurantId,
    rating: Number(payload.rating),
    comment: payload.comment
  };
  memory.reviews.push(review);
  return review;
}

export async function deleteReview(userId, restaurantId) {
  if (dbState.isMongoConnected) {
    await Review.deleteOne({ userId, restaurantId });
    return;
  }
  const index = memory.reviews.findIndex((review) => review.userId === userId && review.restaurantId === restaurantId);
  if (index >= 0) memory.reviews.splice(index, 1);
}

export async function createReport(user, payload) {
  if (dbState.isMongoConnected) {
    const report = await Report.create({ ...payload, userId: user.id });
    return normalizeDoc(report);
  }

  const report = {
    id: `p${Date.now()}`,
    restaurantId: payload.restaurantId,
    userId: user.id,
    category: payload.category,
    description: payload.description,
    image: payload.image || "",
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  memory.reports.unshift(report);
  return report;
}

export async function listReports() {
  if (dbState.isMongoConnected) {
    const reports = await Report.find().populate("restaurantId", "name location").sort({ createdAt: -1 });
    return reports.map(normalizeDoc);
  }
  return memory.reports;
}
