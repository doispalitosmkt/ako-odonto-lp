import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(projectRoot, "dist");

await mkdir(outputDirectory, { recursive: true });
for (const name of ["index.html", "assets", "css", "js"]) {
  await cp(path.join(projectRoot, name), path.join(outputDirectory, name), {
    recursive: true,
    force: true,
  });
}

console.log("LP estática preparada em dist/.");
