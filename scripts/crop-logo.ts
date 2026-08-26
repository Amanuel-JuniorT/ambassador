import sharp from "sharp";
import path from "path";

async function cropAndKnockout(src: string, dest: string, height: number) {
  const { data, info } = await sharp(src)
    .extract({ left: 0, top: 0, width: 314, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 28 && g < 28 && b < 28) data[i + 3] = 0;
  }

  await sharp(data, { raw: info }).png().toFile(dest);
}

async function main() {
  const src = path.join(process.cwd(), "..", "ambassador-logo.png");
  await cropAndKnockout(src, path.join(process.cwd(), "public", "ambassador-logo.png"), 210);
  console.log("cropped HOTEL + stars, knocked out black background");
}

main();
