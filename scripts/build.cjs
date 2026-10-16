const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const esbuild = require("esbuild");
const JSZip = require("jszip");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");
const output = path.resolve(root, "../grandma-garden-dist");
const archive = path.resolve(root, "../grandma-garden-yandex-2026-10-16.zip");
const cropIds = [
  "radish",
  "carrot",
  "cabbage",
  "tomato",
  "pumpkin",
  "watermelon",
  "magic",
  "cucumber",
  "beet",
  "pepper",
  "corn",
  "broccoli",
  "zucchini",
];
const assets = [
  ...["tv", "sofa", "fridge", "kitchen", "renovation", "terrace"].map(
    (id) => `assets/home/${id}.png`,
  ),
  ...cropIds.map((id) => `assets/crops/${id}.png`),
  ...["weed", "fertilizer", "hose-1", "hose-2", "hose-3", "hose-4"].map(
    (id) => `assets/tools/${id}.png`,
  ),
  ...["auto-water", "market-basket", "garden-bed"].map(
    (id) => `assets/upgrades/${id}.png`,
  ),
  ...["garden-courtyard", "garden-bed-layer", "granny-hose-long"].map(
    (id) => `assets/art/${id}.png`,
  ),
  ...["coin", "seed", "settings", "collection", "upgrades", "home"].map(
    (id) => `assets/ui/${id}.svg`,
  ),
];
async function main() {
  const files = new Map();
  const [html, js, css] = await Promise.all(
    ["index.html", "game.js", "styles.css"].map((f) =>
      fs.readFile(path.join(root, f), "utf8"),
    ),
  );
  for (const match of (html + "\n" + js + "\n" + css).matchAll(
    /assets\/[\w/-]+\.(?:png|svg|jpg)/g,
  ))
    assert.ok(assets.includes(match[0]), `Unlisted runtime asset: ${match[0]}`);
  assert.ok(
    html.includes('src="/sdk.js"'),
    "Production must use the platform SDK, not a local stub",
  );
  const compiled = await esbuild.transform(js, {
    loader: "js",
    target: "es2017",
    minify: true,
    charset: "utf8",
    legalComments: "none",
    define: { __GARDEN_DEV__: "false" },
  });
  new vm.Script(compiled.code);
  const compactCss = await esbuild.transform(css, {
    loader: "css",
    minify: true,
    charset: "utf8",
    legalComments: "none",
  });
  files.set("index.html", Buffer.from(html));
  files.set("game.js", Buffer.from(compiled.code));
  files.set("styles.css", Buffer.from(compactCss.code));
  let originalAssetBytes = 0;
  for (const name of assets) {
    let data = await fs.readFile(path.join(root, name));
    originalAssetBytes += data.length;
    if (name.endsWith(".png")) {
      // Lossless recompression only: no resizing, palette reduction or art changes.
      const compact = await sharp(data)
        .keepIccProfile()
        .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
        .toBuffer();
      if (compact.length < data.length) data = compact;
    }
    files.set(name, data);
  }
  assert.equal(
    [...files.keys()].filter((f) => f.endsWith("index.html")).length,
    1,
  );
  const unpacked = [...files.values()].reduce(
    (sum, data) => sum + data.length,
    0,
  );
  assert.ok(unpacked <= 100000000, "Yandex limit is 100 MB uncompressed");
  await fs.mkdir(output, { recursive: true });
  const zip = new JSZip();
  for (const [name, data] of files) {
    assert.match(name, /^[a-zA-Z0-9_./-]+$/);
    const destination = path.resolve(output, name);
    assert.ok(destination.startsWith(output + path.sep));
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, data);
    zip.file(name, data, { date: new Date("2026-10-16T00:00:00Z") });
  }
  const zipped = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  const verified = await JSZip.loadAsync(zipped, { checkCRC32: true });
  assert.ok(verified.file("index.html"));
  assert.equal(
    Object.values(verified.files).filter((f) => !f.dir).length,
    files.size,
  );
  await fs.writeFile(archive, zipped);
  const report = {
    archive,
    files: files.size,
    uncompressedBytes: unpacked,
    zipBytes: zipped.length,
    originalAssetBytes,
    packagedAssetBytes: [...files]
      .filter(([n]) => n.startsWith("assets/"))
      .reduce((sum, [, b]) => sum + b.length, 0),
    sourceJsBytes: Buffer.byteLength(js),
    releaseJsBytes: Buffer.byteLength(compiled.code),
    sourceCssBytes: Buffer.byteLength(css),
    releaseCssBytes: Buffer.byteLength(compactCss.code),
    sdkPath: "/sdk.js",
    localAdDemo: false,
    entries: [...files.keys()],
  };
  await fs.writeFile(
    path.resolve(root, "../grandma-garden-build-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
