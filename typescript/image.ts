import sharp from "sharp";

// functions for image loading and saving

import { Image } from "./domain";

export const loadImage = async (path: string): Promise<Image> => {
  const { data, info } = await sharp(path)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { r, g, b } = bufferToRGB(data);
  const rMatrix = uintArrayToMatrix(r, info.width);
  const gMatrix = uintArrayToMatrix(g, info.width);
  const bMatrix = uintArrayToMatrix(b, info.width);

  return {
    r: { data: rMatrix, size: info.width, coordinates: { x: 0, y: 0 } },
    g: { data: gMatrix, size: info.width, coordinates: { x: 0, y: 0 } },
    b: { data: bMatrix, size: info.width, coordinates: { x: 0, y: 0 } },
    width: info.width,
    height: info.height,
  };
};

export const saveImage = async (path: string, image: Image): Promise<void> => {
  const buffer = imageToBuffer(image);
  await sharp(buffer, {
    raw: {
      width: image.width,
      height: image.height,
      channels: 3,
    },
  }).toFile(path);
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

function uintArrayToMatrix(array: Uint8Array, width: number): number[][] {
  const matrix = new Array(width);
  for (let i = 0; i < width; i++) {
    matrix[i] = new Array(width);
  }

  for (let i = 0; i < array.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    matrix[x][y] = array[i];
  }

  return matrix;
}

function imageToBuffer(image: Image): Buffer {
  const buffer = Buffer.alloc(image.width * image.height * 3);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const offset = y * image.width + x;
      buffer[offset * 3] = image.r.data[x][y];
      buffer[offset * 3 + 1] = image.g.data[x][y];
      buffer[offset * 3 + 2] = image.b.data[x][y];
    }
  }

  return buffer;
}
