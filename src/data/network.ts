export type RegionId = "zurich" | "lucerne" | "europe" | "global";

export type Region = {
  id: RegionId;
  lat: number;
  lng: number;
  /** Angular radius (degrees) of the highlighted area on the globe. */
  radius: number;
  index: string;
};

export const regions: Region[] = [
  { id: "zurich", lat: 47.3769, lng: 8.5417, radius: 2.2, index: "01" },
  { id: "lucerne", lat: 47.0502, lng: 8.3093, radius: 2.2, index: "02" },
  { id: "europe", lat: 50, lng: 10, radius: 22, index: "03" },
  { id: "global", lat: 20, lng: 0, radius: 90, index: "04" },
];
