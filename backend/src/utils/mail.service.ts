import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import { createTransport } from 'nodemailer';
@Injectable()
export class MailService {
  mailService: any;
  async sendResetPasswordEmail(email: string, resetUrl: string) {
    if (!process.env.MAILGUN_API_KEY) return;
    const mailgun = new Mailgun(FormData);
    const client = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: 'https://api.eu.mailgun.net/',
      timeout: 20000,
    });

    client.messages
      .create(process.env.MAILGUN_DOMAIN, {
        from: 'Excited User <postmaster@trinity.atressel.fr>',
        to: [email],
        subject: 'Reset Password',
        text: `Click on the link to reset your password: ${resetUrl}`,
        html: `<h1>Click on the link to reset your password: ${resetUrl}</h1>`,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async sendCreateUserEmail(email: string, createPasswordUrl: string) {
    if (process.env.NODE_ENV === 'development') {
      const transporter = createTransport({
        host: 'mailhog',
        port: 1025,
      });

      await transporter.sendMail({
        from: 'Excited User <postmaster@trinity.atressel.fr>',
        to: [email],
        subject: 'Account created',
        text: `Your account has been created, you can create your password by clicking on the link: ${createPasswordUrl}`,
        html: `<h1>Your account has been created, you can create your password by clicking on the link: ${createPasswordUrl}</h1>`,
      });
    } else {
      if (!process.env.MAILGUN_API_KEY) return;
      const mailgun = new Mailgun(FormData);
      const client = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      });

      client.messages
        .create(process.env.MAILGUN_DOMAIN, {
          from: 'Excited User <postmaster@trinity.atressel.fr>',
          to: [email],
          subject: 'Account created',
          text: `Your account has been created, you can create your password by clicking on the link: ${createPasswordUrl}`,
          html: `<h1>Your account has been created, you can create your password by clicking on the link: ${createPasswordUrl}</h1>`,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  async sendOrderConfirmationEmail(
    email: string,
    subject: string,
    text: string,
    pdfBuffer: Buffer,
    html?: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const transporter = createTransport({
        host: 'mailhog',
        port: 1025,
      });

      await transporter.sendMail({
        from: 'Excited User <postmaster@trinity.atressel.fr>',
        to: [email],
        subject: subject,
        text: text,
        html: html || undefined,
        attachments: [
          {
            filename: 'invoice.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } else {
      if (!process.env.MAILGUN_API_KEY) return;
      const mailgun = new Mailgun(FormData);
      const client = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      });

      client.messages
        .create(process.env.MAILGUN_DOMAIN, {
          from: 'Excited User <postmaster@trinity.atressel.fr>',
          to: [email],
          subject: subject,
          text: text,
          html: html || undefined,
          attachment: pdfBuffer,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}
