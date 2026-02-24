import express from 'express';
import cors from 'cors';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { sendNewBillNotification, verifyEmailConfig } from './emailService.js';
import { uploadToSupabase, supabaseDb } from './supabaseClient.js';

// Para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno (busca .env en la raíz del proyecto)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Multer para upload de archivos en memoria (para Supabase)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceptar solo PDF, JPG, PNG
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG y PNG.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

// Configuración de PostgreSQL con SSL para Supabase
const isProduction = process.env.NODE_ENV === 'production';

// Configuración explícita para evitar problemas de parsing del connection string
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    };

const pool = new pg.Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Helper: obtener consumos por lista de facturas
const fetchConsumptionsByBillIds = async (billIds) => {
  if (!billIds || billIds.length === 0) return [];
  const { data, error } = await supabaseDb
    .from('bill_consumptions')
    .select('*')
    .in('bill_id', billIds);

  if (error) {
    console.error('Error al obtener consumos:', error);
    throw error;
  }

  return data || [];
};

// Secret para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro-cambiar-en-produccion';

// Función para convertir consumos a camelCase
const transformConsumptionToFrontend = (row) => ({
  id: row.id,
  billId: row.bill_id,
  serviceType: row.service_type,
  provider: row.provider,
  periodFrom: row.period_from,
  periodTo: row.period_to,
  value: Number.parseFloat(row.value) || 0,
  totalAmount: Number.parseFloat(row.total_amount) || 0,
  consumption: row.consumption ? Number.parseFloat(row.consumption) : null,
  unitOfMeasure: row.unit_of_measure,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Función para convertir snake_case a camelCase
const transformBillToFrontend = (row, consumptions = []) => ({
  id: row.id,
  user_id: row.user_id,
  serviceType: row.service_type,
  provider: row.provider,
  description: row.description,
  value: Number.parseFloat(row.value) || 0,
  period: row.period,
  invoiceNumber: row.invoice_number,
  contractNumber: row.contract_number,
  totalAmount: Number.parseFloat(row.total_amount) || 0,
  consumption: row.consumption ? Number.parseFloat(row.consumption) : null,
  unitOfMeasure: row.unit_of_measure,
  costCenter: row.cost_center,
  location: row.location,
  dueDate: row.due_date,  // ← IMPORTANTE: Convertir a camelCase
  documentUrl: row.document_url,
  documentName: row.document_name,
  status: row.status,
  notes: row.notes,
  approvedBy: row.approved_by,
  approvedAt: row.approved_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  consumptions
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// Registro de usuario
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName, location } = req.body;

  try {
    // Validaciones
    if (!email || !password || !fullName || !location) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Registrar usuario usando la función SQL
    const result = await pool.query(
      'SELECT register_user($1, $2, $3, $4) as user_id',
      [email, password, fullName, location]
    );

    const userId = result.rows[0].user_id;

    // Obtener datos completos del usuario
    const userData = await pool.query(
      'SELECT id, email, full_name, role, department, location FROM profiles WHERE id = $1',
      [userId]
    );

    const user = userData.rows[0];

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department,
        location: user.location
      },
      token
    });

  } catch (error) {
    console.error('Error en signup:', error);
    res.status(500).json({ error: 'Error al crear usuario: ' + error.message });
  }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Usar Supabase client para obtener usuario
    const { data: users, error: queryError } = await supabaseDb
      .from('profiles')
      .select('id, email, full_name, role, department, location, password_hash')
      .eq('email', email)
      .single();

    console.log('Usuario encontrado:', users ? 'Sí' : 'No');

    if (queryError || !users) {
      console.log('Error query:', queryError);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar password usando rpc de Supabase con la función verify_password
    const { data: isValid, error: rpcError } = await supabaseDb
      .rpc('check_password', { 
        user_email: email, 
        user_password: password 
      });

    console.log('Password válido:', isValid);
    console.log('Error RPC:', rpcError);

    if (rpcError || !isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Datos completos del usuario
    const userData = { rows: [users] };

    const user = userData.rows[0];

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department,
        location: user.location
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
  }
});

