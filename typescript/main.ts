import { compress } from "./compress";
import { decompress } from "./decompress";
import { getGrayscaleImage, saveBlockToImage } from "./image";

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
  let block = await getGrayscaleImage("../assets/monkey.gif");
  console.log("size", block.size);

  console.info("Compressing image...");
  const transformations = compress(block);

  console.info("Decompressing image...");
  block = decompress(transformations);

  console.info("Saving decompressed image...");
  await saveBlockToImage("reduced.gif", block);
})();
