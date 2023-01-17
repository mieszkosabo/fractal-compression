import {
  Block,
  Coordinates,
  Image,
  TransformFn,
  TransformFunction,
  Variant,
} from "./domain";

// reduces the 8 x 8 block to a 4 x 4 block
export const reduceSize = (block: Block, factor: number): Block => {
  const newBlockSize = block.size / factor;
  const newBlock = new Array(newBlockSize);
  for (let i = 0; i < newBlockSize; i++) {
    newBlock[i] = new Array(newBlockSize);
  }

  for (let i = 0; i < newBlockSize; i++) {
    for (let j = 0; j < newBlockSize; j++) {
      let mean = 0;

      for (let k = i * factor; k < (i + 1) * factor; k++) {
        for (let l = j * factor; l < (j + 1) * factor; l++) {
          mean += block.data[k][l];
        }
      }
      mean /= factor * factor;
      newBlock[i][j] = mean;
    }
  }

  return {
    data: newBlock,
    coordinates: {
      x: block.coordinates.x / factor,
      y: block.coordinates.y / factor,
    },
    size: newBlockSize,
  };
};

// splits the image into N x N blocks
export const splitImageToBlocks = (
  img: Block,
  blockSize: number
): Block[][] => {
  const size = img.size;
  const blocks: Block[][] = [];

  for (let i = 0; i < size; i += blockSize) {
    const row: Block[] = [];
    for (let j = 0; j < size; j += blockSize) {
      const block = new Array(blockSize);
      for (let k = 0; k < blockSize; k++) {
        block[k] = new Array(blockSize);
      }

      for (let k = 0; k < blockSize; k++) {
        for (let l = 0; l < blockSize; l++) {
          block[k][l] = img.data[i + k][j + l];
        }
      }

      row.push({
        data: block,
        size: blockSize,
        coordinates: {
          x: j,
          y: i,
        },
      });
    }
    blocks.push(row);
  }

  return blocks;
};

export const splitImageToDomainBlocks = (img: Block) =>
  splitImageToBlocks(img, 4);
export const splitImageToRangeBlocks = (img: Block) =>
  splitImageToBlocks(img, 8);

// merges NxN blocks into a single block
export const mergeBlocks = (blocks: Block[][], blockSize: number): Block => {
  const size = blocks.length * blockSize;
  const img = new Array(size);
  for (let i = 0; i < size; i++) {
    img[i] = new Array(size);
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const blockX = Math.floor(x / blockSize);
      const blockY = Math.floor(y / blockSize);
      const block = blocks[blockY][blockX];
      const blockXOffset = x % blockSize;
      const blockYOffset = y % blockSize;
      img[y][x] = block.data[blockYOffset][blockXOffset];
    }
  }

  return {
    data: img,
    size,
    coordinates: {
      x: 0,
      y: 0,
    },
  };
};

export const createEmptyBlock = (
  size: number,
  coordinates: Coordinates
): Block => {
  const block = new Array(size);
  for (let i = 0; i < size; i++) {
    block[i] = new Array(size);
  }

  return {
    data: block,
    size,
    coordinates,
  };
};

// transform functions

export const identity: TransformFn = (block) => block;

export const flipX: TransformFn = (block) => {
  const size = block.size;
  const newBlock = createEmptyBlock(size, block.coordinates);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newBlock.data[i][j] = block.data[i][size - j - 1];
    }
  }

  return newBlock;
};

export const flipY: TransformFn = (block) => {
  const size = block.size;
  const newBlock = createEmptyBlock(size, block.coordinates);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newBlock.data[i][j] = block.data[size - i - 1][j];
    }
  }

  return newBlock;
};

export const rotate90: TransformFn = (block) => {
  const size = block.size;
  const newBlock = createEmptyBlock(size, block.coordinates);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newBlock.data[i][j] = block.data[size - j - 1][i];
    }
  }

  return newBlock;
};

export const rotate180: TransformFn = (block) => {
  const size = block.size;
  const newBlock = createEmptyBlock(size, block.coordinates);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newBlock.data[i][j] = block.data[size - i - 1][size - j - 1];
    }
  }

  return newBlock;
};

export const rotate270: TransformFn = (block) => {
  const size = block.size;
  const newBlock = createEmptyBlock(size, block.coordinates);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newBlock.data[i][j] = block.data[j][size - i - 1];
    }
  }

  return newBlock;
};

export const generateAllVariants = (rangeBlock: Block): Variant[] => {
  const resized = reduceSize(rangeBlock, 2);
  return [
    {
      transformType: { type: "identity" },
      block: identity(resized),
    },
    {
      transformType: { type: "flip", flipAxis: "x" },
      block: flipX(resized),
    },
    {
      transformType: { type: "flip", flipAxis: "y" },
      block: flipY(resized),
    },
    {
      transformType: { type: "rotate", angle: 90 },
      block: rotate90(resized),
    },
    {
      transformType: { type: "rotate", angle: 180 },
      block: rotate180(resized),
    },
    {
      transformType: { type: "rotate", angle: 270 },
      block: rotate270(resized),
    },
  ];
};

export const applyTransform = (
  transformType: TransformFunction,
  rangeBlock: Block
): Block => {
  const resized = reduceSize(rangeBlock, 2);
  switch (transformType.type) {
    case "identity":
      return identity(resized);
    case "flip":
      return transformType.flipAxis === "x" ? flipX(resized) : flipY(resized);
    case "rotate":
      switch (transformType.angle) {
        case 90:
          return rotate90(resized);
        case 180:
          return rotate180(resized);
        case 270:
          return rotate270(resized);
      }
  }
};
