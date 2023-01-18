import { adjust, getContrastAndBrightness } from "./adjust";
import { clone, createEmptyBlock } from "./block";
import { DOMAIN_BLOCK_SIZE, RANGE_BLOCK_SIZE } from "./constants";
import { applyTransformation, reduceSize } from "./transformations";
import { Block, Variant, VariantWithContrastAndBrightness } from "./types";

export const generateAllVariants = (img: Block): Variant[] => {
  const variants: Variant[] = [];
  for (let k = 0; k < img.size; k += RANGE_BLOCK_SIZE) {
    for (let l = 0; l < img.size; l += RANGE_BLOCK_SIZE) {
      // extract the range block at position (k, l)
      let rangeBlock = createEmptyBlock(RANGE_BLOCK_SIZE);
      for (let x = 0; x < RANGE_BLOCK_SIZE; x++) {
        for (let y = 0; y < RANGE_BLOCK_SIZE; y++) {
          rangeBlock.data[x][y] = img.data[k + x][l + y];
        }
      }

      // reduce it to the domain block's size
      rangeBlock = reduceSize(rangeBlock, RANGE_BLOCK_SIZE / DOMAIN_BLOCK_SIZE);

      // apply all possible affine transformations
      for (let flipType of ["horizontal", "vertical"] as const) {
        for (let rotateAngle of [0, 90, 180, 270] as const) {
          // console.log("before", rangeBlock.data);
          const variant = applyTransformation(
            rangeBlock,
            flipType,
            rotateAngle
          );
          // console.log("after", variant.data);

          variants.push({
            x: k,
            y: l,
            flipType,
            rotateAngle,
            transformedBlock: variant,
          });
        }
      }
    }
  }

  console.log(variants.slice(0, 10).map((v) => v.transformedBlock.data));
  return variants;
};

export const findBestTransformation = (
  domainBlock: Block,
  variants: Variant[]
): VariantWithContrastAndBrightness => {
  let bestVariant: VariantWithContrastAndBrightness = {
    ...variants[0],
    contrast: 1,
    brightness: 0,
  };
  let bestMSE = Infinity;

  for (const variant of variants) {
    let variantBlockClone = clone(variant.transformedBlock);
    // console.log({
    //   variantBlockClone: variantBlockClone.data.toString(),
    //   variant: variant.transformedBlock.data.toString(),
    // });
    const { contrast, brightness } = getContrastAndBrightness(
      domainBlock,
      variantBlockClone
    );

    adjust(variantBlockClone, contrast, brightness);

    // // add contrast
    // mapBlock(variantBlockClone, (pixel) => pixel * contrast);

    // // add brightness
    // mapBlock(variantBlockClone, (pixel) => pixel + brightness);

    let mse = 0;
    for (let x = 0; x < DOMAIN_BLOCK_SIZE; x++) {
      for (let y = 0; y < DOMAIN_BLOCK_SIZE; y++) {
        mse += Math.pow(
          domainBlock.data[x][y] - variantBlockClone.data[x][y],
          2
        );
      }
    }

    if (mse < bestMSE) {
      bestMSE = mse;
      bestVariant = { ...variant, contrast, brightness };
    }
  }

  return bestVariant;
};
