import fs from "fs/promises";
import path from "path";
import "dotenv/config";
import User from "../server/models/User.js";
import { faker } from "@faker-js/faker";
import { connection } from "../server/db.js";
import Analysis from "../server/models/Analysis.js";

// generated using GPT
const personalities = [
  {
    description: "Outgoing and adventurous",
    hobbies: ["hiking", "photography", "traveling"],
    animals: ["dogs"],
    foods: ["pizza", "sushi"],
  },
  {
    description: "Introverted bookworm",
    hobbies: ["reading", "writing", "poetry"],
    animals: ["cats"],
    foods: ["pasta", "salad"],
  },
  {
    description: "Tech enthusiast and gamer",
    hobbies: ["gaming", "coding", "electronics"],
    animals: ["hamsters"],
    foods: ["burgers", "ramen"],
  },
  {
    description: "Fitness fanatic and health-conscious",
    hobbies: ["weightlifting", "running", "yoga"],
    animals: ["rabbits"],
    foods: ["smoothies", "quinoa"],
  },
  {
    description: "Creative artist and musician",
    hobbies: ["painting", "guitar", "sketching"],
    animals: ["birds"],
    foods: ["tacos", "pasta"],
  },
  {
    description: "Nature lover and environmentalist",
    hobbies: ["gardening", "camping", "bird-watching"],
    animals: ["owls"],
    foods: ["vegan burgers", "kale chips"],
  },
  {
    description: "Fashionista and social media influencer",
    hobbies: ["shopping", "blogging", "makeup"],
    animals: ["chinchillas"],
    foods: ["avocado toast", "bubble tea"],
  },
  {
    description: "Business-minded and ambitious",
    hobbies: ["networking", "public speaking", "reading business books"],
    animals: ["fish"],
    foods: ["steak", "sushi"],
  },
  {
    description: "Foodie and culinary enthusiast",
    hobbies: ["cooking", "baking", "trying new restaurants"],
    animals: ["pugs"],
    foods: ["dim sum", "gelato"],
  },
  {
    description: "Science nerd and curious explorer",
    hobbies: ["astronomy", "chemistry experiments", "puzzle solving"],
    animals: ["geckos"],
    foods: ["falafel", "ramen"],
  },
  {
    description: "Movie buff and TV series binge-watcher",
    hobbies: ["watching movies", "film critique", "script writing"],
    animals: ["guinea pigs"],
    foods: ["popcorn", "nachos"],
  },
  {
    description: "Spiritual and mindful",
    hobbies: ["meditation", "yoga", "crystal healing"],
    animals: ["turtles"],
    foods: ["tofu stir-fry", "acai bowls"],
  },
  {
    description: "Adrenaline junkie and thrill-seeker",
    hobbies: ["skydiving", "bungee jumping", "scuba diving"],
    animals: ["eagles"],
    foods: ["energy bars", "protein shakes"],
  },
  {
    description: "History buff and intellectual",
    hobbies: ["visiting museums", "reading historical texts", "debating"],
    animals: ["parrots"],
    foods: ["cheese platters", "wine"],
  },
  {
    description: "Musician and performer",
    hobbies: ["playing piano", "singing", "composing music"],
    animals: ["ferrets"],
    foods: ["ramen", "sushi"],
  },
  {
    description: "Laid-back and easygoing",
    hobbies: ["watching TV", "hanging out with friends", "relaxing"],
    animals: ["sloths"],
    foods: ["pizza", "burgers"],
  },
  {
    description: "Lover of fantasy and sci-fi",
    hobbies: ["writing fiction", "playing tabletop RPGs", "cosplay"],
    animals: ["dragons (in spirit)"],
    foods: ["spaghetti", "mead (or juice)"],
  },
  {
    description: "Traveler and cultural explorer",
    hobbies: ["backpacking", "learning languages", "photography"],
    animals: ["alpacas"],
    foods: ["street food", "pad thai"],
  },
  {
    description: "Urban dweller and city lover",
    hobbies: ["exploring cities", "attending concerts", "nightlife"],
    animals: ["pigeons"],
    foods: ["croissants", "espresso"],
  },
  {
    description: "Introverted gamer and coder",
    hobbies: ["programming", "gaming", "building computers"],
    animals: ["axolotls"],
    foods: ["pizza rolls", "ramen noodles"],
  },
  {
    description: "Philosopher and deep thinker",
    hobbies: ["debating philosophy", "reading classics", "meditation"],
    animals: ["owls"],
    foods: ["herbal teas", "organic salads"],
  },
  {
    description: "Social butterfly and extrovert",
    hobbies: ["attending parties", "dancing", "hosting events"],
    animals: ["parrots"],
    foods: ["cocktails", "sushi"],
  },
  {
    description: "DIY enthusiast and maker",
    hobbies: ["woodworking", "crafting", "home improvement"],
    animals: ["dogs"],
    foods: ["barbecue", "pasta"],
  },
  {
    description: "Competitive athlete",
    hobbies: ["soccer", "tennis", "swimming"],
    animals: ["cheetahs"],
    foods: ["protein bars", "grilled chicken"],
  },
  {
    description: "Humanitarian and activist",
    hobbies: ["volunteering", "organizing events", "campaigning for change"],
    animals: ["dolphins"],
    foods: ["vegan tacos", "smoothies"],
  },
  {
    description: "Craft beer and wine connoisseur",
    hobbies: ["brewing beer", "attending tastings", "wine tours"],
    animals: ["dogs"],
    foods: ["cheese plates", "charcuterie boards"],
  },
  {
    description: "Lover of classical arts and music",
    hobbies: ["attending operas", "playing violin", "painting"],
    animals: ["swans"],
    foods: ["fine wine", "cheese fondue"],
  },
  {
    description: "E-sports enthusiast and streamer",
    hobbies: ["streaming games", "competitive gaming", "content creation"],
    animals: ["cats"],
    foods: ["nachos", "energy drinks"],
  },
  {
    description: "Collector and archivist",
    hobbies: ["collecting vintage items", "attending auctions", "preserving antiques"],
    animals: ["cats"],
    foods: ["tea", "crumpets"],
  },
  {
    description: "Language enthusiast and polyglot",
    hobbies: ["learning new languages", "translation", "cultural exchange"],
    animals: ["parakeets"],
    foods: ["dumplings", "paella"],
  },
  {
    description: "Mystery lover and puzzle solver",
    hobbies: ["solving puzzles", "murder mysteries", "escape rooms"],
    animals: ["ravens"],
    foods: ["dark chocolate", "espresso"],
  },
  {
    description: "Gardener and plant enthusiast",
    hobbies: ["growing succulents", "landscaping", "urban farming"],
    animals: ["butterflies"],
    foods: ["fresh salads", "herbal teas"],
  },
  {
    description: "Minimalist and eco-conscious",
    hobbies: ["decluttering", "recycling", "sustainable living"],
    animals: ["foxes"],
    foods: ["grain bowls", "smoothies"],
  },
  {
    description: "Explorer of the great outdoors",
    hobbies: ["rock climbing", "kayaking", "camping"],
    animals: ["wolves"],
    foods: ["trail mix", "jerky"],
  },
  {
    description: "Educator and lifelong learner",
    hobbies: ["teaching", "attending workshops", "reading"],
    animals: ["hedgehogs"],
    foods: ["fruit salads", "whole grain toast"],
  },
  {
    description: "Movie director and film critic",
    hobbies: ["watching movies", "directing short films", "script writing"],
    animals: ["lizards"],
    foods: ["popcorn", "nachos"],
  },
];


