const fs = require('fs');
const path = require('path');

const SOURCE_LETTERS = path.join(__dirname, '../dataset_demo/letters');
const SOURCE_IMAGES = path.join(__dirname, '../dataset_demo/images');
const DEST_BASE = path.join(__dirname, '../public/data/demo/legajos/10');
const DEST_LETTERS = path.join(DEST_BASE, 'letters');
const DEST_IMAGES = path.join(DEST_BASE, 'images');

[DEST_BASE, DEST_LETTERS, DEST_IMAGES].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function run() {
  const meta = {
    legajoId: "10",
    title: "Epistolario de Don Pedro de Santacilia y Pax",
    dateRange: "1668-1669",
    letterCount: 0,
    imageCount: 0,
    summary: "Correspondencia de Don Pedro de Santacilia y Pax relativa a la gestión de sus bienes, familia y noticias públicas durante 1668 y 1669.",
    keyPlaces: ["Zaragoza", "Madrid", "Valencia", "Roma"],
    keyPeople: ["Pedro de Santacilia y Pax", "Jerónimo Pelegrín de Aragüés", "Andrés García de Castro"],
    keyThemes: ["Salud", "Económica", "Noticias"],
    featuredLetterIds: ["1135", "1165", "1229"],
    featuredEventIds: []
  };

  const files = fs.readdirSync(SOURCE_LETTERS).filter(f => f.endsWith('.json'));
  const allLetters = [];

  for (const file of files) {
    const filePath = path.join(SOURCE_LETTERS, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (content.legajo && content.legajo.toString() !== "10") continue;

      const letterId = content.id_carta || file.replace('.json', '');
      allLetters.push({ file, content, letterId });
    } catch (e) {
      console.error(`Error reading ${file}: ${e.message}`);
    }
  }

  // Sort them naturally to establish previous/next
  // Note: in the original demo, date sorting might be preferred, but ID sorting is stable.
  // We'll sort by ID numerically.
  allLetters.sort((a, b) => parseInt(a.letterId) - parseInt(b.letterId));

  const letterIndex = [];
  let totalImages = 0;

  for (let i = 0; i < allLetters.length; i++) {
    const { content, letterId } = allLetters[i];
    
    const prevCartaId = i > 0 ? allLetters[i - 1].letterId : null;
    const nextCartaId = i < allLetters.length - 1 ? allLetters[i + 1].letterId : null;

    const rawImages = content.imagenes || [];
    const newImages = [];
    let imgOrder = 1;

    for (const imgPath of rawImages) {
      const originalFilename = path.basename(imgPath);
      let sourceImgPath = path.join(SOURCE_IMAGES, originalFilename);
      
      if (!fs.existsSync(sourceImgPath)) continue;

      const paddedOrder = String(imgOrder).padStart(2, '0');
      const newFilename = `${letterId}__${paddedOrder}__${originalFilename}`;
      const destImgPath = path.join(DEST_IMAGES, newFilename);

      fs.copyFileSync(sourceImgPath, destImgPath);
      totalImages++;

      newImages.push({
        src: `/data/demo/legajos/10/images/${newFilename}`,
        order: imgOrder,
        originalFilename,
      });
      imgOrder++;
    }

    const hasImages = newImages.length > 0;
    const primaryImage = hasImages ? newImages[0].src : null;

    const destLetter = {
      ...content,
      id_carta: letterId,
      imagenes: newImages,
      hasImages,
      primaryImage,
      previousCartaId: prevCartaId,
      nextCartaId: nextCartaId
    };

    if (!destLetter.transcripcion) {
      destLetter.transcripcion = {
        modernizada: content.resumen || "",
        literal: ""
      }
    }

    fs.writeFileSync(path.join(DEST_LETTERS, `${letterId}.json`), JSON.stringify(destLetter, null, 2));

    letterIndex.push({
      id_carta: letterId,
      fecha: content.fecha || "",
      remitente: content.remitente || "",
      destinatario: content.destinatario || "",
      lugar: content.lugar || "",
      temas: content.temas || "",
      hasImages,
      primaryImage
    });
  }

  fs.writeFileSync(path.join(DEST_LETTERS, 'index.json'), JSON.stringify(letterIndex, null, 2));

  meta.letterCount = letterIndex.length;
  meta.imageCount = totalImages;
  fs.writeFileSync(path.join(DEST_BASE, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`Curated ${meta.letterCount} letters, ${meta.imageCount} images.`);
}

run();
