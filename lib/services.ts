export const serviceGroups = [
  {
    title: "Lash extensions",
    items: [
      ["Classics", 60, 50],
      ["Hybrids", 70, 60],
      ["Light Volume", 75, 65],
      ["Volume", 85, 75],
    ],
  },
  {
    title: "Customized sets",
    items: [
      ["Anime", 65, 55],
      ["Medusa", 65, 55],
      ["Wispy / Spiky", 65, 55],
      ["Foreign Fill", 60, 50],
      ["Mini Fill", 25, 15],
    ],
  },
  {
    title: "Refills & removal",
    items: [
      ["Classic Refill", 30, 20],
      ["Hybrid Refill", 40, 30],
      ["Light Volume Refill", 40, 30],
      ["Volume Refill", 45, 35],
      ["Removal", 20, 10],
    ],
  },
] as const;

export const services = serviceGroups.flatMap((group) =>
  group.items.map(([name, regularPrice, launchPrice]) => ({
    name,
    regularPrice,
    launchPrice,
  }))
);