// Obtener perfil del usuario autenticado
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    // Usar Supabase client para evitar problemas SASL
    const { data: user, error } = await supabaseDb
      .from('profiles')
      .select('id, email, full_name, role, department, location, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      console.error('Error getting profile:', error);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      location: user.location,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Cerrar sesión (opcional - en JWT el token simplemente expira)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // En una implementación más robusta, podrías invalidar el token en una lista negra
  res.json({ message: 'Sesión cerrada exitosamente' });
});

// ============================================
// RUTAS DE FACTURAS (BILLS)
// ============================================

// Obtener todas las facturas del usuario
app.get('/api/bills', authenticateToken, async (req, res) => {
  try {
    const { period, serviceType, location, status, search } = req.query;
    
    // Obtener rol del usuario
    const { data: userProfile } = await supabaseDb
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    
    // Usar Supabase client para evitar problemas SASL
    let query = supabaseDb
      .from('utility_bills')
      .select('*');
    
    // Si NO es coordinador, filtrar por user_id
    if (userProfile?.role !== 'area_coordinator') {
      query = query.eq('user_id', req.user.id);
    }

    if (period) {
      query = query.eq('period', period);
    }

    if (serviceType && serviceType !== 'all') {
      query = query.eq('service_type', serviceType);
    }

    if (location && location !== 'all') {
      query = query.eq('location', location);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,description.ilike.%${search}%,provider.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: bills, error } = await query;

    if (error) {
      console.error('Error al obtener facturas:', error);
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }

    const result = { rows: bills || [] };

    const billIds = result.rows.map((b) => b.id);
    const consumptions = await fetchConsumptionsByBillIds(billIds);
    const consumptionsByBill = consumptions.reduce((acc, item) => {
      acc[item.bill_id] = acc[item.bill_id] || [];
      acc[item.bill_id].push(transformConsumptionToFrontend(item));
      return acc;
    }, {});
    
    // Transformar datos a camelCase para el frontend
    const transformedBills = result.rows.map((row) =>
      transformBillToFrontend(row, consumptionsByBill[row.id] || [])
    );
    
    if (transformedBills.length > 0) {
      console.log('📤 Primera factura transformada:', JSON.stringify(transformedBills[0], null, 2));
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(transformedBills);

  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Obtener factura por ID (Supabase para evitar SASL en entornos serverless)
app.get('/api/bills/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: billRow, error: billError } = await supabaseDb
      .from('utility_bills')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (billError || !billRow) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const { data: consumptionsData, error: consumptionsError } = await supabaseDb
      .from('bill_consumptions')
      .select('*')
      .eq('bill_id', id);

    if (consumptionsError) {
      console.error('Error al obtener consumos:', consumptionsError);
      return res.status(500).json({ error: 'Error al obtener consumos' });
    }

    const consumptions = (consumptionsData || []).map(transformConsumptionToFrontend);
    res.json(transformBillToFrontend(billRow, consumptions));
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

// Crear factura
app.post('/api/bills', authenticateToken, async (req, res) => {
  try {
    const bill = req.body;

    console.log('📝 Datos recibidos para crear factura:', JSON.stringify(bill, null, 2));

    const consumptions = Array.isArray(bill.consumptions) ? bill.consumptions : [];
    if (consumptions.length === 0) {
      return res.status(400).json({ error: 'Debe agregar al menos un consumo para la factura' });
    }

    const totalValue = consumptions.reduce((sum, c) => sum + (Number.parseFloat(c.value) || 0), 0);
    const totalAmount = consumptions.reduce((sum, c) => sum + (Number.parseFloat(c.totalAmount) || 0), 0);
    const totalConsumption = consumptions.reduce((sum, c) => sum + (Number.parseFloat(c.consumption) || 0), 0);
    const firstConsumption = consumptions[0];

    // Normalizar datos (soportar camelCase y snake_case)
    const normalizedBill = {
      serviceType: bill.serviceType || bill.service_type || firstConsumption?.serviceType,
      provider: bill.provider || firstConsumption?.provider,
      description: bill.description,
      value: totalValue,
      period: bill.period,
      invoiceNumber: bill.invoiceNumber || bill.invoice_number,
      contractNumber: bill.contractNumber || bill.contract_number,
      totalAmount: bill.totalAmount || bill.total_amount || totalAmount,
      consumption: totalConsumption,
      unitOfMeasure: bill.unitOfMeasure || bill.unit_of_measure || firstConsumption?.unitOfMeasure,
      costCenter: bill.costCenter || bill.cost_center,
      location: bill.location,
      dueDate: bill.dueDate || bill.due_date,
      documentUrl: bill.documentUrl || bill.document_url,
      documentName: bill.documentName || bill.document_name,
      status: bill.status || 'draft',
      notes: bill.notes
    };

    console.log('📝 Datos normalizados:', JSON.stringify(normalizedBill, null, 2));

    // Usar Supabase client para evitar problemas SASL
    const { data: createdBill, error } = await supabaseDb
      .from('utility_bills')
      .insert({
        user_id: req.user.id,
        service_type: normalizedBill.serviceType,
        provider: normalizedBill.provider,
        description: normalizedBill.description,
        value: normalizedBill.value,
        period: normalizedBill.period,
        invoice_number: normalizedBill.invoiceNumber,
        contract_number: normalizedBill.contractNumber,
        total_amount: normalizedBill.totalAmount,
        consumption: normalizedBill.consumption,
        unit_of_measure: normalizedBill.unitOfMeasure,
        cost_center: normalizedBill.costCenter,
        location: normalizedBill.location,
        due_date: normalizedBill.dueDate,
        document_url: normalizedBill.documentUrl,
        document_name: normalizedBill.documentName,
        status: normalizedBill.status,
        notes: normalizedBill.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear factura:', error);
      return res.status(500).json({ error: 'Error al crear factura' });
    }

    // Insertar consumos asociados
    const consumptionsPayload = consumptions.map((c) => ({
      bill_id: createdBill.id,
      service_type: c.serviceType || c.service_type,
      provider: c.provider,
      period_from: c.periodFrom || c.period_from,
      period_to: c.periodTo || c.period_to,
      value: Number.parseFloat(c.value),
      total_amount: Number.parseFloat(c.totalAmount),
      consumption: c.consumption ? Number.parseFloat(c.consumption) : null,
      unit_of_measure: c.unitOfMeasure || c.unit_of_measure
    }));

    const { data: createdConsumptions, error: consumptionsError } = await supabaseDb
      .from('bill_consumptions')
      .insert(consumptionsPayload)
      .select();

    if (consumptionsError) {
      console.error('Error al crear consumos:', consumptionsError);
      return res.status(500).json({ error: 'Error al crear consumos' });
    }

    console.log('✅ Factura creada en BD:', JSON.stringify(createdBill, null, 2));
    
    const result = { rows: [createdBill] };
    
    // Transformar a camelCase antes de enviar al frontend
    const transformedBill = transformBillToFrontend(
      result.rows[0],
      (createdConsumptions || []).map(transformConsumptionToFrontend)
    );
    console.log('📤 Factura transformada para frontend:', JSON.stringify(transformedBill, null, 2));
    
    // Enviar notificación por correo (no bloqueante)
    // Obtener datos del usuario que creó la factura usando Supabase
    console.log('📧 Intentando obtener datos del usuario para correo...');
    console.log('📧 User ID:', req.user.id);
    
    const { data: userData, error: userError } = await supabaseDb
      .from('profiles')
      .select('email, full_name')
      .eq('id', req.user.id)
      .single();

    console.log('📧 Resultado de consulta Supabase:');
    console.log('📧 Data:', userData);
    console.log('📧 Error:', userError);

    if (!userError && userData) {
      const userEmail = userData.email;
      const userName = userData.full_name;

      console.log(`✅ Datos del usuario obtenidos: ${userEmail} - ${userName}`);

      // Preparar URL del archivo adjunto si existe (Supabase)
      let attachmentPath = normalizedBill.documentUrl || null;

      // Enviar correo de forma asíncrona (no bloquea la respuesta)
      // Fire-and-forget: ejecutar sin esperar resultado
      const emailStartTime = Date.now();
      sendNewBillNotification(transformedBill, userEmail, userName, attachmentPath)
        .then(result => {
          const emailDuration = Date.now() - emailStartTime;
          if (result.success) {
            console.log(`✅ Correo enviado exitosamente en ${emailDuration}ms`);
            console.log(`✅ Correo enviado a fherrera@partequipos.com y ${userEmail}`);
          } else {
            console.error(`❌ Error al enviar correo (después de ${emailDuration}ms):`, result.error);
          }
        })
        .catch(error => {
          const emailDuration = Date.now() - emailStartTime;
          console.error(`❌ Error al enviar correo (después de ${emailDuration}ms):`, error);
        });
    } else {
      console.error('❌ Error al obtener datos del usuario para correo:', userError);
      console.error('❌ Detalles del error:', JSON.stringify(userError, null, 2));
    }
    
    res.status(201).json(transformedBill);
  } catch (error) {
    console.error('❌ Error al crear factura:', error);
    res.status(500).json({ error: 'Error al crear factura: ' + error.message });
  }
});

// Actualizar factura
app.put('/api/bills/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const incomingConsumptions = Array.isArray(updates.consumptions) ? updates.consumptions : null;
    if (incomingConsumptions && incomingConsumptions.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un consumo' });
    }

    if (incomingConsumptions && incomingConsumptions.length > 0) {
      const totalValue = incomingConsumptions.reduce((sum, c) => sum + (Number.parseFloat(c.value) || 0), 0);
      const totalAmount = incomingConsumptions.reduce((sum, c) => sum + (Number.parseFloat(c.totalAmount) || 0), 0);
      const totalConsumption = incomingConsumptions.reduce((sum, c) => sum + (Number.parseFloat(c.consumption) || 0), 0);
      const first = incomingConsumptions[0];
      updates.serviceType = updates.serviceType || updates.service_type || first?.serviceType;
      updates.provider = updates.provider || first?.provider;
      updates.value = totalValue;
      updates.totalAmount = totalAmount;
      updates.consumption = totalConsumption;
      updates.unitOfMeasure = updates.unitOfMeasure || first?.unitOfMeasure;
    }

    const rawPayload = {
      service_type: updates.serviceType,
      provider: updates.provider,
      description: updates.description,
      value: updates.value,
      period: updates.period,
      invoice_number: updates.invoiceNumber,
      contract_number: updates.contractNumber,
      total_amount: updates.totalAmount,
      consumption: updates.consumption,
      unit_of_measure: updates.unitOfMeasure,
      cost_center: updates.costCenter,
      location: updates.location,
      due_date: updates.dueDate,
      document_url: updates.documentUrl,
      document_name: updates.documentName,
      status: updates.status,
      notes: updates.notes,
      approved_by: updates.approvedBy,
      approved_at: updates.approvedAt
    };
    const updatePayload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, v]) => v !== undefined)
    );

    const { data: updatedRow, error: updateError } = await supabaseDb
      .from('utility_bills')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (updateError || !updatedRow) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Si vienen consumos, reemplazar los existentes
    if (incomingConsumptions) {
      const { error: deleteError } = await supabaseDb
        .from('bill_consumptions')
        .delete()
        .eq('bill_id', id);
      if (deleteError) {
        console.error('Error al limpiar consumos:', deleteError);
      }

      const payload = incomingConsumptions.map((c) => ({
        bill_id: id,
        service_type: c.serviceType || c.service_type,
        provider: c.provider,
        period_from: c.periodFrom || c.period_from,
        period_to: c.periodTo || c.period_to,
        value: Number.parseFloat(c.value),
        total_amount: Number.parseFloat(c.totalAmount),
        consumption: c.consumption ? Number.parseFloat(c.consumption) : null,
        unit_of_measure: c.unitOfMeasure || c.unit_of_measure
      }));

      const { data: newConsumptions, error: insertError } = await supabaseDb
        .from('bill_consumptions')
        .insert(payload)
        .select();

      if (insertError) {
        console.error('Error al insertar nuevos consumos:', insertError);
      }

      const consumptions = (newConsumptions || []).map(transformConsumptionToFrontend);
      return res.json(transformBillToFrontend(updatedRow, consumptions));
    }

    res.json(transformBillToFrontend(updatedRow));
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

// Eliminar factura
app.delete('/api/bills/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM utility_bills WHERE id = $1 AND user_id = $2 AND status = $3 RETURNING id',
      [id, req.user.id, 'draft']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada o no se puede eliminar' });
    }

    res.json({ message: 'Factura eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

async function bulkDeleteBillsCount(userId, idList) {
  const { data: rpcRows, error: rpcError } = await supabaseDb.rpc('bulk_delete_utility_bills', {
    p_user_id: userId,
    p_ids: idList
  });
  if (!rpcError && rpcRows != null && Array.isArray(rpcRows)) return rpcRows.length;

  if (rpcError) console.warn('bulk-delete RPC:', rpcError.message, rpcError.code);

  const { data: directRows, error: directError } = await supabaseDb
    .from('utility_bills')
    .delete()
    .eq('user_id', userId)
    .in('id', idList)
    .select('id');
  if (directError) console.warn('bulk-delete direct:', directError.message);
  if (!directError && directRows != null && Array.isArray(directRows)) return directRows.length;

  return 0;
}

app.post('/api/bills/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'IDs inválidos' });

    const idList = ids.map((id) => (typeof id === 'string' ? id.trim() : String(id))).filter(Boolean);
    if (idList.length === 0) return res.status(400).json({ error: 'IDs inválidos' });

    const deletedCount = await bulkDeleteBillsCount(userId, idList);

    if (deletedCount === 0) {
      return res.status(403).json({
        error: 'No se pudieron eliminar las facturas. Ejecute en Supabase (SQL Editor) la migración 20260225120000_bulk_delete_bills_rpc_text_array.sql o configure SUPABASE_SERVICE_KEY en Vercel.'
      });
    }

    res.json({ message: `${deletedCount} facturas eliminadas`, deletedCount });
  } catch (err) {
    console.error('Error al eliminar facturas:', err.message || err, err.code);
    res.status(500).json({
      error: 'Error al eliminar facturas',
      ...(process.env.NODE_ENV !== 'production' && { detail: err.message })
    });
  }
});

// Upload de archivo
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Subir a Supabase Storage
    const result = await uploadToSupabase(req.file, req.user.id);
    
    console.log('📎 Archivo subido a Supabase:', {
      originalName: req.file.originalname,
      url: result.url,
      size: req.file.size
    });

    res.json({
      url: result.url,
      filename: result.filename,
      size: req.file.size,
      path: result.path
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error al subir archivo: ' + error.message });
  }
});

// Descargar archivo
app.get('/api/download/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Enviar archivo
    res.download(filePath);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
});

// Aprobar factura (solo coordinadores)
app.post('/api/bills/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es coordinador
    const userCheck = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para aprobar facturas' });
    }

    const result = await pool.query(
      `UPDATE utility_bills SET
        status = 'approved',
        approved_by = $1,
        approved_at = NOW()
      WHERE id = $2
      RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(transformBillToFrontend(result.rows[0]));
  } catch (error) {
    console.error('Error al aprobar factura:', error);
    res.status(500).json({ error: 'Error al aprobar factura' });
  }
});

// Actualizar estado de factura (solo administradores)
app.patch('/api/bills/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar que es coordinador usando Supabase
    const { data: userCheck, error: userError } = await supabaseDb
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (userError || !userCheck || userCheck.role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar estados de facturas' });
    }

    // Validar estado (solo pendiente o aprobada)
    const validStatuses = ['pending', 'approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Solo se permite "pending" o "approved"' });
    }

    // Actualizar usando Supabase
    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approved_by = req.user.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { data: updatedBill, error } = await supabaseDb
      .from('utility_bills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedBill) {
      console.error('Error al actualizar estado:', error);
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const result = { rows: [updatedBill] };

    res.json(transformBillToFrontend(result.rows[0]));
  } catch (error) {
    console.error('Error al actualizar estado de factura:', error);
    res.status(500).json({ error: 'Error al actualizar estado de factura' });
  }
});

// ============================================
// RUTAS DE USUARIOS (solo administradores)
// ============================================

// Listar todos los usuarios (solo coordinadores)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Verificar que es coordinador usando Supabase
    const { data: userCheck, error: userError } = await supabaseDb
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (userError || !userCheck || userCheck.role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para ver usuarios' });
    }

    const { data: users, error } = await supabaseDb
      .from('profiles')
      .select('id, email, full_name, role, department, location, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    const transformedUsers = users.map(row => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      department: row.department,
      location: row.location,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario (solo coordinadores)
app.post('/api/users/create', authenticateToken, async (req, res) => {
  try {
    const { email, password, fullName, location, department, role } = req.body;

    // Verificar que es coordinador usando Supabase
    const { data: userCheck, error: userError } = await supabaseDb
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (userError || !userCheck || userCheck.role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para crear usuarios' });
    }

    // Validar campos requeridos
    if (!email || !password || !fullName || !location) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar que el email no exista
    const { data: existingUser } = await supabaseDb
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear usuario usando RPC con función que maneja crypt
    const { data: newUser, error: createError } = await supabaseDb
      .rpc('create_user_with_password', {
        user_email: email,
        user_password: password,
        user_full_name: fullName,
        user_role: role || 'basic_user',
        user_location: location,
        user_department: department || ''
      });

    if (createError || !newUser || newUser.length === 0) {
      console.error('Error al crear usuario:', createError);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }

    const userData = newUser[0];
    const transformedUser = {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      role: userData.role,
      location: userData.location,
      department: userData.department,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };

    res.status(201).json(transformedUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario (solo coordinadores)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, location, department, role, password } = req.body;

    // Verificar que es coordinador
    const userCheck = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar usuarios' });
    }

    // Validar campos requeridos
    if (!fullName || !location) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Construir query de actualización
    let query;
    let params;

    if (password) {
      // Si se proporciona nueva contraseña, actualizarla también
      query = `UPDATE profiles SET 
        full_name = $1, 
        location = $2, 
        department = $3, 
        role = $4,
        password_hash = crypt($5, gen_salt('bf')),
        updated_at = NOW()
      WHERE id = $6
      RETURNING id, email, full_name, role, location, department, created_at, updated_at`;
      params = [fullName, location, department || '', role || 'basic_user', password, id];
    } else {
      // Sin cambio de contraseña
      query = `UPDATE profiles SET 
        full_name = $1, 
        location = $2, 
        department = $3, 
        role = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING id, email, full_name, role, location, department, created_at, updated_at`;
      params = [fullName, location, department || '', role || 'basic_user', id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      fullName: result.rows[0].full_name,
      role: result.rows[0].role,
      location: result.rows[0].location,
      department: result.rows[0].department,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (solo coordinadores)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que es coordinador
    const userCheck = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios' });
    }

    // No permitir que se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    // Eliminar usuario
    const result = await pool.query(
      'DELETE FROM profiles WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ============================================
// RUTAS DE HEALTH CHECK
// ============================================

app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Endpoint de debug - ver facturas raw
app.get('/api/debug/bills', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM utility_bills WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3',
      [req.user.id]
    );
    
    const raw = result.rows;
    const transformed = result.rows.map(transformBillToFrontend);
    
    res.json({
      raw: raw,
      transformed: transformed,
      comparison: {
        raw_due_date: raw[0]?.due_date,
        transformed_dueDate: transformed[0]?.dueDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: PostgreSQL Local`);
  console.log(`🔐 Autenticación: JWT`);
  
  // Verificar configuración de correo
  await verifyEmailConfig();
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await pool.end();
  process.exit(0);
});

// Export para Vercel serverless
export default app;

