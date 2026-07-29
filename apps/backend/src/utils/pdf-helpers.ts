import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as os from "os";

// Use require to bypass missing TypeScript typings for arabic-persian-reshaper
const { ArabicShaper } = require("arabic-persian-reshaper");

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

export async function ensureFontsExist(): Promise<{ regular: string; bold: string }> {
  // Store fonts in OS temp directory because Vercel/Serverless is a read-only filesystem
  const fontsDir = path.join(os.tmpdir(), "kanan-fonts");
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const regularPath = path.join(fontsDir, "Amiri-Regular.ttf");
  const boldPath = path.join(fontsDir, "Cairo-Bold.ttf");

  const amiriUrl = "https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf";
  const cairoBoldUrl = "https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Bold.ttf";

  try {
    if (!fs.existsSync(regularPath)) {
      console.log("Downloading Amiri font for PDF generation...");
      await downloadFile(amiriUrl, regularPath);
    }
    if (!fs.existsSync(boldPath)) {
      console.log("Downloading Cairo-Bold font for PDF generation...");
      await downloadFile(cairoBoldUrl, boldPath);
    }
  } catch (err) {
    console.error("Failed to download fonts, checking system fallback...", err);
    if (process.platform === "win32") {
      const winArial = "C:\\Windows\\Fonts\\arial.ttf";
      const winArialBold = "C:\\Windows\\Fonts\\arialbd.ttf";
      if (fs.existsSync(winArial) && fs.existsSync(winArialBold)) {
        return { regular: winArial, bold: winArialBold };
      }
    }
    throw err;
  }

  return { regular: regularPath, bold: boldPath };
}

export function prepareArabicText(text: string): string {
  if (!text) return "";
  
  // Reshape characters using arabic-persian-reshaper
  const reshaped = ArabicShaper.convertArabic(text);
  
  // Tokenize string to isolate Arabic blocks, numbers, and English words
  const tokens: { type: "rtl" | "ltr"; text: string }[] = [];
  const regex = /([\uFB50-\uFDFF\uFE70-\uFEFF\u0600-\u06FF\u0621-\u064A]+)/g;
  
  let match;
  let lastIndex = 0;
  
  while ((match = regex.exec(reshaped)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "ltr",
        text: reshaped.slice(lastIndex, match.index),
      });
    }
    tokens.push({
      type: "rtl",
      text: match[0],
    });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < reshaped.length) {
    tokens.push({
      type: "ltr",
      text: reshaped.slice(lastIndex),
    });
  }

  // Reverse letters inside RTL Arabic tokens
  const processedTokens = tokens.map((t) => {
    if (t.type === "rtl") {
      return t.text.split("").reverse().join("");
    }
    return t.text;
  });

  // Reverse token order so numbers/English words layout LTR inside RTL flow
  return processedTokens.reverse().join("");
}

export function drawBase64Image(doc: any, base64Str: string, x: number, y: number, options: any) {
  try {
    if (!base64Str) return;
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");
    doc.image(imgBuffer, x, y, options);
  } catch (err) {
    console.error("Failed to draw base64 image", err);
  }
}

export function getLetterheadBgPath(): string | null {
  const paths = [
    path.join(process.cwd(), "apps/frontend/public/letterhead_bg.png"),
    path.join(process.cwd(), "public/letterhead_bg.png"),
    path.join(__dirname, "../../../../apps/frontend/public/letterhead_bg.png"),
    path.join(__dirname, "../../../frontend/public/letterhead_bg.png"),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function getLogoPath(): string | null {
  const paths = [
    path.join(process.cwd(), "apps/frontend/public/kenan-logo.png"),
    path.join(process.cwd(), "..", "frontend", "public", "kenan-logo.png"),
    path.join(__dirname, "../../../../apps/frontend/public/kenan-logo.png"),
    path.join(__dirname, "../../../frontend/public/kenan-logo.png"),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function drawPdfHeader(doc: any, title: string, query: any) {
  // Draw Official Letterhead Background Image if available
  const bgPath = getLetterheadBgPath();
  if (bgPath && fs.existsSync(bgPath)) {
    try {
      doc.image(bgPath, 0, 0, { width: 595.28, height: 841.89 });
    } catch (err) {
      console.error("Failed to draw letterhead background:", err);
    }
  } else {
    // Fallback: Accent Color Line & Logo
    doc.rect(40, 20, 532, 6).fill("#e11d48");
    const logoPath = getLogoPath();
    if (logoPath) {
      doc.image(logoPath, 260, 36, { width: 80 });
    }
  }
  
  const nameAr = query?.nameAr || "مؤسسة كنان لأنظمة الأمن والسلامة";
  const nameEn = query?.nameEn || "Kanan Safety & Fire Protection Systems Co.";
  const crNumber = query?.crNumber || "7050404537";
  const taxNumber = query?.taxNumber || "313072607300003";

  // Right Side (Arabic Info) below logo/wave
  doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(10);
  doc.text(prepareArabicText(nameAr), 300, 132, { align: "right", width: 255 });
  doc.fillColor("#475569").font("Amiri").fontSize(8.5);
  doc.text(prepareArabicText(`سجل تجاري: ${crNumber}`), 300, 147, { align: "right", width: 255 });
  doc.text(prepareArabicText(`الرقم الضريبي: ${taxNumber}`), 300, 160, { align: "right", width: 255 });

  // Left Side (English Info) below logo/wave
  doc.fillColor("#0d1440").font("Cairo-Bold").fontSize(9);
  doc.text(nameEn, 40, 132, { align: "left", width: 230 });
  doc.fillColor("#475569").font("Amiri").fontSize(8.5);
  doc.text(`C.R. Number: ${crNumber}`, 40, 147, { align: "left", width: 230 });
  doc.text(`VAT Number: ${taxNumber}`, 40, 160, { align: "left", width: 230 });

  // Document Title Badge
  if (title) {
    doc.fillColor("#d91c24").font("Cairo-Bold").fontSize(12);
    doc.text(prepareArabicText(title), 40, 176, { align: "center", width: 515.28 });
  }

  // Separator line below header title
  doc.moveTo(40, 194).lineTo(555, 194).strokeColor("#cbd5e1").lineWidth(1).stroke();

  // Reset fonts and colors for body
  doc.fillColor("#0f172a");
  doc.font("Amiri").fontSize(10);
}

export function drawPdfFooter(doc: any, pageNumber: number, query: any) {
  const bgPath = getLetterheadBgPath();
  // If letterhead background exists, the red footer banner with CR/phone/email is already in the background image.
  if (!bgPath || !fs.existsSync(bgPath)) {
    const crNumber = query?.crNumber || "7050404537";
    const email = query?.email || "info@kenan4saftey.com";
    const phone = query?.phone || "+966574590198";
    
    doc.moveTo(40, 740).lineTo(572, 740).strokeColor("#cbd5e1").lineWidth(1).stroke();
    doc.fillColor("#64748b").font("Amiri").fontSize(8);
    doc.text(prepareArabicText(`سجل تجاري: ${crNumber} | جوال: ${phone} | بريد: ${email}`), 40, 748, { align: "center", width: 532 });
  }
  
  if (pageNumber > 1) {
    doc.fillColor("#ffffff").font("Cairo-Bold").fontSize(8);
    doc.text(`صفحة ${pageNumber}`, 500, 818, { align: "left", width: 50 });
  }
}
