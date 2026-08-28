import sharp from "sharp";
import path from "path";

async function knockoutDark(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const a = data[i + 3];
    if (a < 40 || (r < 110 && g < 95)) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

async function writePng(buffer: Buffer, size: number, dest: string) {
  const resized = await sharp(buffer)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const cleaned = await knockoutDark(resized);
  await sharp(cleaned).png().toFile(dest);
}

async function main() {
  const src = path.join(process.cwd(), "public", "ambassador-logo.png");
  const meta = await sharp(src).metadata();
  const width = meta.width || 314;
  const height = meta.height || 210;
  const emblemHeight = Math.min(height, Math.round(width * 0.52));

  const cropped = await sharp(src)
    .extract({ left: 0, top: 0, width, height: emblemHeight })
    .png()
    .toBuffer();

  const transparent = await knockoutDark(cropped);
  const padded = await sharp(transparent)
    .trim()
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const appDir = path.join(process.cwd(), "src", "app");
  const publicDir = path.join(process.cwd(), "public");

  await writePng(padded, 192, path.join(appDir, "icon.png"));
  await writePng(padded, 180, path.join(appDir, "apple-icon.png"));
  await writePng(padded, 192, path.join(publicDir, "icon.png"));
  await writePng(padded, 180, path.join(publicDir, "apple-icon.png"));

  console.log("Wrote transparent icon.png and apple-icon.png");
}

main();
