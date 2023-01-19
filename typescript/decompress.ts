import { createRandomBlock, extractBlock } from "./block";
import {
  DOMAIN_BLOCK_SIZE,
  DEFAULT_ITERATIONS,
  RANGE_BLOCK_SIZE,
} from "./constants";
import { applyTransformation, reduceSize } from "./transformations";
import { Block, Transformation } from "./types";

export const decompress = (
  transformations: Transformation[][],
  iterations = DEFAULT_ITERATIONS
): Block => {
  const size = transformations.length * DOMAIN_BLOCK_SIZE;
  const currentImg = createRandomBlock(size);

  for (let i = 0; i < iterations; i++) {
    for (let k = 0; k < size; k += DOMAIN_BLOCK_SIZE) {
      for (let l = 0; l < size; l += DOMAIN_BLOCK_SIZE) {
        const { x, y, flipType, rotateAngle, contrast, brightness } =
          transformations[k / DOMAIN_BLOCK_SIZE][l / DOMAIN_BLOCK_SIZE];

        let rangeBlock = extractBlock(currentImg, x, y, RANGE_BLOCK_SIZE);

        rangeBlock = reduceSize(
          rangeBlock,
          RANGE_BLOCK_SIZE / DOMAIN_BLOCK_SIZE
        );

        const transformed = applyTransformation(
          rangeBlock,
          flipType,
          rotateAngle,
          contrast,
          brightness
        );

        // write the transformed block to the image
        for (let x = 0; x < DOMAIN_BLOCK_SIZE; x++) {
          for (let y = 0; y < DOMAIN_BLOCK_SIZE; y++) {
            currentImg.data[k + x][l + y] = transformed.data[x][y];
          }
        }
      }
    }
  }

  return currentImg;
};
