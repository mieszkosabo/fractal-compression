import { compress } from "./compress";
import { decompress } from "./decompress";
import { getImage, saveBlocksToImage } from "./image";
import { program } from "commander";
import { readFileSync, writeFileSync } from "fs";
import { Transformation } from "./types";

program
  .name("ts-fc")
  .description(
    "A simple fractal compression CLI programm written in TypeScript"
  )
  .version("0.0.1");

program
  .command("compress")
  .requiredOption("-i, --input <path>", "path to the input image")
  .requiredOption("-o, --output <path>", "path to the output image")
  .action(async (options) => {
    console.info("Loading image...");
    let { r, g, b } = await getImage(options.input);

    console.info("Compressing image...");
    const transformations = {
      r: compress(r),
      g: compress(g),
      b: compress(b),
    };

    writeFileSync(options.output, JSON.stringify(transformations));
    console.info("Done");
  });

program
  .command("decompress")
  .requiredOption(
    "-i, --input <path>",
    "path to the file with the transformations"
  )
  .requiredOption("-o, --output <path>", "path to the output image")
  .option("--iterations <number>", "number of iterations", "10")
  .action(async (options) => {
    console.info("Loading transformations file...");
    const transformations = JSON.parse(
      readFileSync(options.input, { encoding: "utf-8" })
    ) as {
      r: Transformation[][];
      g: Transformation[][];
      b: Transformation[][];
    };

    console.info(`Decompressing image with ${options.iterations}...`);
    const decompressed = {
      r: decompress(transformations.r, parseInt(options.iterations)),
      g: decompress(transformations.g, parseInt(options.iterations)),
      b: decompress(transformations.b, parseInt(options.iterations)),
    };

    console.info("Saving decompressed image...");
    await saveBlocksToImage(
      options.output,
      decompressed.r,
      decompressed.g,
      decompressed.b
    );
  });

program.parse(process.argv);
