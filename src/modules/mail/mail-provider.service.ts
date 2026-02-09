import { Injectable, Logger } from '@nestjs/common';
import * as BREVO from '@getbrevo/brevo';
import * as pug from 'pug';
import { convert } from 'html-to-text';
import * as path from 'path';

@Injectable()
export class MailProviderService {
  private readonly logger = new Logger(MailProviderService.name);
  private apiInstance: BREVO.TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new BREVO.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      BREVO.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY as string,
    );
  }

  async sendEmail(options: {
    to: string;
    template: string;
    subject: string;
    user?: any;
    extraData?: any;
  }): Promise<void> {
    const { to, template, subject, user, extraData } = options;
    const fromName = 'EduSmartix';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@edusmartix.com';

    try {
      // 1. Render Pug
      const baseDir = process.env.NODE_ENV === 'DEVELOPMENT' ? 'src' : 'dist';
      const templatePath = path.join(
        process.cwd(),
        baseDir,
        'modules/mail/views',
        `${template}.pug`,
      );

      const html = pug.renderFile(templatePath, {
        user,
        subject,
        ...extraData,
      });

      // 2. Build Brevo Object
      const sendSmtpEmail = new BREVO.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = convert(html);
      sendSmtpEmail.sender = { name: fromName, email: fromEmail };
      sendSmtpEmail.to = [{ email: to }];

      // 3. Fire API
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error: any) {
      this.logger.error(
        `Mail sending failed: ${error.response?.body?.message || error.message}`,
      );
      throw error;
    }
  }
}
