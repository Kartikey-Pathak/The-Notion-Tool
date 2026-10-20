import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'notion_mongodb_session';

// Stable encryption key derived from environment secret or a secure fallback
const SESSION_SECRET = process.env.SESSION_SECRET || 'notion_workspace_secure_session_secret_key_2026';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SESSION_SECRET).digest();

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

/**
 * Encrypt connection configuration into an authenticated token (AES-256-GCM)
 */
export function encryptSession(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'base64url');
  encrypted += cipher.final('base64url');
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted}`;
}

/**
 * Decrypt and verify connection configuration from session token
 */
export function decryptSession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const iv = Buffer.from(parts[0], 'base64url');
    const tag = Buffer.from(parts[1], 'base64url');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'base64url', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}

// Multi-client connection cache keyed by SHA256 of uri + dbName
// Preserved across hot-reloads in development via globalThis
const globalWithMongo = globalThis;
if (!globalWithMongo._mongoClientCache) {
  globalWithMongo._mongoClientCache = new Map();
}
const clientCache = globalWithMongo._mongoClientCache;

/**
 * Read connection configuration from the active user's session cookie
 */
export async function getSavedConfig() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (sessionCookie && sessionCookie.value) {
      const session = decryptSession(sessionCookie.value);
      if (session && session.uri) {
        return {
          uri: session.uri,
          dbName: session.dbName || 'notion_workspace',
          source: 'session'
        };
      }
    }
  } catch (err) {
    // cookies() may throw if invoked outside of a request context
  }

  return null;
}

/**
 * Encrypt and store user connection configuration in an HTTP-only session cookie
 */
export async function saveSessionConfig(uri, dbName = 'notion_workspace') {
  const cleanDbName = (dbName && dbName.trim()) ? dbName.trim() : 'notion_workspace';
  const token = encryptSession({
    uri: uri.trim(),
    dbName: cleanDbName,
    createdAt: new Date().toISOString()
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  } catch (e) {
    // Handled in route handler via response.cookies
  }

  return token;
}

export const saveConfig = saveSessionConfig;

/**
 * Disconnect user session and close client connection
 */
export async function clearSessionConfig(uri = null, dbName = null) {
  try {
    let targetUri = uri;
    let targetDb = dbName;
    if (!targetUri) {
      const existing = await getSavedConfig();
      if (existing) {
        targetUri = existing.uri;
        targetDb = existing.dbName;
      }
    }
    if (targetUri) {
      const cacheKey = crypto
        .createHash('sha256')
        .update(`${targetUri.trim()}:::${targetDb || 'notion_workspace'}`)
        .digest('hex');
      if (clientCache.has(cacheKey)) {
        const entry = clientCache.get(cacheKey);
        try {
          await entry.client.close();
        } catch (e) {
          // ignore
        }
        clientCache.delete(cacheKey);
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (e) {
    // Handled in route handler via response.cookies
  }
}

export const removeConfig = clearSessionConfig;

/**
 * Test a MongoDB URI without saving
 */
export async function testConnection(uri, dbName = 'notion_workspace') {
  if (!uri || typeof uri !== 'string') {
    throw new Error('A valid MongoDB connection URI is required.');
  }

  const client = new MongoClient(uri.trim(), {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    // Ping admin or target db
    const cleanDbName = (dbName && dbName.trim()) ? dbName.trim() : 'notion_workspace';
    const db = client.db(cleanDbName);
    await db.command({ ping: 1 });

    // Extract sanitized host name for UI display
    let host = 'Connected Deployment';
    try {
      const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
      host = parsed.host || 'MongoDB Server';
    } catch (e) {
      // fallback
    }

    await client.close();
    return { success: true, host, dbName: cleanDbName };
  } catch (err) {
    try {
      await client.close();
    } catch (e) {
      // ignore
    }
    // Return sanitized, friendly error
    let message = 'Failed to connect to MongoDB.';
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      message = 'Authentication failed. Please verify your MongoDB username and password.';
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      message = 'Could not resolve MongoDB host. Please verify the connection URI hostname.';
    } else if (err.message.includes('server selection') || err.message.includes('timed out')) {
      message = 'Connection timed out. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access: 0.0.0.0/0 or your current IP).';
    } else if (err.message) {
      message = err.message;
    }
    throw new Error(message);
  }
}

/**
 * Connect to MongoDB and return db instance for the current user's session
 */
export async function connectToDatabase(customConfig = null) {
  const config = customConfig || await getSavedConfig();
  if (!config || !config.uri) {
    return { db: null, client: null, isConnected: false };
  }

  const cleanDbName = (config.dbName && config.dbName.trim()) ? config.dbName.trim() : 'notion_workspace';
  const cacheKey = crypto
    .createHash('sha256')
    .update(`${config.uri.trim()}:::${cleanDbName}`)
    .digest('hex');

  if (clientCache.has(cacheKey)) {
    const cached = clientCache.get(cacheKey);
    cached.lastUsed = Date.now();
    return { db: cached.db, client: cached.client, isConnected: true };
  }

  // Manage cache size: LRU eviction if > 20 connections in this runtime instance
  if (clientCache.size >= 20) {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [key, val] of clientCache.entries()) {
      if (val.lastUsed < oldestTime) {
        oldestTime = val.lastUsed;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      const entry = clientCache.get(oldestKey);
      try {
        await entry.client.close();
      } catch (e) {
        // ignore
      }
      clientCache.delete(oldestKey);
    }
  }

  const client = new MongoClient(config.uri.trim(), {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db(cleanDbName);
    clientCache.set(cacheKey, { client, db, lastUsed: Date.now() });
    return { db, client, isConnected: true };
  } catch (err) {
    clientCache.delete(cacheKey);
    throw err;
  }
}

/**
 * Initialize workspace indexes and starter data if empty
 */
export async function initializeWorkspace(db) {
  try {
    // 1. Create indexes
    await db.collection('workspaces').createIndex({ id: 1 }, { unique: true });
    await db.collection('pages').createIndex({ id: 1 }, { unique: true });
    await db.collection('pages').createIndex({ parentId: 1, isTrash: 1, order: 1 });
    await db.collection('pages').createIndex({ isFavorite: 1, isTrash: 1 });
    await db.collection('databases').createIndex({ id: 1 }, { unique: true });
    await db.collection('databases').createIndex({ pageId: 1 });
    await db.collection('database_records').createIndex({ id: 1 }, { unique: true });
    await db.collection('database_records').createIndex({ databaseId: 1, createdAt: -1 });

    // 2. Check if a workspace already exists
    const existingWorkspace = await db.collection('workspaces').findOne({});
    if (existingWorkspace) {
      return existingWorkspace;
    }

    // 3. Create default workspace and starter pages
    const workspaceId = 'ws_default';
    const newWorkspace = {
      id: workspaceId,
      name: 'Personal Workspace',
      icon: '🚀',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('workspaces').insertOne(newWorkspace);

    // Welcome Page
    const welcomePageId = 'page_welcome';
    const welcomePage = {
      id: welcomePageId,
      workspaceId,
      parentId: null,
      title: 'Welcome to your Workspace',
      icon: '👋',
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      description: 'Your new Notion-style productivity hub powered by your personal MongoDB database.',
      isFavorite: true,
      isTrash: false,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: 'b_w_1',
          type: 'callout',
          content: 'Welcome! This is your personal Notion-inspired workspace. Everything is saved directly to your MongoDB database in real time.',
          properties: { icon: '💡', color: 'blue' }
        },
        {
          id: 'b_w_2',
          type: 'heading1',
          content: 'Getting Started',
          properties: {}
        },
        {
          id: 'b_w_3',
          type: 'paragraph',
          content: 'Here are a few quick tips to get familiar with your workspace:',
          properties: {}
        },
        {
          id: 'b_w_4',
          type: 'todo',
          content: 'Type "/" anywhere in the editor to open the block insertion menu',
          properties: { checked: true }
        },
        {
          id: 'b_w_5',
          type: 'todo',
          content: 'Click the "+" button in the sidebar to create nested pages',
          properties: { checked: false }
        },
        {
          id: 'b_w_6',
          type: 'todo',
          content: 'Press Ctrl+K (or Cmd+K) to search across all pages instantly',
          properties: { checked: false }
        },
        {
          id: 'b_w_7',
          type: 'todo',
          content: 'Try out databases with Table, Board, List, and Gallery views',
          properties: { checked: false }
        },
        {
          id: 'b_w_8',
          type: 'divider',
          content: '',
          properties: {}
        },
        {
          id: 'b_w_9',
          type: 'heading2',
          content: 'Interactive Code & Features',
          properties: {}
        },
        {
          id: 'b_w_10',
          type: 'code',
          content: '// Enjoy full syntax formatting and copy capabilities\nconst notion = {\n  speed: "blazing",\n  theme: "dark",\n  database: "mongodb"\n};\nconsole.log("Ready to build!");',
          properties: { language: 'javascript' }
        },
        {
          id: 'b_w_11',
          type: 'quote',
          content: '"Simplicity is the prerequisite for reliability." — Edsger W. Dijkstra',
          properties: {}
        }
      ]
    };
    await db.collection('pages').insertOne(welcomePage);

    // Starter Database Page: "Tasks & Projects"
    const tasksPageId = 'page_tasks_db';
    const databaseId = 'db_tasks';
    const tasksPage = {
      id: tasksPageId,
      workspaceId,
      parentId: null,
      title: 'Tasks & Projects',
      icon: '🎯',
      cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      description: 'Manage projects, priorities, and deadlines across multiple views.',
      isFavorite: true,
      isTrash: false,
      isDatabase: true,
      databaseId,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: []
    };
    await db.collection('pages').insertOne(tasksPage);

    // Database schema and views
    const tasksDatabase = {
      id: databaseId,
      workspaceId,
      pageId: tasksPageId,
      title: 'Tasks & Projects',
      schema: [
        { id: 'prop_title', name: 'Task', type: 'title' },
        { id: 'prop_status', name: 'Status', type: 'status', options: [
          { id: 'opt_not_started', name: 'Not Started', color: 'gray' },
          { id: 'opt_in_progress', name: 'In Progress', color: 'blue' },
          { id: 'opt_done', name: 'Done', color: 'green' }
        ]},
        { id: 'prop_priority', name: 'Priority', type: 'select', options: [
          { id: 'pri_high', name: 'High', color: 'red' },
          { id: 'pri_med', name: 'Medium', color: 'yellow' },
          { id: 'pri_low', name: 'Low', color: 'gray' }
        ]},
        { id: 'prop_due', name: 'Due Date', type: 'date' },
        { id: 'prop_tags', name: 'Tags', type: 'multi-select', options: [
          { id: 'tag_frontend', name: 'Frontend', color: 'purple' },
          { id: 'tag_backend', name: 'Backend', color: 'blue' },
          { id: 'tag_design', name: 'Design', color: 'pink' }
        ]},
        { id: 'prop_url', name: 'Link', type: 'url' }
      ],
      views: [
        { id: 'view_table', name: 'Table', type: 'table', sort: { propertyId: 'prop_due', direction: 'asc' } },
        { id: 'view_board', name: 'Board', type: 'board', groupBy: 'prop_status' },
        { id: 'view_list', name: 'List', type: 'list' },
        { id: 'view_gallery', name: 'Gallery', type: 'gallery' }
      ],
      defaultViewId: 'view_table',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('databases').insertOne(tasksDatabase);

    // Starter records
    const sampleRecords = [
      {
        id: 'rec_1',
        databaseId,
        properties: {
          prop_title: 'Build Notion Workspace',
          prop_status: 'In Progress',
          prop_priority: 'High',
          prop_due: '2026-10-20',
          prop_tags: ['Frontend', 'Backend'],
          prop_url: 'https://github.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rec_2',
        databaseId,
        properties: {
          prop_title: 'Configure MongoDB Collections',
          prop_status: 'Done',
          prop_priority: 'High',
          prop_due: '2026-10-18',
          prop_tags: ['Backend'],
          prop_url: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rec_3',
        databaseId,
        properties: {
          prop_title: 'Polish Dark Theme Aesthetics',
          prop_status: 'Done',
          prop_priority: 'Medium',
          prop_due: '2026-10-19',
          prop_tags: ['Design'],
          prop_url: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rec_4',
        databaseId,
        properties: {
          prop_title: 'Write project notes & documentation',
          prop_status: 'Not Started',
          prop_priority: 'Low',
          prop_due: '2026-10-25',
          prop_tags: ['Design'],
          prop_url: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    await db.collection('database_records').insertMany(sampleRecords);

    // Additional sub-page: "Quick Notes"
    const notesPage = {
      id: 'page_quick_notes',
      workspaceId,
      parentId: welcomePageId, // Nested under welcome page
      title: 'Quick Notes',
      icon: '📝',
      cover: null,
      description: 'Nested subpage for daily jotting and brain dumps.',
      isFavorite: false,
      isTrash: false,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: 'b_qn_1',
          type: 'heading2',
          content: 'Daily Brain Dump',
          properties: {}
        },
        {
          id: 'b_qn_2',
          type: 'bullet_list',
          content: 'This page demonstrates full nesting in the Notion sidebar tree.',
          properties: {}
        },
        {
          id: 'b_qn_3',
          type: 'bullet_list',
          content: 'Notice the expand/collapse chevron beside "Welcome to your Workspace".',
          properties: {}
        }
      ]
    };
    await db.collection('pages').insertOne(notesPage);

    return newWorkspace;
  } catch (err) {
    console.error('Error during workspace initialization:', err);
    throw err;
  }
}
