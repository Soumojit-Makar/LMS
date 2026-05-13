import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface UserLike { name: string; email: string }
interface CourseLike { title: string; slug: string }

export async function generateCertificate(user: UserLike, course: CourseLike): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.06, 0.1, 0.22) });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: rgb(0.85, 0.71, 0.35), borderWidth: 2 });
  page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: rgb(0.85, 0.71, 0.35), borderWidth: 0.5 });

  const academy = 'DIGITALINDIAN SKILL ACADEMY';
  const acW = boldFont.widthOfTextAtSize(academy, 20);
  page.drawText(academy, { x: (width - acW) / 2, y: height - 90, size: 20, font: boldFont, color: rgb(0.85, 0.71, 0.35) });

  const title = 'CERTIFICATE OF COMPLETION';
  const titleW = boldFont.widthOfTextAtSize(title, 30);
  page.drawText(title, { x: (width - titleW) / 2, y: height - 160, size: 30, font: boldFont, color: rgb(1, 1, 1) });

  page.drawLine({ start: { x: 120, y: height - 180 }, end: { x: width - 120, y: height - 180 }, thickness: 0.5, color: rgb(0.85, 0.71, 0.35) });

  const cert = 'This is to certify that';
  const certW = regularFont.widthOfTextAtSize(cert, 14);
  page.drawText(cert, { x: (width - certW) / 2, y: height - 230, size: 14, font: regularFont, color: rgb(0.75, 0.75, 0.85) });

  const nameW = boldFont.widthOfTextAtSize(user.name, 36);
  page.drawText(user.name, { x: (width - nameW) / 2, y: height - 285, size: 36, font: boldFont, color: rgb(0.85, 0.71, 0.35) });

  const completed = 'has successfully completed the course';
  const compW = regularFont.widthOfTextAtSize(completed, 14);
  page.drawText(completed, { x: (width - compW) / 2, y: height - 330, size: 14, font: regularFont, color: rgb(0.75, 0.75, 0.85) });

  const courseTitle = course.title.length > 60 ? course.title.slice(0, 57) + '...' : course.title;
  const courseW = boldFont.widthOfTextAtSize(courseTitle, 22);
  page.drawText(courseTitle, { x: (width - courseW) / 2, y: height - 375, size: 22, font: boldFont, color: rgb(1, 1, 1) });

  page.drawLine({ start: { x: 120, y: height - 400 }, end: { x: width - 120, y: height - 400 }, thickness: 0.5, color: rgb(0.85, 0.71, 0.35) });

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  page.drawText(`Date: ${dateStr}`, { x: 120, y: height - 440, size: 12, font: regularFont, color: rgb(0.6, 0.6, 0.7) });
  page.drawLine({ start: { x: width - 280, y: height - 440 }, end: { x: width - 120, y: height - 440 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.7) });
  page.drawText('Authorised Signatory', { x: width - 270, y: height - 460, size: 11, font: regularFont, color: rgb(0.6, 0.6, 0.7) });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
