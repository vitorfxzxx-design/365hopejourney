import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateThankYouPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Background color (Deep spiritual dark green)
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(7 / 255, 19 / 255, 13 / 255), // #07130D
  });

  // Ambient top golden/emerald border frame
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(16 / 255, 185 / 255, 129 / 255), // Emerald border
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: rgb(245 / 255, 158 / 255, 11 / 255), // Gold inner line
    borderWidth: 0.5,
  });

  // Embed official logo
  const logoPath = path.join(__dirname, 'public', 'logo.jpg');
  let logoImage;
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    try {
      logoImage = await pdfDoc.embedJpg(logoBytes);
    } catch (e) {
      try {
        logoImage = await pdfDoc.embedPng(logoBytes);
      } catch (err) {}
    }
  }

  let currentY = height - 100;

  if (logoImage) {
    const logoDim = 64;
    page.drawImage(logoImage, {
      x: width / 2 - logoDim / 2,
      y: currentY - 20,
      width: logoDim,
      height: logoDim,
    });
    currentY -= 90;
  }

  // App Title
  const brandTitle = "365 HOPE JOURNEY";
  const brandTitleWidth = fontTimesBold.widthOfTextAtSize(brandTitle, 22);
  page.drawText(brandTitle, {
    x: width / 2 - brandTitleWidth / 2,
    y: currentY,
    size: 22,
    font: fontTimesBold,
    color: rgb(251 / 255, 191 / 255, 36 / 255), // Amber 400
  });
  currentY -= 20;

  const subtitle = "Sanctuary of Daily Faith, Peace & Spiritual Renewal";
  const subtitleWidth = fontHelvetica.widthOfTextAtSize(subtitle, 10);
  page.drawText(subtitle, {
    x: width / 2 - subtitleWidth / 2,
    y: currentY,
    size: 10,
    font: fontHelvetica,
    color: rgb(110 / 255, 231 / 255, 183 / 255), // Emerald 300
  });
  currentY -= 40;

  // Header Box
  page.drawRectangle({
    x: 45,
    y: currentY - 35,
    width: width - 90,
    height: 48,
    color: rgb(13 / 255, 36 / 255, 25 / 255), // Dark emerald box
    borderColor: rgb(52 / 255, 211 / 255, 153 / 255),
    borderWidth: 1,
  });

  const headerMsg = "THANK YOU FOR YOUR PURCHASE!";
  const headerMsgWidth = fontHelveticaBold.widthOfTextAtSize(headerMsg, 14);
  page.drawText(headerMsg, {
    x: width / 2 - headerMsgWidth / 2,
    y: currentY - 10,
    size: 14,
    font: fontHelveticaBold,
    color: rgb(255 / 255, 255 / 255, 255 / 255),
  });

  const headerSub = "Your Hope Credits are ready to guide and empower your journey.";
  const headerSubWidth = fontHelvetica.widthOfTextAtSize(headerSub, 9.5);
  page.drawText(headerSub, {
    x: width / 2 - headerSubWidth / 2,
    y: currentY - 26,
    size: 9.5,
    font: fontHelvetica,
    color: rgb(167 / 255, 243 / 255, 208 / 255),
  });
  currentY -= 65;

  // Section: Welcome note
  const introText = 
    "We are deeply grateful and blessed to accompany you on your spiritual path. " +
    "Your purchase of Hope Credits gives you immediate, unhindered access to customized spiritual mentoring, " +
    "daily devotionals, anxiety relief audio prayers, and tailor-made biblical declarations.";

  page.drawText(introText, {
    x: 48,
    y: currentY,
    size: 9.5,
    font: fontHelvetica,
    color: rgb(209 / 255, 250 / 255, 229 / 255),
    maxWidth: width - 96,
    lineHeight: 14,
  });
  currentY -= 50;

  // 3-Step Access Box
  page.drawRectangle({
    x: 45,
    y: currentY - 145,
    width: width - 90,
    height: 150,
    color: rgb(16 / 255, 43 / 255, 30 / 255),
    borderColor: rgb(245 / 255, 158 / 255, 11 / 255),
    borderWidth: 1,
  });

  page.drawText("HOW TO ACCESS & USE YOUR CREDITS:", {
    x: 60,
    y: currentY - 18,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(251 / 255, 191 / 255, 36 / 255),
  });

  const steps = [
    "Step 1: Open the 365 Hope Journey WebApp (or add to your Home Screen).",
    "Step 2: Log in using the exact same email address you used for this Hotmart purchase.",
    "Step 3: Your Hope Credits have been automatically credited to your balance via Webhook!",
    "Step 4: Visit the 'AI Guide' tab to begin your private consultation or unlock devotionals."
  ];

  let stepY = currentY - 38;
  steps.forEach((step, idx) => {
    page.drawText(`[+]  ${step}`, {
      x: 60,
      y: stepY,
      size: 9.5,
      font: fontHelvetica,
      color: rgb(255 / 255, 255 / 255, 255 / 255),
      maxWidth: width - 120,
      lineHeight: 13,
    });
    stepY -= 26;
  });
  currentY -= 175;

  // Features Highlight Box
  page.drawText("WHAT YOUR HOPE CREDITS UNLOCK:", {
    x: 48,
    y: currentY,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(110 / 255, 231 / 255, 183 / 255),
  });
  currentY -= 18;

  const benefits = [
    "• 24/7 AI Spiritual Guide & Faith Mentor (1 Credit per consultation message)",
    "• Personalized Scripture Decrees & Blessing Prayers tailored to your circumstances",
    "• In-Depth Spiritual Guides, Reflections & Peaceful Devotionals",
    "• Nightly Rest & Soul Serenity Guided Meditations",
    "• Lifetime Validity - Your credits never expire and are always available when you need peace."
  ];

  benefits.forEach(b => {
    page.drawText(b, {
      x: 52,
      y: currentY,
      size: 9,
      font: fontHelvetica,
      color: rgb(229 / 255, 231 / 255, 235 / 255),
      maxWidth: width - 100,
      lineHeight: 13,
    });
    currentY -= 18;
  });

  currentY -= 15;

  // Scripture Blessing Box
  page.drawRectangle({
    x: 45,
    y: currentY - 45,
    width: width - 90,
    height: 52,
    color: rgb(10 / 255, 26 / 255, 18 / 255),
    borderColor: rgb(52 / 255, 211 / 255, 153 / 255),
    borderWidth: 0.8,
  });

  page.drawText('"May the God of hope fill you with all joy and peace as you trust in him,', {
    x: width / 2 - fontTimesRoman.widthOfTextAtSize('"May the God of hope fill you with all joy and peace as you trust in him,', 9.5) / 2,
    y: currentY - 18,
    size: 9.5,
    font: fontTimesRoman,
    color: rgb(251 / 255, 191 / 255, 36 / 255),
  });

  page.drawText('so that you may overflow with hope by the power of the Holy Spirit." — Romans 15:13', {
    x: width / 2 - fontTimesRoman.widthOfTextAtSize('so that you may overflow with hope by the power of the Holy Spirit." — Romans 15:13', 9) / 2,
    y: currentY - 33,
    size: 9,
    font: fontTimesRoman,
    color: rgb(251 / 255, 191 / 255, 36 / 255),
  });
  currentY -= 70;

  // Footer / Support
  page.drawText("CUSTOMER SUPPORT & DEDICATED ASSISTANCE", {
    x: width / 2 - fontHelveticaBold.widthOfTextAtSize("CUSTOMER SUPPORT & DEDICATED ASSISTANCE", 9) / 2,
    y: currentY,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(156 / 255, 163 / 255, 175 / 255),
  });
  currentY -= 14;

  const supportMsg = "If you have any questions or need balance assistance, email us at: corefysystems@gmail.com";
  page.drawText(supportMsg, {
    x: width / 2 - fontHelvetica.widthOfTextAtSize(supportMsg, 8.5) / 2,
    y: currentY,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(110 / 255, 231 / 255, 183 / 255),
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'public', '365_Hope_Journey_Credits_Welcome_Guide.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF successfully generated at: ${outputPath}`);
}

generateThankYouPDF().catch(err => {
  console.error("PDF generation error:", err);
});
