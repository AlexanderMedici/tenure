import { Resend } from "resend";

let cachedClient = null;

const getClient = () => {
  if (!cachedClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
};

export const sendEmail = async ({
  from,
  to,
  bcc,
  subject,
  text,
  html,
  replyTo,
  attachments,
}) => {
  const client = getClient();
  const payload = {
    from: from || process.env.RESEND_FROM || "no-reply@tenure.local",
    to,
    bcc,
    subject,
    text,
    html,
  };
  if (replyTo) {
    payload.replyTo = replyTo;
  }
  if (attachments?.length) {
    payload.attachments = attachments;
  }
  const { data, error } = await client.emails.send(payload);
  if (error) {
    const err = new Error(error.message || "Email send failed");
    err.details = error;
    throw err;
  }
  return data;
};
