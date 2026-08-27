export type Spaceport = {
  id: string;
  name: string;
  shortName: string;
  operator: string;
  country: string;
  lng: number;
  lat: number;
  rockets: string[];
  description: string;
  wikiUrl: string;
};

export const SPACEPORTS: Spaceport[] = [
  {
    id: "ksc",
    name: "Kennedy Space Center (LC-39A/B)",
    shortName: "NASA KSC",
    operator: "NASA / SpaceX",
    country: "United States",
    lng: -80.604,
    lat: 28.608,
    rockets: ["Saturn V", "Space Shuttle", "Falcon 9", "Falcon Heavy", "SLS (Artemis)"],
    description: "Iconic launch site for Apollo 11 moon landing, Space Shuttle fleet, and Artemis missions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kennedy_Space_Center",
  },
  {
    id: "ccafs",
    name: "Cape Canaveral Space Force Station",
    shortName: "Cape Canaveral",
    operator: "US Space Force / ULA / SpaceX",
    country: "United States",
    lng: -80.577,
    lat: 28.488,
    rockets: ["Falcon 9", "Vulcan Centaur", "Atlas V", "Delta IV Heavy"],
    description: "Primary orbital launch site for US commercial, defense, and planetary exploration missions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Cape_Canaveral_Space_Force_Station",
  },
  {
    id: "starbase",
    name: "Starbase (Boca Chica)",
    shortName: "Starbase",
    operator: "SpaceX",
    country: "United States",
    lng: -97.156,
    lat: 25.997,
    rockets: ["Starship", "Super Heavy"],
    description: "Dedicated manufacturing and orbital launch site for the fully reusable Starship rocket.",
    wikiUrl: "https://en.wikipedia.org/wiki/SpaceX_Starbase",
  },
  {
    id: "vandenberg",
    name: "Vandenberg Space Force Base",
    shortName: "Vandenberg",
    operator: "US Space Force / SpaceX / ULA",
    country: "United States",
    lng: -120.61,
    lat: 34.632,
    rockets: ["Falcon 9", "Atlas V", "Minotaur", "Firefly Alpha"],
    description: "West Coast launch site enabling polar and retrograde orbital inclinations.",
    wikiUrl: "https://en.wikipedia.org/wiki/Vandenberg_Space_Force_Base",
  },
  {
    id: "sriharikota",
    name: "Satish Dhawan Space Centre (SDSC SHAR)",
    shortName: "ISRO Sriharikota",
    operator: "ISRO (Indian Space Research Organisation)",
    country: "India",
    lng: 80.23,
    lat: 13.72,
    rockets: ["PSLV", "GSLV", "LVM3 (Chandrayaan/Gaganyaan)", "SSLV"],
    description: "India's premier spaceport on the Bay of Bengal, home to Chandrayaan, Mangalyaan, and Gaganyaan.",
    wikiUrl: "https://en.wikipedia.org/wiki/Satish_Dhawan_Space_Centre",
  },
  {
    id: "kourou",
    name: "Guiana Space Centre (CSG)",
    shortName: "ESA Kourou",
    operator: "ESA / CNES / Arianespace",
    country: "French Guiana (France)",
    lng: -52.768,
    lat: 5.239,
    rockets: ["Ariane 6", "Vega-C", "Ariane 5 (James Webb Telescope)"],
    description: "Equatorial spaceport near 5°N latitude providing maximum Earth rotational assist for geostationary launches.",
    wikiUrl: "https://en.wikipedia.org/wiki/Guiana_Space_Centre",
  },
  {
    id: "baikonur",
    name: "Baikonur Cosmodrome",
    shortName: "Baikonur",
    operator: "Roscosmos",
    country: "Kazakhstan",
    lng: 63.305,
    lat: 45.965,
    rockets: ["Soyuz-2", "Proton-M", "Vostok (Gagarin 1961)", "Sputnik"],
    description: "The world's first and largest operational space launch facility; launched Sputnik 1 and Yuri Gagarin.",
    wikiUrl: "https://en.wikipedia.org/wiki/Baikonur_Cosmodrome",
  },
  {
    id: "tanegashima",
    name: "Tanegashima Space Center (TNSC)",
    shortName: "JAXA Tanegashima",
    operator: "JAXA",
    country: "Japan",
    lng: 130.97,
    lat: 30.4,
    rockets: ["H3", "H-IIA", "H-IIB"],
    description: "Japan's scenic oceanic spaceport located on the southern island of Tanegashima.",
    wikiUrl: "https://en.wikipedia.org/wiki/Tanegashima_Space_Center",
  },
  {
    id: "mahia",
    name: "Rocket Lab Launch Complex 1",
    shortName: "Rocket Lab Mahia",
    operator: "Rocket Lab",
    country: "New Zealand",
    lng: 177.865,
    lat: -39.261,
    rockets: ["Electron", "Suborbital HASTE"],
    description: "The world's first private orbital launch site, located on the Mahia Peninsula of New Zealand.",
    wikiUrl: "https://en.wikipedia.org/wiki/Rocket_Lab_Launch_Complex_1",
  },
  {
    id: "wenchang",
    name: "Wenchang Space Launch Site",
    shortName: "Wenchang",
    operator: "CNSA",
    country: "China",
    lng: 110.95,
    lat: 19.614,
    rockets: ["Long March 5", "Long March 7", "Long March 8"],
    description: "China's southern coastal spaceport on Hainan Island for heavy lunar probes and Tiangong station modules.",
    wikiUrl: "https://en.wikipedia.org/wiki/Wenchang_Space_Launch_Site",
  },
  {
    id: "esrange",
    name: "Esrange Space Center",
    shortName: "Esrange Kiruna",
    operator: "Swedish Space Corporation",
    country: "Sweden",
    lng: 21.107,
    lat: 67.893,
    rockets: ["Sounding rockets", "Suborbital research", "Small orbital"],
    description: "Arctic spaceport in northern Sweden specialized in aurora research, microgravity, and orbital missions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Esrange",
  },
  {
    id: "andoya",
    name: "Andøya Spaceport",
    shortName: "Andøya",
    operator: "Andøya Space",
    country: "Norway",
    lng: 16.012,
    lat: 69.294,
    rockets: ["Spectrum (Isar Aerospace)", "Sounding rockets"],
    description: "Norwegian Arctic island launch facility supporting European small-satellite orbital flights.",
    wikiUrl: "https://en.wikipedia.org/wiki/And%C3%B8ya_Space",
  },
];

export function spaceportsCollection(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: SPACEPORTS.map((s) => ({
      type: "Feature",
      properties: {
        id: s.id,
        name: s.name,
        shortName: s.shortName,
        operator: s.operator,
        country: s.country,
      },
      geometry: {
        type: "Point",
        coordinates: [s.lng, s.lat],
      },
    })),
  };
}
