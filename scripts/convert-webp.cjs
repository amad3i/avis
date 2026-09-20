const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "photo-candidates");
const OUT = path.join(__dirname, "..", "public", "images", "menu");

async function cropSquare(src, dest, cropX = 0, cropW = 0) {
  const img = sharp(path.join(SRC, src));
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  let left, top, size;
  if (cropW > 0) {
    const cropPx = Math.round(W * cropW);
    const cropLeft = Math.round(W * cropX);
    size = Math.min(cropPx, H);
    left = cropLeft + Math.round((cropPx - size) / 2);
    top = Math.round((H - size) / 2);
  } else {
    size = Math.min(W, H);
    left = Math.round((W - size) / 2);
    top = Math.round((H - size) / 2);
  }
  await img
    .extract({ left, top, width: size, height: size })
    .resize(900, 900)
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, dest));
  console.log("OK", src, "->", dest);
}

(async () => {
  await cropSquare("gyro_authentic.jpg", "pita_top.jpg");
  await cropSquare("falafel_authentic.jpg", "pita_double.jpg", 0.45, 0.55);
  await cropSquare("gyro_authentic.jpg", "pita_spicy.jpg", 0.0, 0.5);
  await cropSquare("hotdog_beef1.jpg", "hotdog_meat.jpg");
})();
