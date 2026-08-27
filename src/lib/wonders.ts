export type WonderSpot = {
  name: string;
  category: "wonder" | "nature" | "space" | "deep" | "culture";
  tagline: string;
  lng: number;
  lat: number;
  zoom: number;
};

export const WONDERS: WonderSpot[] = [
  {
    name: "Great Pyramid of Giza",
    category: "wonder",
    tagline: "The oldest and only surviving Wonder of the Ancient World.",
    lng: 31.1342,
    lat: 29.9792,
    zoom: 5.5,
  },
  {
    name: "Mariana Trench (Challenger Deep)",
    category: "deep",
    tagline: "The deepest known oceanic trench on Earth (~10,994m below sea level).",
    lng: 142.2,
    lat: 11.35,
    zoom: 4.5,
  },
  {
    name: "Mount Everest Summit",
    category: "nature",
    tagline: "Earth's highest point above sea level (8,848.86m) in the Himalayas.",
    lng: 86.925,
    lat: 27.9881,
    zoom: 5.5,
  },
  {
    name: "Salar de Uyuni",
    category: "nature",
    tagline: "World's largest salt flat, forming a mirror after rainfall in Bolivia.",
    lng: -67.4891,
    lat: -20.1338,
    zoom: 5.0,
  },
  {
    name: "Svalbard Global Seed Vault",
    category: "deep",
    tagline: "Doomsday seed repository buried inside Arctic permafrost at 78°N.",
    lng: 15.4913,
    lat: 78.2379,
    zoom: 5.0,
  },
  {
    name: "Satish Dhawan Space Centre",
    category: "space",
    tagline: "India's gateway to the cosmos, launchpad for Chandrayaan & Aditya-L1.",
    lng: 80.2304,
    lat: 13.7199,
    zoom: 5.5,
  },
  {
    name: "Easter Island (Rapa Nui)",
    category: "wonder",
    tagline: "Remote volcanic Pacific island famous for nearly 1,000 monumental Moai statues.",
    lng: -109.3497,
    lat: -27.1127,
    zoom: 5.0,
  },
  {
    name: "Kourou Guiana Space Centre",
    category: "space",
    tagline: "Europe's equatorial spaceport, where the James Webb Space Telescope launched.",
    lng: -52.768,
    lat: 5.239,
    zoom: 5.2,
  },
  {
    name: "Machu Picchu",
    category: "culture",
    tagline: "15th-century Inca citadel situated on a mountain ridge in Peru.",
    lng: -72.545,
    lat: -13.1631,
    zoom: 5.5,
  },
  {
    name: "Victoria Falls",
    category: "nature",
    tagline: "The world's greatest sheet of falling water on the Zambezi River.",
    lng: 25.8572,
    lat: -17.9243,
    zoom: 5.2,
  },
  {
    name: "Shibuya Crossing, Tokyo",
    category: "culture",
    tagline: "The world's busiest pedestrian scramble crossing and pulse of Tokyo.",
    lng: 139.7016,
    lat: 35.658,
    zoom: 5.8,
  },
  {
    name: "Bermuda Triangle Center",
    category: "deep",
    tagline: "Legendary western North Atlantic region wrapped in maritime lore.",
    lng: -64.75,
    lat: 32.3,
    zoom: 4.8,
  },
  {
    name: "Atacama ALMA Observatory",
    category: "space",
    tagline: "Revolutionary radio telescope array perched 5,000m up in the driest desert.",
    lng: -67.7533,
    lat: -23.0234,
    zoom: 5.5,
  },
  {
    name: "Great Barrier Reef",
    category: "nature",
    tagline: "The planet's largest living coral reef structure, visible from space.",
    lng: 147.6992,
    lat: -18.2871,
    zoom: 4.8,
  },
  {
    name: "Reykjavik & Fagradalsfjall",
    category: "nature",
    tagline: "Icelandic land of fire, ice, active basalt fissures, and Northern Lights.",
    lng: -21.9426,
    lat: 64.1466,
    zoom: 5.2,
  },
];

export function getRandomWonder(): WonderSpot {
  const index = Math.floor(Math.random() * WONDERS.length);
  return WONDERS[index]!;
}
