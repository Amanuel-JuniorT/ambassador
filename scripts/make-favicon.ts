import { writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";

async function knockoutAndWhiten(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const a = data[i + 3];
    if (a < 40 || (r < 110 && g < 95)) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 0;
    }
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

function pngToIco(png: Buffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, png]);
}

async function main() {
  const src = path.join(process.cwd(), "public", "ambassador-logo.png");
  const meta = await sharp(src).metadata();
  const width = meta.width || 314;
  const emblemHeight = Math.min(meta.height || 210, Math.round(width * 0.52));

  const cropped = await sharp(src)
    .extract({ left: 0, top: 0, width, height: emblemHeight })
    .png()
    .toBuffer();

  const mark = await knockoutAndWhiten(cropped);
  const filled = await sharp(mark)
    .trim()
    .resize(32, 32, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
  const icon32 = await knockoutAndWhiten(filled);

  const large = await sharp(mark)
    .trim()
    .resize(180, 180, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
  const apple = await knockoutAndWhiten(large);

  const ico = pngToIco(icon32);
  const appDir = path.join(process.cwd(), "src", "app");
  const publicDir = path.join(process.cwd(), "public");

  writeFileSync(path.join(publicDir, "favicon.ico"), ico);
  writeFileSync(path.join(appDir, "favicon.ico"), ico);
  await sharp(icon32).png().toFile(path.join(publicDir, "icon.png"));
  await sharp(apple).png().toFile(path.join(publicDir, "apple-icon.png"));

  console.log("Wrote favicon.ico, icon.png, apple-icon.png");
}

main();
