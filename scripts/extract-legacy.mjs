import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const legacyHtmlPath = path.join(root, "index.html");
const html = await readFile(legacyHtmlPath, "utf8");

const styleMatches = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)];
if (styleMatches.length < 2) {
  throw new Error("Expected at least two inline style blocks in index.html.");
}

const bodyMatch = html.match(
  /<body>([\s\S]*?)<script>([\s\S]*?)<\/script>\s*<\/body>\s*<\/html>\s*$/i,
);
if (!bodyMatch) {
  throw new Error("Could not extract body and inline app script from index.html.");
}

const [, bodyContent, appScript] = bodyMatch;

const outputDirs = [
  path.join(root, "src"),
  path.join(root, "src", "styles"),
  path.join(root, "src", "scripts"),
];

for (const dir of outputDirs) {
  await mkdir(dir, { recursive: true });
}

const outputs = [
  {
    file: path.join(root, "src", "styles", "fonts.css"),
    content: `${styleMatches[0][1].trim()}\n`,
  },
  {
    file: path.join(root, "src", "styles", "app.css"),
    content: `${styleMatches[1][1].trim()}\n`,
  },
  {
    file: path.join(root, "src", "body.html"),
    content: `${bodyContent.trim()}\n`,
  },
  {
    file: path.join(root, "src", "scripts", "app.js"),
    content: `${appScript.trim()}\n`,
  },
];

for (const output of outputs) {
  await writeFile(output.file, output.content, "utf8");
  console.log(`Wrote ${path.relative(root, output.file)}`);
}