async function generateMockUsers() {
  await User.deleteMany({
    username: { $regex: "^bot_" }
  });
  await Analysis.deleteMany();

  const defaultProfilePicturePath = path.join(process.cwd(), "/public/images/default-profile-picture.jpg");
  const defaultProfilePicture = await fs.readFile(defaultProfilePicturePath);
  const defaultProfilePictureBase64 = "data:image/jpeg;base64," + defaultProfilePicture.toString("base64");

  for (let i = 0; i < 50; i++) {
    const username = faker.internet.userName();
    const personality = personalities[i % personalities.length]; // Cycle through personality types

    const mockUser = {
      username: "bot_" + username,
      hash: "",
      sid: "",
      name: faker.person.firstName(),
      age: faker.number.int({ min: 18, max: 60 }),
      gender: faker.person.sex(),
      nationality: faker.location.country(),
      description: personality.description,
      hobbies: personality.hobbies.join(", "),
      animals: personality.animals.join(", "),
      foods: personality.foods.join(", "),
      profilePicture: defaultProfilePictureBase64,
      createdAt: Date.now(),
    };

    // Create user in database
    const user = await User.create(mockUser);

    if (!user) {
      console.error(`Error creating user: ${username}`);
    } else {
      console.log(`Successfully created user: ${username}`);
    }
  }
}

generateMockUsers()
  .then(() => {
    console.log("Mock users generated successfully.");
  })
  .catch((err) => {
    console.error("Error generating mock users:", err);
  }).finally(() => {
    connection.close();
  });
