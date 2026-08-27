/** Curated oceanic wave flow lines and bathymetric ripple coordinates. */

export type OceanWaveGroup = {
  id: string;
  name: string;
  lines: [number, number][][];
};

export const OCEAN_WAVES: [number, number][][] = [
  // North Atlantic Drift / Gulf Stream ripples
  [
    [-70, 25],
    [-55, 32],
    [-40, 38],
    [-25, 45],
    [-15, 52],
  ],
  [
    [-68, 28],
    [-53, 35],
    [-38, 41],
    [-23, 48],
    [-13, 55],
  ],
  [
    [-66, 31],
    [-51, 38],
    [-36, 44],
    [-21, 51],
    [-11, 58],
  ],
  // South Atlantic Equatorial & Benguela Current ripples
  [
    [-30, -5],
    [-20, -10],
    [-10, -18],
    [0, -28],
    [10, -35],
  ],
  [
    [-28, -2],
    [-18, -7],
    [-8, -15],
    [2, -25],
    [12, -32],
  ],
  // North Pacific Current / Kuroshio ripples
  [
    [145, 28],
    [160, 34],
    [178, 38],
    [-165, 40],
    [-145, 42],
    [-130, 38],
  ],
  [
    [148, 31],
    [163, 37],
    [-179, 41],
    [-162, 43],
    [-142, 45],
    [-128, 41],
  ],
  [
    [151, 34],
    [166, 40],
    [-176, 44],
    [-159, 46],
    [-139, 48],
    [-126, 44],
  ],
  // South Pacific Humboldt & Polynesian Swells
  [
    [-140, -15],
    [-125, -20],
    [-110, -26],
    [-95, -32],
    [-80, -38],
  ],
  [
    [-138, -12],
    [-123, -17],
    [-108, -23],
    [-93, -29],
    [-78, -35],
  ],
  // Indian Ocean Monsoonal Gyre & Agulhas Current ripples
  [
    [55, 5],
    [68, 0],
    [80, -6],
    [92, -14],
    [105, -22],
  ],
  [
    [58, 8],
    [71, 3],
    [83, -3],
    [95, -11],
    [108, -19],
  ],
  [
    [61, 11],
    [74, 6],
    [86, 0],
    [98, -8],
    [111, -16],
  ],
  // Southern Ocean Antarctic Circumpolar Wave Arcs
  [
    [-160, -56],
    [-110, -58],
    [-60, -57],
    [-10, -56],
    [40, -55],
    [90, -57],
    [140, -58],
    [-170, -56],
  ],
  [
    [-155, -52],
    [-105, -54],
    [-55, -53],
    [-5, -52],
    [45, -51],
    [95, -53],
    [145, -54],
    [-165, -52],
  ],
];

export function oceanWavesCollection(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: OCEAN_WAVES.map((line, idx) => ({
      type: "Feature",
      properties: {
        id: `wave-${idx}`,
      },
      geometry: {
        type: "LineString",
        coordinates: line,
      },
    })),
  };
}
