import express from 'express';
import cors from 'cors';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { sendNewBillNotification, verifyEmailConfig } from './emailService.js';
import { uploadToSupabase, supabaseDb } from './supabaseClient.js';

dotenv.config();

// Para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      port: parseInt(process.env.DB_PORT || '5432'),
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

// Secret para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro-cambiar-en-produccion';

// Función para convertir snake_case a camelCase
const transformBillToFrontend = (row) => ({
  id: row.id,
  user_id: row.user_id,
  serviceType: row.service_type,
  provider: row.provider,
  description: row.description,
  value: parseFloat(row.value) || 0,
  period: row.period,
  invoiceNumber: row.invoice_number,
  totalAmount: parseFloat(row.total_amount) || 0,
  consumption: row.consumption ? parseFloat(row.consumption) : null,
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
  updatedAt: row.updated_at
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

    const user_id = users.id;
    const role = users.role;
    const full_name = users.full_name;

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
    
    let query = 'SELECT * FROM utility_bills WHERE user_id = $1';
    const params = [req.user.id];
    let paramCount = 1;

    if (period) {
      paramCount++;
      query += ` AND period = $${paramCount}`;
      params.push(period);
    }

    if (serviceType && serviceType !== 'all') {
      paramCount++;
      query += ` AND service_type = $${paramCount}`;
      params.push(serviceType);
    }

    if (location && location !== 'all') {
      paramCount++;
      query += ` AND location = $${paramCount}`;
      params.push(location);
    }

    if (status && status !== 'all') {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (invoice_number ILIKE $${paramCount} OR description ILIKE $${paramCount} OR provider ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Transformar datos a camelCase para el frontend
    const transformedBills = result.rows.map(transformBillToFrontend);
    
    if (transformedBills.length > 0) {
      console.log('📤 Primera factura transformada:', JSON.stringify(transformedBills[0], null, 2));
    }
    
    res.json(transformedBills);

  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Obtener factura por ID
app.get('/api/bills/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM utility_bills WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(transformBillToFrontend(result.rows[0]));
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

    // Normalizar datos (soportar camelCase y snake_case)
    const normalizedBill = {
      serviceType: bill.serviceType || bill.service_type,
      provider: bill.provider,
      description: bill.description,
      value: bill.value,
      period: bill.period,
      invoiceNumber: bill.invoiceNumber || bill.invoice_number,
      totalAmount: bill.totalAmount || bill.total_amount,
      consumption: bill.consumption,
      unitOfMeasure: bill.unitOfMeasure || bill.unit_of_measure,
      costCenter: bill.costCenter || bill.cost_center,
      location: bill.location,
      dueDate: bill.dueDate || bill.due_date,
      documentUrl: bill.documentUrl || bill.document_url,
      documentName: bill.documentName || bill.document_name,
      status: bill.status || 'draft',
      notes: bill.notes
    };

    console.log('📝 Datos normalizados:', JSON.stringify(normalizedBill, null, 2));

    const result = await pool.query(
      `INSERT INTO utility_bills (
        user_id, service_type, provider, description, value, period,
        invoice_number, total_amount, consumption, unit_of_measure,
        cost_center, location, due_date, document_url, document_name,
        status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.id,
        normalizedBill.serviceType,
        normalizedBill.provider,
        normalizedBill.description,
        normalizedBill.value,
        normalizedBill.period,
        normalizedBill.invoiceNumber,
        normalizedBill.totalAmount,
        normalizedBill.consumption,
        normalizedBill.unitOfMeasure,
        normalizedBill.costCenter,
        normalizedBill.location,
        normalizedBill.dueDate,
        normalizedBill.documentUrl,
        normalizedBill.documentName,
        normalizedBill.status,
        normalizedBill.notes
      ]
    );

    console.log('✅ Factura creada en BD:', JSON.stringify(result.rows[0], null, 2));
    
    // Transformar a camelCase antes de enviar al frontend
    const transformedBill = transformBillToFrontend(result.rows[0]);
    console.log('📤 Factura transformada para frontend:', JSON.stringify(transformedBill, null, 2));
    
    // Enviar notificación por correo (no bloqueante)
    // Obtener datos del usuario que creó la factura
    const userResult = await pool.query(
      'SELECT email, full_name FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length > 0) {
      const userEmail = userResult.rows[0].email;
      const userName = userResult.rows[0].full_name;

      // Preparar URL del archivo adjunto si existe (Supabase)
      let attachmentPath = normalizedBill.documentUrl || null;

      // Enviar correo de forma asíncrona (no bloquea la respuesta)
      sendNewBillNotification(transformedBill, userEmail, userName, attachmentPath)
        .then(result => {
          if (result.success) {
            console.log(`📧 Correo enviado a fherrera@partequipos.com y ${userEmail}`);
          } else {
            console.error('❌ Error al enviar correo:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ Error al enviar correo:', error);
        });
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

    const result = await pool.query(
      `UPDATE utility_bills SET
        service_type = COALESCE($1, service_type),
        provider = COALESCE($2, provider),
        description = COALESCE($3, description),
        value = COALESCE($4, value),
        period = COALESCE($5, period),
        invoice_number = COALESCE($6, invoice_number),
        total_amount = COALESCE($7, total_amount),
        consumption = COALESCE($8, consumption),
        unit_of_measure = COALESCE($9, unit_of_measure),
        cost_center = COALESCE($10, cost_center),
        location = COALESCE($11, location),
        due_date = COALESCE($12, due_date),
        document_url = COALESCE($13, document_url),
        document_name = COALESCE($14, document_name),
        status = COALESCE($15, status),
        notes = COALESCE($16, notes),
        approved_by = COALESCE($17, approved_by),
        approved_at = COALESCE($18, approved_at)
      WHERE id = $19 AND user_id = $20
      RETURNING *`,
      [
        updates.serviceType,
        updates.provider,
        updates.description,
        updates.value,
        updates.period,
        updates.invoiceNumber,
        updates.totalAmount,
        updates.consumption,
        updates.unitOfMeasure,
        updates.costCenter,
        updates.location,
        updates.dueDate,
        updates.documentUrl,
        updates.documentName,
        updates.status,
        updates.notes,
        updates.approvedBy,
        updates.approvedAt,
        id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(transformBillToFrontend(result.rows[0]));
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

// Eliminar múltiples facturas
app.post('/api/bills/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    const result = await pool.query(
      'DELETE FROM utility_bills WHERE id = ANY($1) AND user_id = $2 RETURNING id',
      [ids, req.user.id]
    );

    res.json({ 
      message: `${result.rows.length} facturas eliminadas`,
      deletedCount: result.rows.length
    });
  } catch (error) {
    console.error('Error al eliminar facturas:', error);
    res.status(500).json({ error: 'Error al eliminar facturas' });
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

    // Verificar que es coordinador
    const userCheck = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar estados de facturas' });
    }

    // Validar estado (solo pendiente o aprobada)
    const validStatuses = ['pending', 'approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Solo se permite "pending" o "approved"' });
    }

    // Si el estado es "approved", actualizar también approved_by y approved_at
    let query;
    let params;
    
    if (status === 'approved') {
      query = `UPDATE utility_bills SET
        status = $1,
        approved_by = $2,
        approved_at = NOW()
      WHERE id = $3
      RETURNING *`;
      params = [status, req.user.id, id];
    } else {
      query = `UPDATE utility_bills SET
        status = $1
      WHERE id = $2
      RETURNING *`;
      params = [status, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

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
    // Verificar que es coordinador
    const userCheck = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para ver usuarios' });
    }

    const result = await pool.query(
      'SELECT id, email, full_name, role, department, location, created_at, updated_at FROM profiles ORDER BY created_at DESC'
    );

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      department: row.department,
      location: row.location,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario (solo coordinadores)
app.post('/api/users/create', authenticateToken, async (req, res) => {
  try {
    const { email, password, fullName, location, department, role } = req.body;

    // Verificar que es coordinador
    const userCheck = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'area_coordinator') {
      return res.status(403).json({ error: 'No tienes permisos para crear usuarios' });
    }

    // Validar campos requeridos
    if (!email || !password || !fullName || !location) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar que el email no exista
    const existingUser = await pool.query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO profiles (email, password_hash, full_name, role, location, department)
       VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6)
       RETURNING id, email, full_name, role, location, department, created_at, updated_at`,
      [email, password, fullName, role || 'basic_user', location, department || '']
    );

    const newUser = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      fullName: result.rows[0].full_name,
      role: result.rows[0].role,
      location: result.rows[0].location,
      department: result.rows[0].department,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json(newUser);
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

