import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Configurar cliente Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net'
});

// Verificar configuración de Mailgun
export const verifyEmailConfig = async () => {
  try {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    
    if (!apiKey || !domain) {
      console.log('⚠️  MAILGUN_API_KEY/MAILGUN_DOMAIN no configurados');
      console.log('⚠️  El sistema funcionará, pero NO enviará correos.');
      return false;
    }
    
    console.log('✅ API Mailgun configurada correctamente');
    console.log('📧 Correos se enviarán desde:', process.env.EMAIL_FROM || 'analista.mantenimiento@partequipos.com');
    console.log('📬 Correos llegarán a:', process.env.EMAIL_TO || 'analista.mantenimiento@partequipos.com');
    console.log('🌐 Dominio Mailgun:', domain);
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de correo:', error.message);
    return false;
  }
};

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Formatear fecha
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Traducir tipo de servicio
const translateServiceType = (serviceType) => {
  const translations = {
    'electricity': 'Electricidad',
    'water': 'Agua',
    'gas': 'Gas',
    'internet': 'Internet',
    'phone': 'Teléfono',
    'cellular': 'Celular',
    'waste': 'Basuras',
    'sewer': 'Alcantarillado',
    'security': 'Seguridad',
    'administration': 'Administración',
    'rent': 'Arrendamiento',
    'other': 'Otro'
  };
  return translations[serviceType] || serviceType;
};

// Traducir estado
const translateStatus = (status) => {
  const translations = {
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'paid': 'Pagada',
    'draft': 'Borrador',
    'overdue': 'Vencida'
  };
  return translations[status] || status;
};

