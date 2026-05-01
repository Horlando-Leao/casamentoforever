import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize libSQL client
// 1. Definimos a URL baseada no ambiente
const dbUrl = process.env.DATABASE_URL || 'file:local.db';
const isLocal = dbUrl.startsWith('file:');

// 2. O 'if' agora apenas loga e a variável já está pronta
if (isLocal) {
  console.log("🏠 Rodando localmente:", dbUrl);
} else {
  console.log("☁️ Conectado à nuvem:", dbUrl);
}

// 3. Criamos o cliente usando a variável já tratada
const db = createClient({
  url: dbUrl,
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
        preco REAL,
        sites TEXT DEFAULT '[]',
        reserved_by_name TEXT,
        reserved_by_whatsapp TEXT,
        reserved_at TEXT,
        received_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER,
        user_id INTEGER,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS event_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL UNIQUE,
        endereco TEXT,
        horario TEXT,
        data_evento TEXT,
        dress_code TEXT,
        observacoes TEXT,
        contato_telefone TEXT,
        google_maps_url TEXT,
        qr_token TEXT UNIQUE NOT NULL,
        criado_em TEXT DEFAULT (datetime('now')),
        atualizado_em TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
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

    const giftsInfo = await db.execute('PRAGMA table_info(gifts)');
    const giftCols = giftsInfo.rows.map(r => r.name);
    if (!giftCols.includes('reserved_by_name')) {
      await db.execute('ALTER TABLE gifts ADD COLUMN reserved_by_name TEXT');
      await db.execute('ALTER TABLE gifts ADD COLUMN reserved_by_whatsapp TEXT');
      await db.execute('ALTER TABLE gifts ADD COLUMN reserved_at TEXT');
      console.log('✓ Migration: colunas de reserva adicionadas à tabela gifts');
    }

    if (!giftCols.includes('preco')) {
      await db.execute('ALTER TABLE gifts ADD COLUMN preco REAL');
      console.log('✓ Migration: coluna preco adicionada à tabela gifts');
    }
    
    if (!giftCols.includes('received_at')) {
      await db.execute('ALTER TABLE gifts ADD COLUMN received_at TEXT');
      console.log('✓ Migration: coluna received_at adicionada à tabela gifts');
    }

    if (!giftCols.includes('descricao')) {
      await db.execute('ALTER TABLE gifts ADD COLUMN descricao TEXT');
      console.log('✓ Migration: coluna descricao adicionada à tabela gifts');
    }

    const eventInfo = await db.execute('PRAGMA table_info(event_details)');
    const eventCols = eventInfo.rows.map(r => r.name);
    if (eventCols.length > 0) {
      if (!eventCols.includes('contato_telefone')) {
        await db.execute('ALTER TABLE event_details ADD COLUMN contato_telefone TEXT');
        console.log('✓ Migration: coluna contato_telefone adicionada à tabela event_details');
      }
      if (!eventCols.includes('google_maps_url')) {
        await db.execute('ALTER TABLE event_details ADD COLUMN google_maps_url TEXT');
        console.log('✓ Migration: coluna google_maps_url adicionada à tabela event_details');
      }
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

// Audit logger
async function audit(tenantId, userId, action, entity, entityId) {
  try {
    await db.execute({
      sql: 'INSERT INTO audit_logs (tenant_id, user_id, action, entity, entity_id) VALUES (?, ?, ?, ?, ?)',
      args: [tenantId || null, userId || null, action, entity, String(entityId || '')],
    });
  } catch (error) {
    console.error('Audit error:', error);
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

// GET /api/:tenant/public/gifts
app.get('/api/:tenant/public/gifts', async (req, res) => {
  try {
    const tenantSlug = req.params.tenant;
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const result = await db.execute({
      sql: 'SELECT * FROM gifts WHERE tenant_id = ? ORDER BY created_at DESC',
      args: [tenant.id]
    });

    const gifts = result.rows.map(gift => {
      const isReserved = !!gift.reserved_by_whatsapp;
      return {
        id: gift.id,
        nome: gift.nome,
        descricao: gift.descricao,
        imagem_url: gift.imagem_url,
        preco: gift.preco,
        sites: isReserved ? [] : JSON.parse(gift.sites || '[]'),
        reserved: isReserved,
      };
    });

    res.json({ gifts });
  } catch (error) {
    console.error('Get public gifts error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/:tenant/public/gifts/:id/reserve
app.post('/api/:tenant/public/gifts/:id/reserve', async (req, res) => {
  try {
    const { nome, whatsapp } = req.body;
    const { tenant: tenantSlug, id: giftId } = req.params;

    if (!nome || !whatsapp) {
      return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
    }

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    // Verificar se o presente já está reservado
    const giftRes = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ? AND tenant_id = ?',
      args: [giftId, tenant.id]
    });

    if (giftRes.rows.length === 0) return res.status(404).json({ error: 'Gift not found' });
    const gift = giftRes.rows[0];

    if (gift.reserved_by_whatsapp) {
      return res.status(409).json({ error: 'Presente já reservado' });
    }

    // Verificar se o usuário já reservou outro presente neste tenant
    const existingRes = await db.execute({
      sql: 'SELECT id FROM gifts WHERE tenant_id = ? AND reserved_by_whatsapp = ?',
      args: [tenant.id, whatsapp]
    });

    if (existingRes.rows.length > 0) {
      return res.status(403).json({ error: 'Você só pode reservar um presente' });
    }

    // Reservar
    await db.execute({
      sql: 'UPDATE gifts SET reserved_by_name = ?, reserved_by_whatsapp = ?, reserved_at = ? WHERE id = ?',
      args: [nome, whatsapp, new Date().toISOString(), giftId]
    });

    await audit(tenant.id, null, 'RESERVE_GIFT', 'gifts', giftId);

    // Retornar presente com os links de compra/pix para o usuário concluir o presente
    const updatedRes = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ?',
      args: [giftId]
    });
    
    const updatedGift = {
      ...updatedRes.rows[0],
      sites: JSON.parse(updatedRes.rows[0].sites || '[]'),
      reserved: true
    };

    res.json({ gift: updatedGift });
  } catch (error) {
    console.error('Reserve gift error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

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

// GET /api/:tenant/gifts/received
app.get('/api/:tenant/gifts/received', authMiddleware, async (req, res) => {
  try {
    // Busca presentes que foram reservados
    const result = await db.execute({
      sql: 'SELECT * FROM gifts WHERE tenant_id = ? AND reserved_by_whatsapp IS NOT NULL ORDER BY reserved_at DESC',
      args: [req.user.tenantId],
    });
    
    const gifts = result.rows.map(gift => ({
      ...gift,
      sites: JSON.parse(gift.sites || '[]'),
      status: gift.received_at ? 'received' : 'reserved',
    }));
    
    res.json({ gifts });
  } catch (error) {
    console.error('Get received gifts error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// PUT /api/:tenant/gifts/:id/accept
app.put('/api/:tenant/gifts/:id/accept', authMiddleware, async (req, res) => {
  try {
    const giftRes = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ? AND tenant_id = ?',
      args: [req.params.id, req.user.tenantId]
    });

    if (giftRes.rows.length === 0) return res.status(404).json({ error: 'Gift not found' });

    const now = new Date().toISOString();
    await db.execute({
      sql: 'UPDATE gifts SET received_at = ? WHERE id = ? AND tenant_id = ?',
      args: [now, req.params.id, req.user.tenantId]
    });

    await audit(req.user.tenantId, req.user.userId, 'ACCEPT_GIFT', 'gifts', req.params.id);

    const result = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ?',
      args: [req.params.id],
    });

    const gift = {
      ...result.rows[0],
      sites: JSON.parse(result.rows[0].sites || '[]'),
      status: 'received'
    };

    res.json({ gift });
  } catch (error) {
    console.error('Accept gift error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// DELETE /api/:tenant/gifts/:id/reservation
app.delete('/api/:tenant/gifts/:id/reservation', authMiddleware, async (req, res) => {
  try {
    const giftRes = await db.execute({
      sql: 'SELECT * FROM gifts WHERE id = ? AND tenant_id = ?',
      args: [req.params.id, req.user.tenantId]
    });

    if (giftRes.rows.length === 0) return res.status(404).json({ error: 'Gift not found' });

    await db.execute({
      sql: 'UPDATE gifts SET reserved_by_name = NULL, reserved_by_whatsapp = NULL, reserved_at = NULL, received_at = NULL WHERE id = ? AND tenant_id = ?',
      args: [req.params.id, req.user.tenantId]
    });

    await audit(req.user.tenantId, req.user.userId, 'REMOVE_RESERVATION', 'gifts', req.params.id);

    res.status(200).json({ message: 'Reserva removida com sucesso' });
  } catch (error) {
    console.error('Remove gift reservation error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/:tenant/gifts
app.post('/api/:tenant/gifts', authMiddleware, async (req, res) => {
  try {
    const { nome, imagem_url, preco, sites, descricao } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Gift name required' });
    }
    
    const sitesJSON = JSON.stringify(sites || []);
    
    const insertResult = await db.execute({
      sql: 'INSERT INTO gifts (tenant_id, user_id, nome, imagem_url, preco, sites, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [req.user.tenantId, req.user.userId, nome, imagem_url || null, preco || null, sitesJSON, descricao || null],
    });
    
    const gift = {
      id: Number(insertResult.lastInsertRowid),
      tenant_id: req.user.tenantId,
      user_id: req.user.userId,
      nome,
      imagem_url: imagem_url || null,
      preco: preco || null,
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
    const { nome, imagem_url, preco, sites, descricao } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Gift name required' });
    }
    
    const sitesJSON = JSON.stringify(sites || []);
    const now = new Date().toISOString();
    
    await db.execute({
      sql: 'UPDATE gifts SET nome = ?, imagem_url = ?, preco = ?, sites = ?, descricao = ?, updated_at = ? WHERE id = ? AND tenant_id = ? AND user_id = ?',
      args: [nome, imagem_url || null, preco || null, sitesJSON, descricao || null, now, req.params.id, req.user.tenantId, req.user.userId],
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

// ============ EVENT DETAILS ROUTES ============

// GET /api/:tenant/event (Public - view event details)
app.get('/api/:tenant/event', async (req, res) => {
  try {
    const tenantSlug = req.params.tenant;
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const result = await db.execute({
      sql: 'SELECT * FROM event_details WHERE tenant_id = ?',
      args: [tenant.id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event details not found' });
    }

    const event = result.rows[0];
    res.json({
      event: {
        id: event.id,
        endereco: event.endereco,
        horario: event.horario,
        data_evento: event.data_evento,
        dress_code: event.dress_code,
        observacoes: event.observacoes,
        contato_telefone: event.contato_telefone,
        google_maps_url: event.google_maps_url,
        qr_token: event.qr_token,
      }
    });
  } catch (error) {
    console.error('Get event error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/:tenant/event (Authenticated - create/update event details)
app.post('/api/:tenant/event', authMiddleware, async (req, res) => {
  try {
    const { endereco, horario, data_evento, dress_code, observacoes, contato_telefone, google_maps_url } = req.body;
    const tenantSlug = req.params.tenant;
    
    // Verificar se tenant existe
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    // Gerar token QR único se não existir
    const checkResult = await db.execute({
      sql: 'SELECT id, qr_token FROM event_details WHERE tenant_id = ?',
      args: [tenant.id]
    });

    let qrToken;
    if (checkResult.rows.length === 0) {
      qrToken = crypto.randomBytes(16).toString('hex');
      const insertResult = await db.execute({
        sql: `INSERT INTO event_details 
              (tenant_id, endereco, horario, data_evento, dress_code, observacoes, contato_telefone, google_maps_url, qr_token) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [tenant.id, endereco || null, horario || null, data_evento || null, dress_code || null, observacoes || null, contato_telefone || null, google_maps_url || null, qrToken]
      });
      
      await audit(tenant.id, req.user.userId, 'CREATE_EVENT', 'event_details', insertResult.lastInsertRowid);
    } else {
      qrToken = checkResult.rows[0].qr_token;
      const now = new Date().toISOString();
      await db.execute({
        sql: `UPDATE event_details 
              SET endereco = ?, horario = ?, data_evento = ?, dress_code = ?, observacoes = ?, contato_telefone = ?, google_maps_url = ?, atualizado_em = ? 
              WHERE tenant_id = ?`,
        args: [endereco || null, horario || null, data_evento || null, dress_code || null, observacoes || null, contato_telefone || null, google_maps_url || null, now, tenant.id]
      });
      
      await audit(tenant.id, req.user.userId, 'UPDATE_EVENT', 'event_details', checkResult.rows[0].id);
    }

    res.json({
      event: {
        endereco,
        horario,
        data_evento,
        dress_code,
        observacoes,
        contato_telefone,
        google_maps_url,
        qr_token: qrToken,
      }
    });
  } catch (error) {
    console.error('Create/update event error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/:tenant/event/regenerate-qr (Authenticated - regenerate QR token)
app.post('/api/:tenant/event/regenerate-qr', authMiddleware, async (req, res) => {
  try {
    const tenantSlug = req.params.tenant;
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const checkResult = await db.execute({
      sql: 'SELECT id FROM event_details WHERE tenant_id = ?',
      args: [tenant.id]
    });

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event details not found' });
    }

    const newQrToken = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();
    
    await db.execute({
      sql: 'UPDATE event_details SET qr_token = ?, atualizado_em = ? WHERE tenant_id = ?',
      args: [newQrToken, now, tenant.id]
    });

    await audit(tenant.id, req.user.userId, 'REGENERATE_QR_TOKEN', 'event_details', checkResult.rows[0].id);

    res.json({
      qr_token: newQrToken,
      message: 'QR code regenerado com sucesso'
    });
  } catch (error) {
    console.error('Regenerate QR token error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// GET /api/convite/:qr_token (Public - view invitation by QR token)
app.get('/api/convite/:qr_token', async (req, res) => {
  try {
    const { qr_token } = req.params;

    const result = await db.execute({
      sql: `SELECT e.*, t.nome1, t.nome2, t.slug FROM event_details e 
            INNER JOIN tenants t ON e.tenant_id = t.id 
            WHERE e.qr_token = ?`,
      args: [qr_token]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const event = result.rows[0];
    
    res.json({
      event: {
        id: event.id,
        endereco: event.endereco,
        horario: event.horario,
        data_evento: event.data_evento,
        dress_code: event.dress_code,
        observacoes: event.observacoes,
        contato_telefone: event.contato_telefone,
        google_maps_url: event.google_maps_url,
        qr_token: event.qr_token,
      },
      couple: {
        nome1: event.nome1,
        nome2: event.nome2,
      },
      tenant_slug: event.slug
    });
  } catch (error) {
    console.error('Get invitation error:', error?.message || error);
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
    // Only listen if not running as a Vercel function
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    if (!process.env.VERCEL) process.exit(1);
  }
}

start();

export default app;
