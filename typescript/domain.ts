export type Image = {
  r: Block;
  g: Block;
  b: Block;

  width: number;
  height: number;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type Block = {
  size: number;
  data: number[][];
  coordinates: Coordinates;
};

export type TransformFn = (image: Block) => Block;

export type TransformFunctions = [
  { type: "identity" },
  { type: "flip"; flipAxis: "x" | "y" },
  { type: "rotate"; angle: 90 | 180 | 270 }
];

export type TransformFunction = TransformFunctions[number];

export type Variant = {
  block: Block;
  transformType: TransformFunction;
};

export type Match = {
  coordinates: Coordinates;
  transformType: TransformFunction;
  brightness: number;
};
