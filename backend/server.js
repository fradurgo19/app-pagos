import express from 'express';
import cors from 'cors';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Secret para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro-cambiar-en-produccion';

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

    // Verificar credenciales usando la función SQL
    const result = await pool.query(
      'SELECT * FROM verify_credentials($1, $2)',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { user_id, role, full_name } = result.rows[0];

    // Obtener datos completos del usuario
    const userData = await pool.query(
      'SELECT id, email, full_name, role, department, location FROM profiles WHERE id = $1',
      [user_id]
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
    const result = await pool.query(
      'SELECT id, email, full_name, role, department, location, created_at, updated_at FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

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
    res.json(result.rows);

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

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

// Crear factura
app.post('/api/bills', authenticateToken, async (req, res) => {
  try {
    const bill = req.body;

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
        bill.serviceType,
        bill.provider,
        bill.description,
        bill.value,
        bill.period,
        bill.invoiceNumber,
        bill.totalAmount,
        bill.consumption,
        bill.unitOfMeasure,
        bill.costCenter,
        bill.location,
        bill.dueDate,
        bill.documentUrl,
        bill.documentName,
        bill.status || 'draft',
        bill.notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ error: 'Error al crear factura' });
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

    res.json(result.rows[0]);
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

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al aprobar factura:', error);
    res.status(500).json({ error: 'Error al aprobar factura' });
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: PostgreSQL Local`);
  console.log(`🔐 Autenticación: JWT`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await pool.end();
  process.exit(0);
});

