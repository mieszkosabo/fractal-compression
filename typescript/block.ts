import { Block } from "./types";

export const createEmptyBlock = (size: number): Block => {
  const data = new Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = new Array(size).fill(0);
  }

  return {
    data,
    size,
  };
};

export const clone = (block: Block): Block => {
  const newBlock = createEmptyBlock(block.size);
  for (let x = 0; x < block.size; x++) {
    for (let y = 0; y < block.size; y++) {
      newBlock.data[x][y] = block.data[x][y];
    }
  }
  return newBlock;
};

export const extractBlock = (
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

export const createRandomBlock = (size: number): Block => {
  const block = createEmptyBlock(size);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      block.data[x][y] = Math.random();
    }
  }
  return block;
};
