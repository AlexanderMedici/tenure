import nodemailer from "nodemailer";

let cachedTransporter = null;
let cachedPreviewUrl = null;

const buildTransporter = async () => {
  if (process.env.NODE_ENV === "production") {
    const port = Number(process.env.SMTP_PORT || 465);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  cachedPreviewUrl = `https://ethereal.email/messages`;
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const getMailer = async () => {
  if (!cachedTransporter) {
    cachedTransporter = await buildTransporter();
  }
  return cachedTransporter;
};

export const getPreviewUrl = (info) => nodemailer.getTestMessageUrl(info);

export const getPreviewInboxUrl = () => cachedPreviewUrl;
