import sharp from "sharp";
import path from "path";

async function main() {
  const src = path.join(process.cwd(), "public", "ambassador-logo.png");
  const image = sharp(src);
  const meta = await image.metadata();
  const width = meta.width || 314;
  const height = meta.height || 210;
  const emblemHeight = Math.min(height, Math.round(width * 0.52));

  const emblem = await sharp(src)
    .extract({ left: 0, top: 0, width, height: emblemHeight })
    .png()
    .toBuffer();

  const square = 512;
  const padded = await sharp(emblem)
    .resize({
      width: Math.round(square * 0.78),
      height: Math.round(square * 0.78),
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: Math.round(square * 0.11),
      bottom: Math.round(square * 0.11),
      left: Math.round(square * 0.11),
      right: Math.round(square * 0.11),
      background: { r: 20, g: 16, b: 9, alpha: 255 },
    })
    .png()
    .toBuffer();

  const appDir = path.join(process.cwd(), "src", "app");
  const publicDir = path.join(process.cwd(), "public");

  await sharp(padded).resize(192, 192).png().toFile(path.join(appDir, "icon.png"));
  await sharp(padded).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
  await sharp(padded).resize(192, 192).png().toFile(path.join(publicDir, "icon.png"));
  await sharp(padded).resize(180, 180).png().toFile(path.join(publicDir, "apple-icon.png"));

  console.log("Wrote icon.png and apple-icon.png");
}

main();
