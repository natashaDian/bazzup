import "server-only";
import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER / GMAIL_APP_PASSWORD are not set - add them to .env to send email.",
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export async function sendReviewRequestEmail({
  to,
  vendorName,
  bazaarTitle,
  applicationId,
}: {
  to: string;
  vendorName: string;
  bazaarTitle: string;
  applicationId: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reviewUrl = `${baseUrl}/applications/${applicationId}/review`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `BazzUp <${process.env.GMAIL_USER}>`,
    to,
    subject: `How was ${bazaarTitle}? Share your review`,
    html: `
      <p>Hi ${vendorName},</p>
      <p><strong>${bazaarTitle}</strong> has wrapped up. We'd love to hear how it went for your business.</p>
      <p><a href="${reviewUrl}">Leave a review</a></p>
      <p>Thanks for being part of BazzUp!</p>
    `,
  });
}
