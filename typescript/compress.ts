import { extractBlock } from "./block";
import { DOMAIN_BLOCK_SIZE } from "./constants";
import { Block, Transformation } from "./types";
import { findBestTransformation, generateAllVariants } from "./variants";

export const compress = (img: Block): Transformation[][] => {
  const transformations: Transformation[][] = [];
  const variants = generateAllVariants(img);

  for (let k = 0; k < img.size; k += DOMAIN_BLOCK_SIZE) {
    transformations.push([]);
    for (let l = 0; l < img.size; l += DOMAIN_BLOCK_SIZE) {
      const domainBlock = extractBlock(img, k, l, DOMAIN_BLOCK_SIZE);
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
