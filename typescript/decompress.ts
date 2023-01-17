import { readFileSync } from "fs";
import { Block, Match } from "./domain";
import { saveImage } from "./image";
import { CONTRAST } from "./match";
import { applyTransform, createEmptyBlock } from "./transformFunctions";

export const decompress = async (path: string, outPath: string) => {
  const compressed = JSON.parse(readFileSync(path).toString()) as {
    r: Match[];
    g: Match[];
    b: Match[];
    width: number;
    height: number;
  };

  const { r, g, b, width, height } = compressed;

  const img = {
    r: decompressChannel(r, width, height),
    g: decompressChannel(g, width, height),
    b: decompressChannel(b, width, height),
    width,
    height,
  };

  await saveImage(outPath, img);
};

const ITERATIONS = 20;

function decompressChannel(
  matches: Match[],
  width: number,
  height: number
): Block {
  let to = createEmptyBlock(width, { x: 0, y: 0 });
  let from = createEmptyBlock(width, { x: 0, y: 0 });

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    processIteration(matches, to, from, width, height);
    const swap = to;
    to = from;
    from = swap;
  }

  return from;
}

function processIteration(
  matches: Match[],
  to: Block,
  from: Block,
  width: number,
  height: number
) {
  let i = 0;
  for (let toY = 0; toY < height; toY += 4) {
    for (let toX = 0; toX < width; toX += 4) {
      const {
        transformType,
        brightness,
        coordinates: { x, y },
      } = matches[i++];

      const subBlock = getSubBlock(from, x, y, 8);
      const block = applyTransform(transformType, subBlock);
      adjust(block, brightness);

      // write block to to
      for (let y = toY; y < toY + 4; y++) {
        for (let x = toX; x < toX + 4; x++) {
          to.data[y][x] = block.data[y - toY][x - toX];
        }
      }
    }
  }
}

function getSubBlock(block: Block, x: number, y: number, size: number): Block {
  const data: number[][] = [];
  for (let i = 0; i < size; i++) {
    data.push(block.data[y + i].slice(x, x + size));
  }

  return {
    data,
    size,
    coordinates: { x, y },
  };
}

function adjust(block: Block, brightness: number) {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      block.data[y][x] = ((CONTRAST * block.data[y][x]) >> 8) + brightness;
    }
  }
}
