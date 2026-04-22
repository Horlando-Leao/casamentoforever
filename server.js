import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize libSQL client
const db = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Database initialization
async function createTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        nome1 TEXT,
        nome2 TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        senha TEXT NOT NULL,
        tenant_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(email, tenant_id),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        imagem_url TEXT,
        chave_pix TEXT,
        sites TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Migrations: sincronizar schema do banco com a versão atual
    const tenantsInfo = await db.execute('PRAGMA table_info(tenants)');
    const columnNames = tenantsInfo.rows.map(row => row.name);

    if (!columnNames.includes('nome1')) {
      await db.execute('ALTER TABLE tenants ADD COLUMN nome1 TEXT');
      console.log('✓ Migration: coluna nome1 adicionada à tabela tenants');
    }
    if (!columnNames.includes('nome2')) {
      await db.execute('ALTER TABLE tenants ADD COLUMN nome2 TEXT');
      console.log('✓ Migration: coluna nome2 adicionada à tabela tenants');
    }
    if (columnNames.includes('nome')) {
      await db.execute('ALTER TABLE tenants DROP COLUMN nome');
      console.log('✓ Migration: coluna nome removida da tabela tenants');
    }

    console.log('✓ Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Utility functions
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
console.log('JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + JWT_SECRET)
    .digest('hex');
}

function generateJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${body}.${signature}`;
}

function verifyJWT(token) {
  try {
    const [header, body, signature] = token.split('.');
    
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(`${header}.${body}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload;
  } catch (error) {
    return null;
  }
}

// Auth middleware
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyJWT(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const urlTenant = req.params.tenant;
  if (payload.tenantSlug !== urlTenant) {
    return res.status(403).json({ error: 'Cross-tenant access denied' });
  }
  
  req.user = payload;
  next();
}

// Helper: get tenant by slug
async function getTenantBySlug(slug) {
  const result = await db.execute({
    sql: 'SELECT * FROM tenants WHERE slug = ?',
    args: [slug],
  });
  return result.rows[0];
}

// Helper: get tenant by user email
async function getTenantByUserEmail(email) {
  const result = await db.execute({
    sql: `SELECT t.* FROM tenants t 
          INNER JOIN users u ON t.id = u.tenant_id 
          WHERE u.email = ?`,
    args: [email],
  });
  return result.rows[0];
}

// Helper: get user by id
async function getUserById(userId) {
  const result = await db.execute({
    sql: 'SELECT id, email, tenant_id FROM users WHERE id = ?',
    args: [userId],
  });
  return result.rows[0];
}

// ============ AUTH ROUTES ============

