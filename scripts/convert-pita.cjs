const sharp = require("sharp");
const path = require("path");
const SRC = path.join(__dirname, "photo-candidates");
const OUT = path.join(__dirname, "..", "public", "images", "menu");

(async () => {
  const img = sharp(path.join(SRC, "pita_pocket1.jpg"));
  const meta = await img.metadata();
  const size = Math.min(meta.width, meta.height);
  await img
    .extract({
      left: Math.round((meta.width - size) / 2),
      top: Math.round((meta.height - size) / 2),
      width: size,
      height: size,
    })
    .resize(900, 900)
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, "pita_cheese.jpg"));
  console.log("OK pita_cheese.jpg");
})();
