const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STORES_FILE = path.join(DATA_DIR, 'stores.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STORES = [
  {
    id: 'singhclo',
    name: 'SinghClo Main Store',
    mode: 'LIVE', // 'LIVE' or 'LAUNCH_SOON'
    brandName: 'SinghClo',
    logoUrl: '',
    headline: 'Something Extraordinary\nIs On The Way',
    subtitle: 'We are crafting an exclusive shopping experience curated just for you. Sign up for early VIP access and secret drops.',
    launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    passcode: 'vip2026',
    socials: {
      fb: 'https://facebook.com',
      ig: 'https://instagram.com',
      tt: 'https://tiktok.com',
      wa: 'https://wa.me'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'store2',
    name: 'Brand Two - Luxury Wear',
    mode: 'LAUNCH_SOON',
    brandName: 'Brand Two',
    logoUrl: '',
    headline: 'Grand Opening\nRevealing Very Soon',
    subtitle: 'The new season collection drops in a few days. Join our VIP waitlist.',
    launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    passcode: 'brand2vip',
    socials: { fb: '', ig: '', tt: '', wa: '' },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'store3',
    name: 'Store 3 - Casuals',
    mode: 'LIVE',
    brandName: 'Store Three',
    logoUrl: '',
    headline: 'New Arrivals Coming Soon',
    subtitle: 'Stay tuned for our latest drops and exclusive promotions.',
    launchDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    passcode: 'vip2026',
    socials: { fb: '', ig: '', tt: '', wa: '' },
    updatedAt: new Date().toISOString()
  }
];

function readJSON(file, defaultData) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading file:', file, e);
  }
  fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing file:', file, e);
    return false;
  }
}

// Initialize databases
let storesDb = readJSON(STORES_FILE, DEFAULT_STORES);
let subscribersDb = readJSON(SUBSCRIBERS_FILE, []);

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // Helper to read body safely
  const parseBody = (callback) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let parsed = {};
      if (body && body.trim()) {
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = {};
        }
      }
      callback(parsed);
    });
  };

  // 1. API: Get all stores
  if (req.method === 'GET' && pathname === '/api/stores') {
    return sendJSON(200, { success: true, stores: storesDb });
  }

  // 2. API: Quick Toggle Store Mode (LIVE <-> LAUNCH_SOON)
  if ((req.method === 'POST' || req.method === 'GET') && pathname.startsWith('/api/store/toggle/')) {
    const storeId = pathname.replace('/api/store/toggle/', '').trim().toLowerCase();
    const handleToggle = (payload) => {
      const index = storesDb.findIndex(s => s.id.toLowerCase() === storeId);
      if (index !== -1) {
        const newMode = payload.mode || (storesDb[index].mode === 'LIVE' ? 'LAUNCH_SOON' : 'LIVE');
        storesDb[index].mode = newMode;
        storesDb[index].updatedAt = new Date().toISOString();
        writeJSON(STORES_FILE, storesDb);
        return sendJSON(200, { success: true, store: storesDb[index], message: `Store switched to ${newMode}` });
      } else {
        return sendJSON(404, { success: false, message: 'Store not found' });
      }
    };

    if (req.method === 'POST') {
      parseBody(handleToggle);
    } else {
      handleToggle(parsedUrl.query || {});
    }
    return;
  }

  // 3. API: Update store config
  if (req.method === 'POST' && pathname.startsWith('/api/store/update/')) {
    const storeId = pathname.replace('/api/store/update/', '').trim().toLowerCase();
    parseBody(updateData => {
      const index = storesDb.findIndex(s => s.id.toLowerCase() === storeId);
      if (index !== -1) {
        storesDb[index] = {
          ...storesDb[index],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        writeJSON(STORES_FILE, storesDb);
        return sendJSON(200, { success: true, store: storesDb[index] });
      } else {
        return sendJSON(404, { success: false, message: 'Store not found' });
      }
    });
    return;
  }

  // 4. API: Add new store
  if (req.method === 'POST' && pathname === '/api/store/add') {
    parseBody(newStore => {
      if (!newStore.id || !newStore.name) {
        return sendJSON(400, { success: false, message: 'Store ID and Name required' });
      }
      const existing = storesDb.find(s => s.id.toLowerCase() === newStore.id.toLowerCase());
      if (existing) {
        return sendJSON(400, { success: false, message: 'Store ID already exists' });
      }
      const created = {
        id: newStore.id.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
        name: newStore.name,
        mode: newStore.mode || 'LIVE',
        brandName: newStore.brandName || newStore.name,
        logoUrl: newStore.logoUrl || '',
        headline: newStore.headline || 'Something Extraordinary\nIs On The Way',
        subtitle: newStore.subtitle || 'We are crafting an exclusive shopping experience.',
        launchDate: newStore.launchDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        passcode: newStore.passcode || 'vip2026',
        socials: newStore.socials || { fb: '', ig: '', tt: '', wa: '' },
        updatedAt: new Date().toISOString()
      };
      storesDb.push(created);
      writeJSON(STORES_FILE, storesDb);
      return sendJSON(201, { success: true, store: created });
    });
    return;
  }

  // 5. API: Get single store by ID (e.g. /api/store/singhclo)
  if (req.method === 'GET' && pathname.startsWith('/api/store/')) {
    const storeId = pathname.replace('/api/store/', '').trim().toLowerCase();
    const store = storesDb.find(s => s.id.toLowerCase() === storeId);
    if (store) {
      return sendJSON(200, { success: true, store });
    } else {
      return sendJSON(404, { success: false, message: 'Store not found', store: DEFAULT_STORES[0] });
    }
  }

  // 6. API: Delete store
  if (req.method === 'DELETE' && pathname.startsWith('/api/store/')) {
    const storeId = pathname.replace('/api/store/', '').trim().toLowerCase();
    storesDb = storesDb.filter(s => s.id.toLowerCase() !== storeId);
    writeJSON(STORES_FILE, storesDb);
    return sendJSON(200, { success: true, message: 'Store deleted' });
  }

  // 7. API: Subscribe visitor lead
  if (req.method === 'POST' && pathname === '/api/subscribe') {
    parseBody(payload => {
      const email = payload.email;
      if (!email || !email.includes('@')) {
        return sendJSON(400, { success: false, message: 'Valid email required' });
      }
      const entry = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        storeId: payload.storeId || 'singhclo',
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString()
      };
      subscribersDb.unshift(entry);
      writeJSON(SUBSCRIBERS_FILE, subscribersDb);
      return sendJSON(201, { success: true, message: 'Subscribed successfully' });
    });
    return;
  }

  // 8. API: Get subscribers
  if (req.method === 'GET' && pathname === '/api/subscribers') {
    const storeFilter = parsedUrl.query.storeId;
    let list = subscribersDb;
    if (storeFilter && storeFilter !== 'all') {
      list = list.filter(s => s.storeId.toLowerCase() === storeFilter.toLowerCase());
    }
    return sendJSON(200, { success: true, subscribers: list, total: list.length });
  }

  // Serve Static Dashboard Frontend
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SHOPIFY MULTI-STORE CONTROLLER SERVER ACTIVE`);
  console.log(`👉 Dashboard URL: http://localhost:${PORT}`);
  console.log(`📡 API Endpoint : http://localhost:${PORT}/api/store/singhclo`);
  console.log(`======================================================\n`);
});
