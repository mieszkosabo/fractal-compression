import sharp from "sharp";
import { createEmptyBlock } from "./block";
import { Block } from "./types";

function bufferToMatrix(array: Buffer, width: number): number[][] {
  const matrix = createEmptyBlock(width);

  for (let i = 0; i < array.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    matrix.data[y][x] = array[i] / 255;
  }

  return matrix.data;
}

export const getGrayscaleImage = async (path: string): Promise<Block> => {
  const image = await sharp(path)
    .grayscale()
    .raw()
    .resize(256, 256)
    .toBuffer({ resolveWithObject: true });

  const matrix = bufferToMatrix(image.data, image.info.width);

  return {
    data: matrix,
    size: image.info.width,
  };
};

function bufferToRGB(buffer: Buffer): {
  r: Uint8Array;
  g: Uint8Array;
  b: Uint8Array;
} {
  const r = new Uint8Array(buffer.length / 3);
  const g = new Uint8Array(buffer.length / 3);
  const b = new Uint8Array(buffer.length / 3);

  for (let i = 0; i < buffer.length; i += 3) {
    r[i / 3] = buffer[i];
    g[i / 3] = buffer[i + 1];
    b[i / 3] = buffer[i + 2];
  }

  return { r, g, b };
}

export const getRGBImage = async (
  path: string
): Promise<{ r: Block; g: Block; b: Block }> => {
  const image = await sharp(path)
    .raw()
    .resize(256, 256)
    .toBuffer({ resolveWithObject: true });

  const { r, g, b } = bufferToRGB(image.data);
  const rMatrix = bufferToMatrix(Buffer.from(r), image.info.width);
  const gMatrix = bufferToMatrix(Buffer.from(g), image.info.width);
  const bMatrix = bufferToMatrix(Buffer.from(b), image.info.width);

  return {
    r: { data: rMatrix, size: image.info.width },
    g: { data: gMatrix, size: image.info.width },
    b: { data: bMatrix, size: image.info.width },
  };
};

export const saveRGBBlocksToImage = async (
  path: string,
  r: Block,
  g: Block,
  b: Block
): Promise<void> => {
  const buffer = Buffer.alloc(r.size * r.size * 3);
  for (let i = 0; i < r.size; i++) {
    for (let j = 0; j < r.size; j++) {
      buffer[i * r.size * 3 + j * 3] = r.data[i][j];
      buffer[i * r.size * 3 + j * 3 + 1] = g.data[i][j];
      buffer[i * r.size * 3 + j * 3 + 2] = b.data[i][j];
    }
  }

  await sharp(buffer, {
    raw: {
      width: r.size,
      height: r.size,
      channels: 3,
    },
  }).toFile(path);
};

export const saveBlockToImage = async (
  path: string,
  block: Block
): Promise<void> => {
  // we operate on values from 0 to 1 in this implementation, but sharp operates on values from 0 to 255
  const buffer = Buffer.from(block.data.flat().map((value) => value * 255));
  await sharp(buffer, {
    raw: {
      width: block.size,
      height: block.size,
      channels: 1,
    },
  }).toFile(path);
};
