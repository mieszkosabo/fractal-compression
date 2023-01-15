import { writeFile, writeFileSync } from "fs";
import { Block, Match } from "./domain";
import { loadImage } from "./image";
import { findBestMatchForDomainBlock } from "./match";
import {
  generateAllVariants,
  splitImageToDomainBlocks,
  splitImageToRangeBlocks,
} from "./transformFunctions";

export const compress = async (path: string, outPath: string) => {
  const img = await loadImage(path);
  const { r, g, b, width, height } = img;

  const compressed = JSON.stringify({
    r: compressChannel(r),
    g: compressChannel(g),
    b: compressChannel(b),
    width,
    height,
  });

  // write compressed image to file
  writeFileSync(outPath, compressed);
};

function compressChannel(channel: Block): Match[] {
  // divide input into domain blocks (4x4)
  const domainBlocks = splitImageToDomainBlocks(channel);

  // divide input into bigger, range blocks (8x8)
  const rangeBlocks = splitImageToRangeBlocks(channel);

  // generate all possible variants of transformed range blocks
  const variants = rangeBlocks.flat().flatMap(generateAllVariants);

  // for each domain block find the best match in the variants
  const matches = domainBlocks
    .flat()
    .map((domainBlock) => findBestMatchForDomainBlock(domainBlock, variants));

  return matches;
}
