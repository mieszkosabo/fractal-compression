import sharp from "sharp";

type Block = {
  data: number[][];
  size: number;
};

function bufferToMatrix(array: Buffer, width: number): number[][] {
  const matrix = createEmptyBlock(width);

  for (let i = 0; i < array.length; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    matrix.data[y][x] = array[i] / 255;
  }

  return matrix.data;
}

const getGrayscaleImage = async (path: string): Promise<Block> => {
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

const getRGBImage = async (
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

const saveRGBBlocksToImage = async (
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

const saveBlockToImage = async (path: string, block: Block): Promise<void> => {
  const buffer = Buffer.from(block.data.flat().map((value) => value * 255));
  console.log(buffer);
  await sharp(buffer, {
    raw: {
      width: block.size,
      height: block.size,
      channels: 1,
    },
  }).toFile(path);
};

const createEmptyBlock = (size: number): Block => {
  const data = new Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = new Array(size).fill(0);
  }

  return {
    data,
    size,
  };
};

// transforms

const reduceSize = (block: Block, factor: number): Block => {
  const newBlockSize = block.size / factor;
  const newBlock = createEmptyBlock(newBlockSize);

  for (let y = 0; y < newBlockSize; y++) {
    for (let x = 0; x < newBlockSize; x++) {
      let sum = 0;

      for (let k = x * factor; k < (x + 1) * factor; k++) {
        for (let l = y * factor; l < (y + 1) * factor; l++) {
          sum += block.data[k][l];
        }
      }

      newBlock.data[x][y] = sum / (factor * factor);
    }
  }

  return newBlock;
};

const rotate = (block: Block, angle: 0 | 90 | 180 | 270): Block => {
  const newBlock = createEmptyBlock(block.size);

  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      let newX = x;
      let newY = y;

      if (angle === 90) {
        newX = y;
        newY = block.size - x - 1;
      } else if (angle === 180) {
        newX = block.size - x - 1;
        newY = block.size - y - 1;
      } else if (angle === 270) {
        newX = block.size - y - 1;
        newY = x;
      }

      newBlock.data[newX][newY] = block.data[x][y];
    }
  }
  return newBlock;
};

const flip = (block: Block, type: "horizontal" | "vertical"): Block => {
  const newBlock = createEmptyBlock(block.size);

  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      let newX = x;
      let newY = y;

      if (type === "horizontal") {
        newX = block.size - x - 1;
      } else if (type === "vertical") {
        newY = block.size - y - 1;
      }

      newBlock.data[newX][newY] = block.data[x][y];
    }
  }
  return newBlock;
};

const mapBlock = (block: Block, fn: (pixel: number) => number) => {
  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      block.data[x][y] *= fn(block.data[x][y]);
    }
  }
};

function adjust(block: Block, contrast: number, brightness: number) {
  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      block.data[x][y] = Math.min(1, contrast * block.data[x][y] + brightness);
    }
  }
}

const applyTransformation = (
  block: Block,
  flipType: "horizontal" | "vertical",
  rotateAngle: 0 | 90 | 180 | 270,
  contrast = 1.0,
  brightness = 0.0
): Block => {
  // apply affine transformations
  const newBlock = rotate(flip(block, flipType), rotateAngle);

  // adjust contrast and brightness
  adjust(newBlock, contrast, brightness);

  return newBlock;
};

// contrast and brightness

const getContrastAndBrightness = (
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
      brightness +=
        domainBlock.data[x][y] -
        (contrast * rangeBlock.data[x][y]) /
          (domainBlock.size * domainBlock.size);
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

// compression

const DOMAIN_BLOCK_SIZE = 4;
const RANGE_BLOCK_SIZE = 8;

type Variant = {
  x: number;
  y: number;
  flipType: "horizontal" | "vertical";
  rotateAngle: 0 | 90 | 180 | 270;
  transformedBlock: Block;
};

const generateAllVariants = (img: Block): Variant[] => {
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

const clone = (block: Block): Block => {
  const newBlock = createEmptyBlock(block.size);
  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      newBlock.data[x][y] = block.data[x][y];
    }
  }
  return newBlock;
};

type VariantWithContrastAndBrightness = Variant & {
  contrast: number;
  brightness: number;
};

const findBestTransformation = (
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

const extractBlock = (
  block: Block,
  x: number,
  y: number,
  size: number
): Block => {
  const newBlock = createEmptyBlock(size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newBlock.data[i][j] = block.data[x + i][y + j];
    }
  }
  return newBlock;
};

type Transformation = {
  x: number;
  y: number;
  flipType: "horizontal" | "vertical";
  rotateAngle: 0 | 90 | 180 | 270;
  contrast: number;
  brightness: number;
};

const compress = (img: Block): Transformation[][] => {
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

const ITERATIONS = 1;

const createRandomBlock = (size: number): Block => {
  const block = createEmptyBlock(size);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      block.data[x][y] = Math.random();
    }
  }
  return block;
};

const decompress = (transformations: Transformation[][]): Block => {
  const size = transformations.length * DOMAIN_BLOCK_SIZE;
  const currentImg = createRandomBlock(size);

  for (let i = 0; i < ITERATIONS; i++) {
    console.log("iteration", i);

    for (let k = 0; k < size; k += DOMAIN_BLOCK_SIZE) {
      for (let l = 0; l < size; l += DOMAIN_BLOCK_SIZE) {
        // apply transformation
        const { x, y, flipType, rotateAngle, contrast, brightness } =
          transformations[k / DOMAIN_BLOCK_SIZE][l / DOMAIN_BLOCK_SIZE];

        // console.log({ contrast, brightness });
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

        // console.log(transformed);

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

// (async () => {
//   console.info("Loading image...");
//   let { r, g, b } = await getRGBImage("../helena.jpg");

//   console.info("Compressing image...");
//   const transformations = {
//     r: compress(r),
//     g: compress(g),
//     b: compress(b),
//   };

//   console.info("Decompressing image...");
//   const decompressed = {
//     r: decompress(transformations.r),
//     g: decompress(transformations.g),
//     b: decompress(transformations.b),
//   };

//   console.info("Saving decompressed image...");
//   await saveRGBBlocksToImage(
//     "10-iter.jpg",
//     decompressed.r,
//     decompressed.g,
//     decompressed.b
//   );
// })();

(async () => {
  console.info("Loading image...");
  let block = await getGrayscaleImage("../monkey.gif");
  console.log("size", block.size);

  console.info("Compressing image...");
  const transformations = compress(block);

  console.info("Decompressing image...");
  block = decompress(transformations);

  console.info("Saving decompressed image...");
  await saveBlockToImage("reduced.gif", block);
})();
