import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const accounnt = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      secure: false,
      auth: {
        user: accounnt.user,
        pass: accounnt.pass,
      },
    });
    await this.transporter.sendMail({
      from: 'test@gmail.com',
      to,
      subject,
      text: content,
    });
  }
}