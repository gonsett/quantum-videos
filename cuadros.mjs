// node cuadros.mjs <Composicion> <carpeta> f1 f2 ... : varios cuadros con UN solo bundle, reducidos a 360 px de ancho
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const [comp, dir, ...fr] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp });
for (const f of fr) {
  await renderStill({ serveUrl, composition, frame: Number(f), output: path.resolve(dir, `f-${f}.jpeg`), imageFormat: "jpeg", scale: 1 / 3, jpegQuality: 80 });
  process.stdout.write(f + " ");
}
