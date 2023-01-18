import { Block } from "./types";

export function adjust(block: Block, contrast: number, brightness: number) {
  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      block.data[x][y] = Math.min(1, contrast * block.data[x][y] + brightness);
    }
  }
}

export const getContrastAndBrightness = (
  domainBlock: Block,
  rangeBlock: Block
): { contrast: number; brightness: number } => {
  const contrast = 0.75; // fixed contrast

  let brightness = 0;

  for (let x = 0; x < domainBlock.size; x++) {
    for (let y = 0; y < domainBlock.size; y++) {
      // console.log({
      //   domain: domainBlock.data[x][y],
      //   range: rangeBlock.data[x][y],
      // });
      brightness += domainBlock.data[x][y] - contrast * rangeBlock.data[x][y];
    }
  }

  // console.log(brightness);
  brightness = brightness / (domainBlock.size * domainBlock.size);

  // console.log("brightness", brightness);
  return {
    contrast,
    brightness,
  };
};
