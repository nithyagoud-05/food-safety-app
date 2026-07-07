import Restaurant from "../models/Restaurant.js";
import { dbState } from "../config/db.js";

const imageBase = "https://images.unsplash.com";

const demoRestaurants = [
  {
    name: "Green Spoon Kitchen",
    image: `${imageBase}/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80`,
    address: "12 100 Feet Road, Indiranagar",
    city: "Bengaluru",
    cuisine: "Healthy Indian",
    description: "Ingredient-forward kitchen with clear allergen labels and balanced Indian plates.",
    ingredients: ["Foxtail Millet", "Paneer", "Spinach", "Sesame", "Lemon", "Cashew", "Coconut"],
    allergens: ["Dairy", "Sesame", "Nuts"],
    safetyScore: 92,
    averageRating: 4.7,
    totalReviews: 0,
    latitude: 12.9719,
    longitude: 77.6412,
    menuItems: [
      {
        dishName: "Millet Power Bowl",
        description: "Foxtail millet, grilled paneer, greens, and lemon herb dressing.",
        ingredients: ["Foxtail Millet", "Paneer", "Spinach", "Sesame", "Lemon"],
        allergens: ["Dairy", "Sesame"]
      },
      {
        dishName: "Cashew Curry Plate",
        description: "Vegetable curry with cashew cream and steamed rice.",
        ingredients: ["Cashew", "Coconut", "Carrot", "Beans", "Rice"],
        allergens: ["Nuts"]
      }
    ]
  },
  {
    name: "Casa Basil",
    image: `${imageBase}/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80`,
    address: "8 Road No. 12, Banjara Hills",
    city: "Hyderabad",
    cuisine: "Italian",
    description: "Modern Italian restaurant with detailed sauce and nut disclosures.",
    ingredients: ["Wheat Pasta", "Basil", "Parmesan", "Pine Nuts", "Olive Oil"],
    allergens: ["Gluten", "Dairy", "Nuts"],
    safetyScore: 84,
    averageRating: 4.4,
    totalReviews: 0,
    latitude: 17.4126,
    longitude: 78.4483,
    menuItems: [
      {
        dishName: "Pesto Penne",
        description: "Penne tossed with basil pesto, parmesan, and toasted pine nuts.",
        ingredients: ["Wheat Pasta", "Basil", "Parmesan", "Pine Nuts", "Olive Oil"],
        allergens: ["Gluten", "Dairy", "Nuts"]
      }
    ]
  },
  {
    name: "Tandoor Trust",
    image: `${imageBase}/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80`,
    address: "21 Lane 5, Koregaon Park",
    city: "Pune",
    cuisine: "North Indian",
    description: "North Indian dining with visible safety history and ingredient declarations.",
    ingredients: ["Tomato", "Butter", "Cream", "Cashew", "Chicken"],
    allergens: ["Dairy", "Nuts"],
    safetyScore: 71,
    averageRating: 4.1,
    totalReviews: 0,
    latitude: 18.5362,
    longitude: 73.8938,
    menuItems: [
      {
        dishName: "Butter Chicken",
        description: "Classic tomato gravy with butter, cream, cashew, and tandoori chicken.",
        ingredients: ["Tomato", "Butter", "Cream", "Cashew", "Chicken"],
        allergens: ["Dairy", "Nuts"]
      }
    ]
  },
  {
    name: "Miso Mindful",
    image: `${imageBase}/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80`,
    address: "44 Lattice Bridge Road, Adyar",
    city: "Chennai",
    cuisine: "Asian",
    description: "Asian bowls and ramen with strong soy, gluten, and broth transparency.",
    ingredients: ["Soy", "Wheat Noodles", "Tofu", "Mushroom", "Miso"],
    allergens: ["Soy", "Gluten"],
    safetyScore: 88,
    averageRating: 4.6,
    totalReviews: 0,
    latitude: 13.0067,
    longitude: 80.2574,
    menuItems: [
      {
        dishName: "Tofu Ramen",
        description: "Miso broth with tofu, noodles, mushrooms, and scallions.",
        ingredients: ["Soy", "Wheat Noodles", "Tofu", "Mushroom", "Miso"],
        allergens: ["Soy", "Gluten"]
      }
    ]
  }
];

export async function seedDemoRestaurants() {
  if (!dbState.isMongoConnected) return;

  const count = await Restaurant.estimatedDocumentCount();
  if (count > 0) return;

  await Restaurant.insertMany(demoRestaurants);
  console.log("Demo restaurants seeded.");
}
