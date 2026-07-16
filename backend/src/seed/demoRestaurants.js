import Restaurant from "../models/Restaurant.js";
import { dbState } from "../config/db.js";

const imageBase = "https://images.unsplash.com";
const demoDisclaimer =
  "Demo menu information is used to demonstrate Annapurna's menu-transparency and allergen-warning features.";
const publicMetadataDisclaimer =
  "Public restaurant metadata only. Annapurna does not present this as an official menu, ingredient declaration, inspection result, or government verification.";
const placeholderImage = `${imageBase}/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80`;

function item(dishName, category, foodType, ingredients, allergens = [], extra = {}) {
  return {
    dishName,
    category,
    foodType,
    ingredients,
    allergens,
    dietaryMarkers: [foodType === "non_veg" ? "Non-Veg" : foodType === "egg" ? "Egg" : "Veg"],
    available: true,
    sourceType: extra.sourceType || "demo",
    dataDisclaimer: extra.dataDisclaimer || demoDisclaimer,
    description: extra.description || "",
    price: extra.price ?? null
  };
}

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
    safetyScore: 75,
    safetyDataStatus: "calculated",
    safetyBreakdown: {
      baseScore: 75,
      reviewSignal: 0,
      incidentPenalty: 0,
      unresolvedPenalty: 0,
      finalScore: 75,
      explanation: "Controlled demo profile with no live incident penalties. Calculated through Annapurna's neutral baseline strategy."
    },
    averageRating: 4.7,
    totalReviews: 0,
    latitude: 12.9719,
    longitude: 77.6412,
    dataProfile: "demo",
    dataDisclaimer: demoDisclaimer,
    menuItems: [
      item("Millet Power Bowl", "Veg Main Course", "veg", ["Foxtail Millet", "Paneer", "Spinach", "Sesame", "Lemon"], ["Dairy", "Sesame"], {
        description: "Foxtail millet, grilled paneer, greens, and lemon herb dressing."
      }),
      item("Cashew Curry Plate", "Veg Main Course", "veg", ["Cashew", "Coconut", "Carrot", "Beans", "Rice"], ["Nuts"]),
      item("Sprout Chaat Cups", "Veg Starters", "veg", ["Moong Sprouts", "Onion", "Tomato", "Lemon"], []),
      item("Grilled Chicken Millet Salad", "Salads", "non_veg", ["Chicken", "Millet", "Cucumber", "Yogurt"], ["Dairy"]),
      item("Jaggery Phirni", "Desserts", "veg", ["Milk", "Rice", "Jaggery", "Pistachio"], ["Dairy", "Nuts"]),
      item("Tulsi Lemon Cooler", "Beverages", "veg", ["Tulsi", "Lemon", "Honey"], [])
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
    safetyScore: 75,
    safetyDataStatus: "calculated",
    safetyBreakdown: {
      baseScore: 75,
      reviewSignal: 0,
      incidentPenalty: 0,
      unresolvedPenalty: 0,
      finalScore: 75,
      explanation: "Controlled demo profile with no live incident penalties. Calculated through Annapurna's neutral baseline strategy."
    },
    averageRating: 4.4,
    totalReviews: 0,
    latitude: 17.4126,
    longitude: 78.4483,
    dataProfile: "demo",
    dataDisclaimer: demoDisclaimer,
    menuItems: [
      item("Pesto Penne", "Veg Main Course", "veg", ["Wheat Pasta", "Basil", "Parmesan", "Pine Nuts", "Olive Oil"], ["Gluten", "Dairy", "Nuts"]),
      item("Bruschetta Trio", "Veg Starters", "veg", ["Wheat Bread", "Tomato", "Basil", "Olive Oil"], ["Gluten"]),
      item("Chicken Piccata", "Non-Veg Main Course", "non_veg", ["Chicken", "Lemon", "Butter", "Capers"], ["Dairy"]),
      item("Mushroom Risotto", "Rice", "veg", ["Arborio Rice", "Mushroom", "Parmesan", "Butter"], ["Dairy"]),
      item("Tiramisu Cup", "Desserts", "egg", ["Mascarpone", "Egg", "Coffee", "Wheat Biscuit"], ["Dairy", "Egg", "Gluten"]),
      item("Citrus Iced Tea", "Beverages", "veg", ["Tea", "Orange", "Lemon"], [])
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
    safetyScore: 75,
    safetyDataStatus: "calculated",
    safetyBreakdown: {
      baseScore: 75,
      reviewSignal: 2,
      incidentPenalty: 0,
      unresolvedPenalty: 0,
      finalScore: 75,
      explanation: "Controlled demo profile with no live incident penalties. Calculated through Annapurna's neutral baseline strategy."
    },
    averageRating: 4.1,
    totalReviews: 0,
    latitude: 18.5362,
    longitude: 73.8938,
    dataProfile: "demo",
    dataDisclaimer: demoDisclaimer,
    menuItems: [
      item("Butter Chicken", "Non-Veg Main Course", "non_veg", ["Tomato", "Butter", "Cream", "Cashew", "Chicken"], ["Dairy", "Nuts"]),
      item("Paneer Tikka", "Veg Starters", "veg", ["Paneer", "Yogurt", "Spices"], ["Dairy"]),
      item("Tandoori Chicken", "Non-Veg Starters", "non_veg", ["Chicken", "Yogurt", "Spices"], ["Dairy"]),
      item("Dal Makhani", "Veg Main Course", "veg", ["Black Lentils", "Butter", "Cream"], ["Dairy"]),
      item("Garlic Naan", "Breads", "veg", ["Wheat Flour", "Garlic", "Butter"], ["Gluten", "Dairy"]),
      item("Jeera Rice", "Rice", "veg", ["Rice", "Cumin", "Ghee"], ["Dairy"])
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
    safetyScore: 75,
    safetyDataStatus: "calculated",
    safetyBreakdown: {
      baseScore: 75,
      reviewSignal: 0,
      incidentPenalty: 0,
      unresolvedPenalty: 0,
      finalScore: 75,
      explanation: "Controlled demo profile with no live incident penalties. Calculated through Annapurna's neutral baseline strategy."
    },
    averageRating: 4.6,
    totalReviews: 0,
    latitude: 13.0067,
    longitude: 80.2574,
    dataProfile: "demo",
    dataDisclaimer: demoDisclaimer,
    menuItems: [
      item("Tofu Ramen", "Veg Main Course", "veg", ["Soy", "Wheat Noodles", "Tofu", "Mushroom", "Miso"], ["Soy", "Gluten"]),
      item("Chicken Gyoza", "Non-Veg Starters", "non_veg", ["Chicken", "Wheat Wrapper", "Soy"], ["Gluten", "Soy"]),
      item("Edamame Salt Bowl", "Veg Starters", "veg", ["Edamame", "Sea Salt"], ["Soy"]),
      item("Egg Fried Rice", "Rice", "egg", ["Rice", "Egg", "Soy", "Spring Onion"], ["Egg", "Soy"]),
      item("Mango Sticky Rice", "Desserts", "veg", ["Rice", "Coconut Milk", "Mango"], []),
      item("Matcha Cooler", "Beverages", "veg", ["Matcha", "Milk"], ["Dairy"])
    ]
  }
];

const hyderabadRestaurants = [
  ["Hotel Shadab", "High Court Road, Ghansi Bazaar", "Hyderabadi", "Public directory metadata", "https://www.google.com/search?q=Hotel+Shadab+Hyderabad"],
  ["Mehfil", "Narayanaguda", "Hyderabadi Biryani", "Public directory metadata", "https://www.google.com/search?q=Mehfil+Narayanaguda+Hyderabad"],
  ["Pista House", "Shah Ali Banda", "Hyderabadi, Bakery", "Official/public brand metadata", "https://www.pistahouse.in/"],
  ["Barbeque Nation", "Banjara Hills", "Barbecue, Buffet", "Official brand metadata", "https://www.barbequenation.com/"],
  ["Shah Ghouse Cafe", "Gachibowli", "Hyderabadi", "Public directory metadata", "https://www.google.com/search?q=Shah+Ghouse+Gachibowli"],
  ["Paradise Biryani", "Secunderabad", "Hyderabadi Biryani", "Official brand metadata", "https://www.paradisefoodcourt.in/"],
  ["Bawarchi", "RTC X Roads", "Hyderabadi Biryani", "Public directory metadata", "https://www.google.com/search?q=Bawarchi+RTC+X+Roads+Hyderabad"],
  ["Cafe Bahar", "Himayatnagar", "Hyderabadi, Irani Cafe", "Public directory metadata", "https://www.google.com/search?q=Cafe+Bahar+Himayatnagar"],
  ["Chutneys", "Banjara Hills", "South Indian", "Public directory metadata", "https://www.google.com/search?q=Chutneys+Banjara+Hills"],
  ["Absolute Barbecues", "Jubilee Hills", "Barbecue, Buffet", "Official brand metadata", "https://www.absolute-barbecues.com/"],
  ["Kissa Coffee House", "Jubilee Hills", "Cafe", "Public directory metadata", "https://www.google.com/search?q=Kissa+Coffee+House+Jubilee+Hills"],
  ["Daily Rituals", "Jubilee Hills", "Cafe, Continental", "Public directory metadata", "https://www.google.com/search?q=Daily+Rituals+Jubilee+Hills"],
  ["Babylon Bar And Kitchen", "Jubilee Hills", "Indian, Bar", "Public directory metadata", "https://www.google.com/search?q=Babylon+Bar+And+Kitchen+Jubilee+Hills"],
  ["Hiro Pan Asian Bar And Kitchen", "Jubilee Hills", "Pan Asian", "Public directory metadata", "https://www.google.com/search?q=Hiro+Pan+Asian+Bar+And+Kitchen+Hyderabad"],
  ["Naughty Kodi", "Jubilee Hills", "Telugu, Andhra", "Public directory metadata", "https://www.google.com/search?q=Naughty+Kodi+Jubilee+Hills"],
  ["Mirell", "Jubilee Hills", "Modern Indian", "Public directory metadata", "https://www.google.com/search?q=Mirell+Jubilee+Hills"],
  ["Illu The Restaurant", "Gachibowli", "Indian", "Public directory metadata", "https://www.google.com/search?q=Illu+The+Restaurant+Gachibowli"],
  ["Tatva", "Jubilee Hills", "Vegetarian, Global", "Public directory metadata", "https://www.google.com/search?q=Tatva+Jubilee+Hills"],
  ["A'La Liberty", "Banjara Hills", "Vegetarian, Multi-Cuisine", "Public directory metadata", "https://www.google.com/search?q=A%27La+Liberty+Banjara+Hills"]
].map(([name, area, cuisine, metadataSourceName, metadataSourceUrl]) => ({
  name,
  image: placeholderImage,
  address: area,
  city: "Hyderabad",
  cuisine,
  description: `${name} public metadata profile for Hyderabad-focused Annapurna discovery. Safety and menu information will become richer as Annapurna platform signals and owner declarations are added.`,
  ingredients: [],
  allergens: [],
  safetyScore: null,
  safetyDataStatus: "insufficient_data",
  safetyBreakdown: {
    baseScore: 75,
    reviewSignal: 0,
    incidentPenalty: 0,
    unresolvedPenalty: 0,
    finalScore: null,
    explanation: "Insufficient Annapurna platform signals are available for a calculated score."
  },
  averageRating: 0,
  totalReviews: 0,
  latitude: null,
  longitude: null,
  dataProfile: "public_metadata",
  dataDisclaimer: publicMetadataDisclaimer,
  metadataSourceName,
  metadataSourceUrl,
  menuItems: []
}));

async function upsertDemoRestaurant(restaurant) {
  const existing = await Restaurant.findOne({ name: restaurant.name });
  if (!existing) {
    await Restaurant.create({ ...restaurant, isActive: true, verified: false });
    return;
  }

  const hasOwnerDeclaredMenu = existing.menuItems?.some((menuItem) => menuItem.sourceType === "owner_declared");
  const update = {};
  for (const field of ["image", "address", "city", "cuisine", "description", "latitude", "longitude", "dataProfile", "dataDisclaimer"]) {
    if (existing[field] === undefined || existing[field] === null || existing[field] === "") update[field] = restaurant[field];
  }
  if (!existing.ingredients?.length && existing.dataProfile !== "owner_declared") update.ingredients = restaurant.ingredients;
  if (!existing.allergens?.length && existing.dataProfile !== "owner_declared") update.allergens = restaurant.allergens;
  if (!existing.menuItems?.length && !hasOwnerDeclaredMenu) update.menuItems = restaurant.menuItems;
  if (existing.isActive === undefined) update.isActive = true;
  if (Object.keys(update).length) await Restaurant.updateOne({ _id: existing._id }, { $set: update }, { runValidators: true });
}

async function insertMissingPublicRestaurant(restaurant) {
  const existing = await Restaurant.findOne({ name: restaurant.name });
  if (existing) {
    const update = {};
    if (!existing.metadataSourceName) update.metadataSourceName = restaurant.metadataSourceName;
    if (!existing.metadataSourceUrl) update.metadataSourceUrl = restaurant.metadataSourceUrl;
    if (!existing.dataDisclaimer) update.dataDisclaimer = restaurant.dataDisclaimer;
    if (existing.latitude === 17.385 && existing.longitude === 78.4867) {
      update.latitude = null;
      update.longitude = null;
    }
    const hasOnlySampleDish =
      existing.menuItems?.length === 1 && existing.menuItems[0]?.dishName === "Sample Transparency Dish";
    if (hasOnlySampleDish) update.menuItems = [];
    if (Object.keys(update).length) {
      await Restaurant.updateOne({ _id: existing._id }, { $set: update }, { runValidators: true });
    }
    return;
  }

  await Restaurant.updateOne(
    { name: restaurant.name },
    {
      $setOnInsert: {
        ...restaurant,
        isActive: true,
        verified: false
      }
    },
    { upsert: true, runValidators: true }
  );
}

export async function seedDemoRestaurants() {
  if (!dbState.isMongoConnected) return;

  for (const restaurant of demoRestaurants) {
    await upsertDemoRestaurant(restaurant);
  }

  for (const restaurant of hyderabadRestaurants) {
    await insertMissingPublicRestaurant(restaurant);
  }

  console.log("Restaurant seed sync complete.");
}
