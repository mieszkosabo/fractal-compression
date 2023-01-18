import { createEmptyBlock } from "./block";
import { DOMAIN_BLOCK_SIZE } from "./constants";
import { Block, Transformation } from "./types";
import { findBestTransformation, generateAllVariants } from "./variants";

export const compress = (img: Block): Transformation[][] => {
  const transformations: Transformation[][] = [];
  const variants = generateAllVariants(img);

  for (let k = 0; k < img.size; k += DOMAIN_BLOCK_SIZE) {
    transformations.push([]);
    for (let l = 0; l < img.size; l += DOMAIN_BLOCK_SIZE) {
      // extract the domain block at position (k, l)
      let domainBlock = createEmptyBlock(DOMAIN_BLOCK_SIZE);
      for (let x = 0; x < DOMAIN_BLOCK_SIZE; x++) {
        for (let y = 0; y < DOMAIN_BLOCK_SIZE; y++) {
          domainBlock.data[x][y] = img.data[k + x][l + y];
        }
      }

      // find the best transformation
      const bestVariant = findBestTransformation(domainBlock, variants);
      transformations[k / DOMAIN_BLOCK_SIZE].push({
        x: bestVariant.x,
        y: bestVariant.y,
        flipType: bestVariant.flipType,
        rotateAngle: bestVariant.rotateAngle,
        contrast: bestVariant.contrast,
        brightness: bestVariant.brightness,
      });
    }
  }

  return transformations;
};
