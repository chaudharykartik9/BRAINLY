import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { logger } from './ logger.js';

const isConfigured = Boolean(ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: Number(ENV.SMTP_PORT),
      secure: Number(ENV.SMTP_PORT) === 465,
      auth: { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS },
    })
  : null;

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email via SMTP when configured. With no SMTP env vars set (the
 * default in local/dev), logs the content to the console instead — this
 * keeps flows like password reset fully testable without real credentials.
 */
export const sendMail = async (options: SendMailOptions): Promise<void> => {
  if (!transporter) {
    logger.warn(
      `SMTP not configured — logging email instead of sending it.\n` +
        `To: ${options.to}\nSubject: ${options.subject}\n${options.text}`,
    );
    return;
  }

  const info = await transporter.sendMail({
    from: ENV.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  logger.info(
    `Email sent to ${options.to} (messageId=${info.messageId}, response="${info.response}")`,
  );
};
