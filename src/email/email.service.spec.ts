import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTestAccount: jest.fn(),
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const testAccount = {
        user: 'testuser',
        pass: 'testpass',
      };

      const sendMailMock = jest.fn();
      (nodemailer.createTestAccount as jest.Mock).mockResolvedValue(
        testAccount,
      );
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: sendMailMock,
      });

      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const content = 'Test Content';

      await emailService.sendEmail(to, subject, content);

      expect(nodemailer.createTestAccount).toHaveBeenCalled();
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        requireTLS: true,
      });
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'test@gmail.com',
        to,
        subject,
        text: content,
      });
    });
  });
});
