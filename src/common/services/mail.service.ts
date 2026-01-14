import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailAttachment, MailModuleOptions, MailService as IMailService, SendMailOptions } from '../interfaces/mail.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService implements IMailService, OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;
  private defaultReplyTo?: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      const host = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
      const port = Number(this.configService.get<string>('MAIL_PORT', '587'));
  
      const secure =
        this.configService.get<string>('MAIL_SECURE') === 'true';
  
      const user = this.configService.get<string>('MAIL_USER', '');
      const pass = this.configService.get<string>('MAIL_PASSWORD', '');
  
      this.defaultFrom = this.configService.get<string>('MAIL_FROM', user);
      this.defaultReplyTo = this.configService.get<string>('MAIL_REPLY_TO', this.defaultFrom);
  
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure, 
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false, // recomendado en redes internas/gobierno
        },
      });
  
      await this.transporter.verify();
      this.logger.log('Servicio de correo inicializado correctamente');
    } catch (error) {
      this.logger.error('Error al inicializar el servicio de correo:', error);
  
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.warn('Usando transporter de prueba para desarrollo');
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'test@ethereal.email',
            pass: 'test',
          },
        });
      } else {
        throw error;
      }
    }
  }
  

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: options.replyTo || this.defaultReplyTo || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        replyTo: options.replyTo || this.defaultReplyTo,
        attachments: options.attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          path: attachment.path,
          contentType: attachment.contentType,
        })),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Correo enviado exitosamente: ${info.messageId}`);
      this.logger.debug(`Respuesta del servidor: ${info.response}`);

      // Si estamos en desarrollo con ethereal.email, mostrar URL de vista previa
      if (info.messageId && this.configService.get<string>('NODE_ENV') === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Vista previa del correo: ${previewUrl}`);
        }
      }
    } catch (error) {
      this.logger.error('Error al enviar correo:', error);
      throw new Error(`Error al enviar correo: ${error.message}`);
    }
  }

  async sendTemplateMail(
    to: string | string[],
    subject: string,
    templateName: string,
    context: Record<string, any>,
    options?: Partial<SendMailOptions>,
  ): Promise<void> {
    // En una implementación real, aquí se cargaría una plantilla
    // Por ahora, usaremos una plantilla simple HTML
    const html = this.renderTemplate(templateName, context);

    await this.sendMail({
      to,
      subject,
      html,
      ...options,
    });
  }

  private renderTemplate(templateName: string, context: Record<string, any>): string {
    // Plantillas básicas para diferentes casos de uso
    const templates: Record<string, string> = {
      'participacion-ciudadana-confirmacion': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Participación Ciudadana</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .header { background: linear-gradient(135deg, #1a5276 0%, #2c3e50 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .content { background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
            .footer { margin-top: 30px; text-align: center; font-size: 13px; color: #6c757d; padding-top: 20px; border-top: 1px solid #dee2e6; }
            .highlight { background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 5px solid #3498db; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e9ecef; }
            .thank-you { font-size: 24px; color: #2c3e50; margin-bottom: 20px; font-weight: 600; }
            .greeting { font-size: 18px; margin-bottom: 15px; }
            .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
            .logo { max-width: 200px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Portal de Transparencia Fiscal</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: 300;">Gobierno del Estado de Morelos</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Su voz construye un Morelos más transparente</p>
          </div>
          
          <div class="content">
            <div class="thank-you">¡Muchas gracias por su participación!</div>
            
            <p class="greeting">Estimado(a) <strong style="color: #1a5276;">${context.nombre}</strong>,</p>
            
            <p>Reciba un cordial saludo y nuestro más sincero agradecimiento por tomarse el tiempo para compartir su opinión a través del Portal de Transparencia Fiscal del Gobierno del Estado de Morelos.</p>
            
            <div class="highlight">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #2c3e50;">✨ Su contribución es de gran valor para nosotros ✨</strong><br><br>
                Cada mensaje, cada sugerencia y cada comentario que recibimos de ciudadanos comprometidos como usted nos ayuda a mejorar continuamente, fortaleciendo la transparencia, la rendición de cuentas y la participación ciudadana en nuestro estado.
              </p>
            </div>
            
            <p>Su voz es fundamental para construir un gobierno más cercano, transparente y responsable. Nos comprometemos a analizar cuidadosamente su mensaje y darle el seguimiento correspondiente.</p>
            
            <div class="details">
              <h3 style="color: #1a5276; margin-top: 0; border-bottom: 2px solid #3498db; padding-bottom: 10px;">📋 Detalles de su participación:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 40%;"><strong>Folio único:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><code style="background: #e9ecef; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${context.folio}</code></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Asunto:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${context.asunto}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Fecha y hora de recepción:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${context.fecha}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Área destino:</strong></td>
                  <td style="padding: 8px 0;">${context.areaDestino}</td>
                </tr>
              </table>
            </div>
            
            <p><strong>Estado actual:</strong> <span style="background: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 4px; font-weight: bold;">${context.estatus}</span></p>
            
            <p>🔔 <strong>Le mantendremos informado:</strong> Recibirá actualizaciones sobre el seguimiento de su mensaje a través de este mismo correo electrónico. Por favor, conserve este folio para cualquier consulta futura.</p>
            
            <p>Si tiene alguna pregunta adicional o necesita más información, no dude en contactarnos haciendo referencia a su folio: <strong>${context.folio}</strong></p>
            
            <div class="signature">
              <p style="margin: 0 0 5px 0;">Con gratitud y compromiso,</p>
              <p style="margin: 0; font-size: 18px; color: #1a5276; font-weight: bold;">Unidad de Transparencia Fiscal</p>
              <p style="margin: 5px 0 0 0; font-size: 15px;">Secretaría de Administración y Finanzas</p>
              <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold;">Gobierno del Estado de Morelos</p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6c757d;">
                📧 transparencia.fiscal@morelos.gob.mx<br>
                🌐 <a href="https://transparencia.morelos.gob.mx" style="color: #3498db; text-decoration: none;">transparencia.morelos.gob.mx</a>
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">Este es un mensaje automático generado por nuestro sistema. Por favor, no responda a este correo.</p>
            <p style="margin: 5px 0; font-size: 12px;">Su participación contribuye a un gobierno más transparente y cercano a la ciudadanía.</p>
            <p style="margin: 5px 0; font-size: 11px; color: #adb5bd;">© ${new Date().getFullYear()} Portal de Transparencia Fiscal - Gobierno del Estado de Morelos. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
      'notificacion-interna': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Mensaje de Participación Ciudadana</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #c0392b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }
            .urgent { background-color: #ffeaa7; padding: 15px; border-left: 4px solid #fdcb6e; margin: 20px 0; }
            .details { background-color: white; padding: 15px; border: 1px solid #eee; border-radius: 3px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚠️ Nuevo Mensaje Recibido</h1>
            <h2>Portal de Transparencia Fiscal</h2>
          </div>
          <div class="content">
            <h2>Se ha recibido un nuevo mensaje de participación ciudadana</h2>
            
            <div class="urgent">
              <p><strong>ATENCIÓN:</strong> Este mensaje requiere su revisión y atención.</p>
            </div>
            
            <div class="details">
              <h3>Información del mensaje:</h3>
              <p><strong>Folio:</strong> ${context.folio}</p>
              <p><strong>Remitente:</strong> ${context.nombre}</p>
              <p><strong>Correo:</strong> ${context.correo}</p>
              <p><strong>Asunto:</strong> ${context.asunto}</p>
              <p><strong>Área destino:</strong> ${context.areaDestino}</p>
              <p><strong>Fecha de recepción:</strong> ${context.fecha}</p>
              <p><strong>Canal:</strong> ${context.canal}</p>
            </div>
            
            <p><strong>Mensaje:</strong></p>
            <div style="background-color: white; padding: 15px; border: 1px solid #eee; border-radius: 3px; margin: 15px 0;">
              ${context.mensaje}
            </div>
            
            <p>Por favor, acceda al sistema administrativo para revisar y dar seguimiento a este mensaje.</p>
            
            <p><a href="${context.urlSistema}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block;">Acceder al Sistema</a></p>
          </div>
        </body>
        </html>
      `,
    };

    return templates[templateName] || `<p>${JSON.stringify(context)}</p>`;
  }

  async sendParticipacionCiudadanaConfirmacion(
    nombre: string,
    correo: string,
    folio: string,
    asunto: string,
    areaDestino: string,
  ): Promise<void> {
    const context = {
      nombre,
      folio,
      asunto,
      areaDestino,
      fecha: new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      estatus: 'Pendiente de revisión',
    };

    await this.sendTemplateMail(
      correo,
      `Confirmación de participación ciudadana - Folio: ${folio}`,
      'participacion-ciudadana-confirmacion',
      context,
    );
  }

  async sendNotificacionInterna(
    nombre: string,
    correo: string,
    folio: string,
    asunto: string,
    mensaje: string,
    areaDestino: string,
    canal: string,
    destinatariosInternos: string | string[],
  ): Promise<void> {
    const context = {
      nombre,
      correo,
      folio,
      asunto,
      mensaje,
      areaDestino,
      canal,
      fecha: new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      urlSistema: this.configService.get<string>('APP_URL', 'http://localhost:3000') + '/admin/participacion-ciudadana',
    };

    await this.sendTemplateMail(
      destinatariosInternos,
      `Nuevo mensaje de participación ciudadana - Folio: ${folio}`,
      'notificacion-interna',
      context,
    );
  }
}
