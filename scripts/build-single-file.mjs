import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const sourceFiles = {
  template: path.join(root, "src", "template.html"),
  fonts: path.join(root, "src", "styles", "fonts.css"),
  styles: path.join(root, "src", "styles", "app.css"),
  body: path.join(root, "src", "body.html"),
  scripts: [
    path.join(root, "src", "scripts", "storage.js"),
    path.join(root, "src", "scripts", "domain", "settings.js"),
    path.join(root, "src", "scripts", "domain", "pupils.js"),
    path.join(root, "src", "scripts", "domain", "assignments.js"),
    path.join(root, "src", "scripts", "domain", "custom-quiz.js"),
    path.join(root, "src", "scripts", "domain", "attempts.js"),
    path.join(root, "src", "scripts", "platform", "app-state.js"),
    path.join(root, "src", "scripts", "teacher", "summary.js"),
    path.join(root, "src", "scripts", "teacher", "reports.js"),
    path.join(root, "src", "scripts", "teacher", "authoring.js"),
    path.join(root, "src", "scripts", "teacher", "tools.js"),
    path.join(root, "src", "scripts", "app.js"),
  ],
  logo: path.join(root, "src", "assets", "logo.jpg"),
  legacyLogo: path.join(root, "logo.jpg"),
  three: path.join(root, "node_modules", "three", "build", "three.min.js"),
};

async function readUtf8(filePath) {
  return readFile(filePath, "utf8");
}

async function readLogo() {
  try {
    return await readFile(sourceFiles.logo);
  } catch {
    return readFile(sourceFiles.legacyLogo);
  }
}

function injectLiteral(source, token, value) {
  return source.split(token).join(value);
}

function escapeInlineScript(source) {
  return source.replace(/<\/script/gi, "<\\/script");
}

const [template, fonts, styles, body, threeSource, logoBytes, ...scriptParts] =
  await Promise.all([
    readUtf8(sourceFiles.template),
    readUtf8(sourceFiles.fonts),
    readUtf8(sourceFiles.styles),
    readUtf8(sourceFiles.body),
    readUtf8(sourceFiles.three),
    readLogo(),
    ...sourceFiles.scripts.map(readUtf8),
  ]);

const logoDataUri = `data:image/jpeg;base64,${logoBytes.toString("base64")}`;
const appSource = escapeInlineScript(scriptParts.join("\n\n").trim());
const inlineThree = escapeInlineScript(threeSource.trim());

let html = template;
html = injectLiteral(html, "{{INLINE_FONTS}}", fonts.trim());
html = injectLiteral(html, "{{INLINE_STYLES}}", styles.trim());
html = injectLiteral(html, "{{BODY_CONTENT}}", body.trim());
html = injectLiteral(html, "{{INLINE_THREE}}", inlineThree);
html = injectLiteral(html, "{{INLINE_APP_SCRIPT}}", appSource);

html = html.replaceAll("logo.jpg", logoDataUri);
html = `${html.trim()}\n`;

const distDir = path.join(root, "dist");
const distFile = path.join(distDir, "classmates.html");
const rootFile = path.join(root, "index.html");

await mkdir(distDir, { recursive: true });
await writeFile(distFile, html, "utf8");
await writeFile(rootFile, html, "utf8");

console.log(`Built ${path.relative(root, distFile)}`);
console.log(`Built ${path.relative(root, rootFile)}`);
