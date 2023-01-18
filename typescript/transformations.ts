import { adjust } from "./adjust";
import { createEmptyBlock } from "./block";
import { Block } from "./types";

export const reduceSize = (block: Block, factor: number): Block => {
  const newBlockSize = block.size / factor;
  const newBlock = createEmptyBlock(newBlockSize);

  for (let y = 0; y < newBlockSize; y++) {
    for (let x = 0; x < newBlockSize; x++) {
      let sum = 0;

      for (let k = x * factor; k < (x + 1) * factor; k++) {
        for (let l = y * factor; l < (y + 1) * factor; l++) {
          sum += block.data[k][l];
        }
      }

      newBlock.data[x][y] = sum / (factor * factor);
    }
  }

  return newBlock;
};

const rotate = (block: Block, angle: 0 | 90 | 180 | 270): Block => {
  const newBlock = createEmptyBlock(block.size);

  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      let newX = x;
      let newY = y;

      if (angle === 90) {
        newX = y;
        newY = block.size - x - 1;
      } else if (angle === 180) {
        newX = block.size - x - 1;
        newY = block.size - y - 1;
      } else if (angle === 270) {
        newX = block.size - y - 1;
        newY = x;
      }

      newBlock.data[newX][newY] = block.data[x][y];
    }
  }
  return newBlock;
};

const flip = (block: Block, type: "horizontal" | "vertical"): Block => {
  const newBlock = createEmptyBlock(block.size);

  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      let newX = x;
      let newY = y;

      if (type === "horizontal") {
        newX = block.size - x - 1;
      } else if (type === "vertical") {
        newY = block.size - y - 1;
      }

      newBlock.data[newX][newY] = block.data[x][y];
    }
  }
  return newBlock;
};

export const applyTransformation = (
  block: Block,
  flipType: "horizontal" | "vertical",
  rotateAngle: 0 | 90 | 180 | 270,
  contrast = 1.0,
  brightness = 0.0
): Block => {
  // apply affine transformations
  const newBlock = rotate(flip(block, flipType), rotateAngle);

  // adjust contrast and brightness
  adjust(newBlock, contrast, brightness);

  return newBlock;
};
