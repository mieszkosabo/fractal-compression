import { compress } from "./compress";
import { decompress } from "./decompress";
import { Image } from "./domain";
import { loadImage, saveImage } from "./image";
import { reduceSize } from "./transformFunctions";

(async () => {
  // compress("../monkey.gif", "../monkey.json").then(() => {
  //   console.log("🙏🏻 done");
  // });

  // console.log("yop");

  // const img = await loadImage("../monkey.gif");
  // const smallerImg: Image = {
  //   r: reduceSize(img.r, 2),
  //   g: reduceSize(img.g, 2),
  //   b: reduceSize(img.b, 2),

  //   width: img.width / 2,
  //   height: img.height / 2,
  // };

  // await saveImage("../monkey2.gif", smallerImg);

  decompress("../monkey.json", "../monkey2.gif").then(() => {
    console.log("🙏🏻 done");
  });
})();
