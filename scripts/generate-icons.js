// One-off script: regenerate the app icon files from the real LATE(ish) logo
// (assets/logo.png) instead of the leftover default Expo template icon.
// Writes to the exact paths app.json already references — no config change
// needed, just a rebuild to pick them up. Run: node scripts/generate-icons.js
const path = require("path");
const Jimp = require("jimp-compact");

const ASSETS = path.join(__dirname, "..", "assets");
const BRAND_BG = 0x0c1426ff; // matches the splash screen background
const ADAPTIVE_BG = 0x0a0f1aff; // matches app.json's android.adaptiveIcon.backgroundColor
const TRANSPARENT = 0x00000000;

async function iconWithBg(logo, size, logoScale, bgColor, outPath) {
  const canvas = new Jimp(size, size, bgColor);
  const targetW = Math.round(size * logoScale);
  const scaled = logo.clone().resize(targetW, Jimp.AUTO);
  const x = Math.round((size - scaled.bitmap.width) / 2);
  const y = Math.round((size - scaled.bitmap.height) / 2);
  canvas.composite(scaled, x, y);
  await canvas.writeAsync(outPath);
  console.log("wrote", outPath);
}

async function main() {
  const logo = await Jimp.read(path.join(ASSETS, "logo.png"));

  // Main app icon (iOS + generic) — opaque brand background; iOS icons must
  // not carry an alpha channel.
  await iconWithBg(logo, 1024, 0.62, BRAND_BG, path.join(ASSETS, "icon.png"));

  // Android adaptive icon — background layer: solid fill.
  const bg = new Jimp(1024, 1024, ADAPTIVE_BG);
  await bg.writeAsync(path.join(ASSETS, "android-icon-background.png"));

  // Android adaptive icon — foreground layer: logo only, transparent, sized
  // to the ~66% safe zone so the round/square mask doesn't clip it.
  const fgCanvas = new Jimp(1024, 1024, TRANSPARENT);
  const fgLogo = logo.clone().resize(Math.round(1024 * 0.5), Jimp.AUTO);
  fgCanvas.composite(
    fgLogo,
    Math.round((1024 - fgLogo.bitmap.width) / 2),
    Math.round((1024 - fgLogo.bitmap.height) / 2),
  );
  await fgCanvas.writeAsync(path.join(ASSETS, "android-icon-foreground.png"));

  // Android 13+ themed (monochrome) icon — same silhouette; the OS tints it.
  await fgCanvas
    .clone()
    .writeAsync(path.join(ASSETS, "android-icon-monochrome.png"));

  // Web favicon — same treatment as the main icon, smaller canvas.
  await iconWithBg(logo, 196, 0.62, BRAND_BG, path.join(ASSETS, "favicon.png"));

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