// POST /api/:tenant/auth/register
app.post('/api/:tenant/auth/register', async (req, res) => {
  try {
    const { email, senha, nome1, nome2 } = req.body;
    const tenantSlug = req.params.tenant;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Get or create tenant
    let tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) {
      const insertResult = await db.execute({
        sql: 'INSERT INTO tenants (slug, nome1, nome2) VALUES (?, ?, ?)',
        args: [tenantSlug, nome1 || '', nome2 || ''],
      });
      const tenantId = parseInt(insertResult.lastInsertRowid) || 1;
      tenant = { id: tenantId, slug: tenantSlug, nome1: nome1 || '', nome2: nome2 || '' };
    } else if ((!tenant.nome1 || !tenant.nome2) && (nome1 || nome2)) {
      // Atualiza os nomes caso o tenant já exista mas esteja sem eles
      await db.execute({
        sql: 'UPDATE tenants SET nome1 = ?, nome2 = ? WHERE id = ?',
        args: [nome1 || tenant.nome1 || '', nome2 || tenant.nome2 || '', tenant.id],
      });
      tenant = { ...tenant, nome1: nome1 || tenant.nome1 || '', nome2: nome2 || tenant.nome2 || '' };
    }
    
    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? AND tenant_id = ?',
      args: [email, tenant.id],
    });
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create user
    const hashedPassword = hashPassword(senha);
    const insertResult = await db.execute({
      sql: 'INSERT INTO users (email, senha, tenant_id) VALUES (?, ?, ?)',
      args: [email, hashedPassword, tenant.id],
    });
    
    const userId = parseInt(insertResult.lastInsertRowid) || email;
    const token = generateJWT({
      userId: userId,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      email,
    });
    
    res.status(201).json({
      token,
      tenant: tenant.slug,
      nome1: tenant.nome1 || '',
      nome2: tenant.nome2 || '',
      user: { id: userId, email },
    });
  } catch (error) {
    console.error('Register error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/auth/login (without tenant - discovers tenant from email)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find tenant by user email
    const tenant = await getTenantByUserEmail(email);
    
    if (!tenant) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user
    const userResult = await db.execute({
      sql: 'SELECT id, email, senha FROM users WHERE email = ? AND tenant_id = ?',
      args: [email, tenant.id],
    });
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    const hashedPassword = hashPassword(senha);
    
    if (user.senha !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateJWT({
      userId: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      email: user.email,
    });
    
    res.json({ 
      token, 
      tenant: tenant.slug,
      nome1: tenant.nome1,
      nome2: tenant.nome2,
      user: { id: user.id, email: user.email } 
    });
  } catch (error) {
    console.error('Login error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/:tenant/auth/login
app.post('/api/:tenant/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const tenantSlug = req.params.tenant;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const userResult = await db.execute({
      sql: 'SELECT id, email, senha FROM users WHERE email = ? AND tenant_id = ?',
      args: [email, tenant.id],
    });
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    const hashedPassword = hashPassword(senha);
    
    if (user.senha !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateJWT({
      userId: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      email: user.email,
    });
    
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// GET /api/:tenant/auth/me
app.get('/api/:tenant/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// ============ GIFTS ROUTES ============

// GET /api/:tenant/gifts
app.get('/api/:tenant/gifts', authMiddleware, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM gifts WHERE tenant_id = ? AND user_id = ? ORDER BY created_at DESC',
      args: [req.user.tenantId, req.user.userId],
    });
    
    const gifts = result.rows.map(gift => ({
      ...gift,
      sites: JSON.parse(gift.sites || '[]'),
    }));
    
    res.json({ gifts });
  } catch (error) {
    console.error('Get gifts error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/:tenant/gifts
app.post('/api/:tenant/gifts', authMiddleware, async (req, res) => {
  try {
    const { nome, imagem_url, chave_pix, sites } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Gift name required' });
    }
    
    const sitesJSON = JSON.stringify(sites || []);
    
    const insertResult = await db.execute({
      sql: 'INSERT INTO gifts (tenant_id, user_id, nome, imagem_url, chave_pix, sites) VALUES (?, ?, ?, ?, ?, ?)',
      args: [req.user.tenantId, req.user.userId, nome, imagem_url || null, chave_pix || null, sitesJSON],
    });
    
    const gift = {
      id: Number(insertResult.lastInsertRowid),
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      nome,
      imagem_url: imagem_url || null,
      chave_pix: chave_pix || null,
      sites: sites || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    res.status(201).json({ gift });
  } catch (error) {
    console.error('Create gift error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// GET /api/:tenant/gifts/:id
app.get('/api/:tenant/gifts/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ? AND tenant_id = ? AND user_id = ?',
      args: [req.params.id, req.user.tenantId, req.user.userId],
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    const gift = {
      ...result.rows[0],
      sites: JSON.parse(result.rows[0].sites || '[]'),
    };
    
    res.json({ gift });
  } catch (error) {
    console.error('Get gift error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// PUT /api/:tenant/gifts/:id
app.put('/api/:tenant/gifts/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, imagem_url, chave_pix, sites } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Gift name required' });
    }
    
    const sitesJSON = JSON.stringify(sites || []);
    const now = new Date().toISOString();
    
    await db.execute({
      sql: 'UPDATE gifts SET nome = ?, imagem_url = ?, chave_pix = ?, sites = ?, updated_at = ? WHERE id = ? AND tenant_id = ? AND user_id = ?',
      args: [nome, imagem_url || null, chave_pix || null, sitesJSON, now, req.params.id, req.user.tenantId, req.user.userId],
    });
    
    const result = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ?',
      args: [req.params.id],
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    const gift = {
      ...result.rows[0],
      sites: JSON.parse(result.rows[0].sites || '[]'),
    };
    
    res.json({ gift });
  } catch (error) {
    console.error('Update gift error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// DELETE /api/:tenant/gifts/:id
app.delete('/api/:tenant/gifts/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id FROM gifts WHERE id = ? AND tenant_id = ? AND user_id = ?',
      args: [req.params.id, req.user.tenantId, req.user.userId],
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    await db.execute({
      sql: 'DELETE FROM gifts WHERE id = ?',
      args: [req.params.id],
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete gift error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html');
  });
}

// Start server
async function start() {
  try {
    await createTables();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