// Enviar notificación de nueva factura
export const sendNewBillNotification = async (billData, userEmail, userName, attachmentPath = null) => {
  try {
    console.log('📧 Iniciando envío de correo con API Mailgun...');
    console.log('📧 Usuario:', userName, userEmail);
    console.log('📧 MAILGUN_API_KEY configurado:', process.env.MAILGUN_API_KEY ? 'Sí' : 'No');
    console.log('📧 MAILGUN_DOMAIN configurado:', process.env.MAILGUN_DOMAIN ? 'Sí' : 'No');
    
    // Verificar configuración
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.log('⚠️  Variables de entorno de Mailgun no configuradas');
      return { success: false, error: 'Configuración de correo incompleta' };
    }
    
    // Preparar datos del correo
    const fromEmail = process.env.EMAIL_FROM || 'noreply@partequipos.com';
    const toEmail = process.env.EMAIL_TO || 'analista.mantenimiento@partequipos.com';
    const subject = `Nueva Factura Registrada - ${billData.contractNumber || 'Sin contrato'} - ${translateServiceType(billData.serviceType)}`;
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              width: 180px;
              color: #6b7280;
            }
            .info-value {
              flex: 1;
              color: #111827;
            }
            .highlight {
              background-color: #dbeafe;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              border-left: 4px solid #3b82f6;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background-color: #fef3c7;
              color: #92400e;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📄 Nueva Factura Registrada</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestión de Facturas</p>
            </div>
            
            <div class="content">
              <p>Hola,</p>
              <p>Se ha registrado una nueva factura en el sistema por <strong>${userName}</strong>.</p>
              
              <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; text-align: center;">
                <h2 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                  📋 CONTRATO: ${billData.contractNumber || 'Sin contrato'}
                </h2>
              </div>
              
              <div class="highlight">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Detalles de la Factura</h3>
              </div>

              <div class="info-row">
                <div class="info-label">Tipo de Servicio:</div>
                <div class="info-value"><strong>${translateServiceType(billData.serviceType)}</strong></div>
              </div>

              <div class="info-row">
                <div class="info-label">Proveedor:</div>
                <div class="info-value">${billData.provider || 'N/A'}</div>
              </div>

              <div class="info-row">
                <div class="info-label">Número de Factura:</div>
                <div class="info-value">${billData.invoiceNumber || 'N/A'}</div>
              </div>

              <div class="info-row">
                <div class="info-label">Periodo:</div>
                <div class="info-value">${billData.period}</div>
              </div>

              <div class="info-row">
                <div class="info-label">Monto Total:</div>
                <div class="info-value"><strong style="color: #3b82f6; font-size: 18px;">${formatCurrency(billData.totalAmount)}</strong></div>
              </div>

              <div class="info-row">
                <div class="info-label">Fecha de Vencimiento:</div>
                <div class="info-value">${formatDate(billData.dueDate)}</div>
              </div>

              <div class="info-row">
                <div class="info-label">Ubicación:</div>
                <div class="info-value">${billData.location}</div>
              </div>

              <div class="info-row">
                <div class="info-label">Centro de Costos:</div>
                <div class="info-value">${billData.costCenter || 'N/A'}</div>
              </div>

              <div class="info-row">
                <div class="info-label">Estado:</div>
                <div class="info-value"><span class="status-badge">${translateStatus(billData.status)}</span></div>
              </div>

              ${billData.description ? `
              <div class="info-row">
                <div class="info-label">Descripción:</div>
                <div class="info-value">${billData.description}</div>
              </div>
              ` : ''}

              ${billData.consumption ? `
              <div class="info-row">
                <div class="info-label">Consumo:</div>
                <div class="info-value">${billData.consumption} ${billData.unitOfMeasure || ''}</div>
              </div>
              ` : ''}

              ${billData.notes ? `
              <div class="highlight" style="background-color: #fef3c7; border-left-color: #f59e0b;">
                <h4 style="margin-top: 0; color: #92400e;">📝 Notas:</h4>
                <p style="margin: 0;">${billData.notes}</p>
              </div>
              ` : ''}

              <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Registrado por:</strong> ${userName} (${userEmail})
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                  <strong>Fecha de registro:</strong> ${formatDate(new Date())}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">
                  <em>Nota: Este correo se envía solo a analista.mantenimiento@partequipos.com debido a restricciones del dominio sandbox de Mailgun.</em>
                </p>
              </div>

              <p style="margin-top: 30px; color: #6b7280;">
                Por favor, revisa esta factura en el sistema y apruébala si corresponde.
              </p>

              ${billData.documentUrl ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>📎 Documento adjunto:</strong> 
                  <a href="${billData.documentUrl}" style="color: #10b981; text-decoration: underline;">
                    ${billData.documentName || 'Ver documento'}
                  </a>
                </p>
              </div>
              ` : ''}

              <div style="margin-top: 20px; text-align: center;">
                <a href="https://app-pagos-rho.vercel.app/bills" 
                   style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Ver en el Sistema
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Este es un correo automático del Sistema de Gestión de Facturas.</p>
              <p>Por favor, no responder a este correo.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    // Nota: Los archivos en Supabase se envían como enlaces en el correo
    // Esto evita problemas de timeout en Vercel serverless con archivos grandes

    // Enviar correo usando API REST de Mailgun
    console.log('📧 Intentando enviar correo con API Mailgun...');
    console.log('📧 Destinatario:', toEmail);
    console.log('📧 Usuario que creó la factura:', userEmail, '(NO se envía CC por restricciones sandbox)');
    console.log('📧 Asunto:', subject);
    
    try {
      console.log('📧 Preparando datos para API Mailgun...');
      const startTime = Date.now();
      
      // Preparar datos para la API de Mailgun
      // NOTA: Solo enviamos a analista.mantenimiento@partequipos.com porque es el único email autorizado en el dominio sandbox
      const messageData = {
        from: `"Sistema de Gestión de Facturas" <${fromEmail}>`,
        to: [toEmail], // Solo a analista.mantenimiento@partequipos.com
        subject: subject,
        html: htmlContent
      };
      
      console.log('📧 Enviando correo con API Mailgun...');
      
      // Enviar usando API REST de Mailgun (más rápido que SMTP)
      const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ Correo enviado exitosamente en ${duration}ms`);
      console.log('✅ Message ID:', result.id);
      console.log('✅ Status:', result.message);
      console.log('✅ Enviado solo a analista.mantenimiento@partequipos.com (dominio sandbox)');
      
      return { success: true, messageId: result.id };
      
    } catch (apiError) {
      console.error('❌ Error al enviar correo con API Mailgun:', apiError);
      console.error('❌ Mensaje del error:', apiError.message);
      console.error('❌ Status:', apiError.status);
      return { success: false, error: apiError.message };
    }

  } catch (error) {
    console.error('❌ Error general al enviar correo:', error);
    console.error('❌ Detalles del error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
};

export default {
  sendNewBillNotification,
  verifyEmailConfig
};

