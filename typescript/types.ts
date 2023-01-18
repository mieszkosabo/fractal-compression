export type Block = {
  data: number[][];
  size: number;
};

export type Variant = {
  x: number;
  y: number;
  flipType: "horizontal" | "vertical";
  rotateAngle: 0 | 90 | 180 | 270;
  transformedBlock: Block;
};

export type VariantWithContrastAndBrightness = Variant & {
  contrast: number;
  brightness: number;
};

export type Transformation = {
  x: number;
  y: number;
  flipType: "horizontal" | "vertical";
  rotateAngle: 0 | 90 | 180 | 270;
  contrast: number;
  brightness: number;
};
