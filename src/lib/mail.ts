import nodemailer from "nodemailer";
import { prisma } from "./prisma";

type SendArgs = {
  to: string;
  subject: string;
  text: string;
  userId?: string;
};

export async function sendNotificationEmail(args: SendArgs) {
  const { to, subject, text, userId } = args;
  const host = process.env.SMTP_HOST;

  if (!host) {
    await prisma.notificationLog.create({
      data: {
        userId,
        channel: "console",
        toAddress: to,
        subject,
        body: text,
        status: "logged",
      },
    });
    console.info(`[notify:dev] To: ${to} | ${subject}\n${text}`);
    return { delivered: true, mode: "console" as const };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@fleetmarket.sa",
      to,
      subject,
      text,
    });

    await prisma.notificationLog.create({
      data: {
        userId,
        channel: "email",
        toAddress: to,
        subject,
        body: text,
        status: "sent",
      },
    });

    return { delivered: true, mode: "email" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "send failed";
    await prisma.notificationLog.create({
      data: {
        userId,
        channel: "email",
        toAddress: to,
        subject,
        body: text,
        status: "failed",
        error: message,
      },
    });
    return { delivered: false, mode: "email" as const, error: message };
  }
}
