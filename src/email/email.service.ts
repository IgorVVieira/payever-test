import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const accounnt = await nodemailer.createTestAccount();
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: accounnt.user,
          pass: accounnt.pass,
        },
        requireTLS: true,
      });
      await this.transporter.sendMail({
        from: 'test@gmail.com',
        to,
        subject,
        text: content,
      });
    } catch (error) {
      console.error('Error sending email', error);
    }
  }
}
