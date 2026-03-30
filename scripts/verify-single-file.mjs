import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const targets = [
  path.join(root, "dist", "classmates.html"),
  path.join(root, "index.html"),
];

const checks = [
  { label: "external script tag", pattern: /<script\b[^>]*\bsrc\s*=/i },
  { label: "external stylesheet tag", pattern: /<link\b[^>]*\bhref\s*=/i },
  { label: "remote CSS url()", pattern: /url\(\s*['"]?https?:\/\//i },
  { label: "remote image source", pattern: /<img\b[^>]*\bsrc\s*=\s*['"]https?:\/\//i },
  { label: "Google Fonts", pattern: /fonts\.googleapis\.com/i },
  { label: "Google static fonts", pattern: /fonts\.gstatic\.com/i },
  { label: "Cloudflare CDN", pattern: /cdnjs\.cloudflare\.com/i },
];

for (const target of targets) {
  const html = await readFile(target, "utf8");
  for (const check of checks) {
    if (check.pattern.test(html)) {
      throw new Error(`Offline verification failed for ${path.relative(root, target)}: found ${check.label}.`);
    }
  }
}

console.log("Verified offline single-file bundle.");
