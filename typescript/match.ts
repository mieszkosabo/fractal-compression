import { Block, Match, Variant } from "./domain";

export const findBestMatchForDomainBlock = (
  domainBlock: Block,
  variants: Variant[]
): Match => {
  let bestDifference = Infinity;
  let bestMatch: Match = {
    coordinates: { x: 0, y: 0 },
    transformType: { type: "identity" },
    brightness: 0,
  };

  for (const variant of variants) {
    const { difference, brightness } = calculateDifference(
      domainBlock,
      variant.block
    );

    if (difference < bestDifference) {
      bestDifference = difference;
      bestMatch = {
        coordinates: variant.block.coordinates,
        transformType: variant.transformType,
        brightness,
      };
    }
  }

  return bestMatch;
};

export const CONTRAST = 0.75 * 256;

function calculateDifference(
  domainBlock: Block,
  rangeBlock: Block
): { difference: number; brightness: number } {
  let difference = 0;
  const brightness = averageBrightness(domainBlock, rangeBlock);

  for (let i = 0; i < domainBlock.size; i++) {
    for (let j = 0; j < domainBlock.size; j++) {
      const domainPixel = domainBlock.data[i][j];
      const rangePixel = rangeBlock.data[i][j];
      const adjustedRangePixel = ((CONTRAST * rangePixel) >> 8) + brightness;

      difference += Math.abs(domainPixel - adjustedRangePixel) ** 2;
    }
  }

  return { difference, brightness };
}

function averageBrightness(domainBlock: Block, rangeBlock: Block): number {
  let brightness = 0;

  for (let i = 0; i < domainBlock.size; i++) {
    for (let j = 0; j < domainBlock.size; j++) {
      brightness +=
        (domainBlock.data[i][j] - CONTRAST * rangeBlock.data[i][j]) >> 8;
    }
  }

  return Math.round(brightness / (domainBlock.size * domainBlock.size));
}
