export interface MailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: MailAttachment[];
  template?: string;
  context?: Record<string, any>;
}

export interface MailService {
  sendMail(options: SendMailOptions): Promise<void>;
}

export interface MailModuleOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom: string;
  defaultReplyTo?: string;
  templateDir?: string;
}
