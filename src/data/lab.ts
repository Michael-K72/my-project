export type ExperimentId =
  | "particles"
  | "shader"
  | "magnetic"
  | "typography"
  | "lighting"
  | "glass"
  | "data"
  | "cards"
  | "color";

export const experiments: { id: ExperimentId; index: string; tech: string }[] = [
  { id: "particles", index: "01", tech: "GLSL · Points" },
  { id: "shader", index: "02", tech: "ShaderMaterial" },
  { id: "magnetic", index: "03", tech: "Pointer physics" },
  { id: "typography", index: "04", tech: "Variable tracking" },
  { id: "lighting", index: "05", tech: "PointLight × 3" },
  { id: "glass", index: "06", tech: "MeshTransmission" },
  { id: "data", index: "07", tech: "SVG · Motion" },
  { id: "cards", index: "08", tech: "Drag · Tilt" },
  { id: "color", index: "09", tech: "CSS tokens" },
];
