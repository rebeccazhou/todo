import { copyFile, mkdir, rm } from "node:fs/promises";

const files = ["index.html", "styles.css", "app.js"];

await rm("dist", { force: true, recursive: true });
await mkdir("dist", { recursive: true });

await Promise.all(files.map((file) => copyFile(file, `dist/${file}`)));
