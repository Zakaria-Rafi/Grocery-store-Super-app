import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import { createTransport } from 'nodemailer';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async testEmailSend() {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending email with Nodemailer');
      const transporter = createTransport({
        host: 'mailhog',
        port: 1025,
      });
      await transporter.sendMail({
        from: 'test@test.com',
        to: 'test@test.com',
        subject: 'Hello',
        text: 'Hello world!',
      });
    } else {
      const mailgun = new Mailgun(FormData);
      const client = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        url: 'https://api.eu.mailgun.net',
        timeout: 20000,
      });

      client.messages
        .create(process.env.MAILGUN_DOMAIN, {
          from: 'Excited User <postmaster@trinity.atressel.fr>',
          to: ['alexandre.tressel@icloud.com'],
          subject: 'Hello',
          text: 'Testing some Mailgun awesomeness!',
          html: '<h1>Testing some Mailgun awesomeness!</h1>',
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
