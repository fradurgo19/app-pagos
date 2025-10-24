import nodemailer from 'nodemailer';

// Configuración del transportador de correo - OUTLOOK/Office365
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'analista.mantenimiento@partequipos.com',
    pass: process.env.EMAIL_PASSWORD || 'Fradurgo19.$'
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

// Verificar configuración del transportador
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor de correo configurado correctamente');
    console.log('📧 Correos se enviarán desde:', process.env.EMAIL_USER);
    console.log('📬 Correos llegarán a:', process.env.EMAIL_TO);
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de correo:', error.message);
    console.log('');
    console.log('⚠️  El sistema funcionará, pero NO enviará correos.');
    console.log('');
    console.log('💡 Soluciones para Outlook:');
    console.log('   1. Verifica que EMAIL_USER y EMAIL_PASSWORD sean correctos en backend/.env');
    console.log('   2. Asegúrate de usar la contraseña correcta de Outlook');
    console.log('   3. Si usas autenticación en 2 pasos, genera una contraseña de aplicación:');
    console.log('      → https://account.microsoft.com/security');
    console.log('');
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
    console.log('📧 Iniciando envío de correo...');
    console.log('📧 Usuario:', userName, userEmail);
    console.log('📧 EMAIL_USER configurado:', process.env.EMAIL_USER ? 'Sí' : 'No');
    console.log('📧 EMAIL_PASSWORD configurado:', process.env.EMAIL_PASSWORD ? 'Sí' : 'No');
    
    // Preparar datos del correo
    const mailOptions = {
      from: {
        name: 'Sistema de Gestión de Facturas',
        address: process.env.EMAIL_USER || 'analista.mantenimiento@partequipos.com'
      },
      to: 'fherrera@partequipos.com',
      cc: userEmail, // Copia al usuario que creó la factura
      subject: `Nueva Factura Registrada - ${billData.invoiceNumber || 'Sin número'} - ${translateServiceType(billData.serviceType)}`,
      html: `
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
              </div>

              <p style="margin-top: 30px; color: #6b7280;">
                Por favor, revisa esta factura en el sistema y apruébala si corresponde.
              </p>

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
      `
    };

    // Agregar adjunto si existe (URL de Supabase)
    if (attachmentPath) {
      mailOptions.attachments = [{
        filename: billData.documentName || 'factura.pdf',
        path: attachmentPath, // URL pública de Supabase
        href: attachmentPath
      }];
    }

    // Enviar correo
    console.log('📧 Intentando enviar correo...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente:', info.messageId);
    console.log('✅ Respuesta del servidor:', info.response);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    console.error('❌ Detalles del error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
};

export default {
  sendNewBillNotification,
  verifyEmailConfig
};

