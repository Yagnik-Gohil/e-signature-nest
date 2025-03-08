import { createTransport, Transporter } from 'nodemailer';
import { MESSAGE } from './constants/constant';

interface mailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | Array<string>;
  bcc?: string | Array<string>;
  attachments?: {
    filename?: string | false | undefined;
    content?: string | Buffer | undefined;
    path?: string | undefined;
    contentType?: string | undefined;
  }[];
}
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: process.env.SMTP_SERVICE,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(mailOptions: mailOptions) {
    const fromEmail = process.env.SMTP_USER;
    Object.assign(mailOptions, { from: `noreply <${fromEmail}>` });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.transporter.sendMail(mailOptions, (err: Error | null, info: any) => {
      if (err) {
        console.log('error', MESSAGE.MAIL_NOT_SENT);
      }
    });
  }
}
