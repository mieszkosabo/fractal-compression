# Fractal compression typescript implementation

This is a typescript implementation of the fractal compression algorithm.

This is a very simple implementation, purely for educational purposes. It is not optimized for performance, and actually
it doesn't even compress the image, as in it doesn't make it smaller, rather saves the transformations as a json file.
This json file can be later used to decompress the image.

But of course if we were to save the transformations to a binary file it would be smaller.

## Usage

Install dependencies:

```bash
yarn
```

```bash
yarn compress -i input.jpg -o compressed.json

yarn decompress -i compressed.json -o output.jpg
```

## TODOS

- [ ] Encode the transformations to a binary file & decode it
- [ ] Run the algorithm in parallel
