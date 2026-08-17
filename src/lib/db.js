import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Store from '../models/Store';
import Subscriber from '../models/Subscriber';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DATA_DIR = path.join(process.cwd(), 'data');
const STORES_FILE = path.join(DATA_DIR, 'stores.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

const DEFAULT_STORES = [
  {
    id: 'singhclo',
    name: 'SinghClo Main Store',
    mode: 'LIVE',
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

// Helper to ensure data folder exists for JSON fallback
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

function readJSONFile(file, defaultVal) {
  ensureDataDir();
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  try {
    fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2), 'utf8');
  } catch (e) {}
  return defaultVal;
}

function writeJSONFile(file, data) {
  ensureDataDir();
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
    return false;
  }
}

/**
 * Global cache for MongoDB Mongoose connection
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, isMongo: false };
}

export async function connectDB() {
  if (!MONGODB_URI) {
    return { isMongo: false, message: 'Local JSON fallback mode (MONGODB_URI not configured)' };
  }

  if (cached.conn) {
    return { isMongo: true, conn: cached.conn };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (m) => {
      cached.isMongo = true;
      console.log('✅ Connected to MongoDB successfully.');
      // Auto seed initial stores if collection is empty
      try {
        const count = await Store.countDocuments();
        if (count === 0) {
          const initial = readJSONFile(STORES_FILE, DEFAULT_STORES);
          await Store.insertMany(initial);
          console.log(`🌱 Seeded ${initial.length} default stores into MongoDB.`);
        }
      } catch (err) {
        console.error('Error auto-seeding MongoDB:', err);
      }
      return m;
    }).catch(err => {
      console.warn('⚠️ MongoDB connection failed, falling back to local JSON database:', err.message);
      cached.promise = null;
      cached.isMongo = false;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
    return { isMongo: !!cached.conn, conn: cached.conn };
  } catch (e) {
    cached.promise = null;
    cached.isMongo = false;
    return { isMongo: false, message: e.message };
  }
}

// --------------------------------------------------------------------------
// Unified Data Access API (Works on MongoDB & Local JSON seamlessly)
// --------------------------------------------------------------------------

export async function getDbStatus() {
  const { isMongo } = await connectDB();
  return {
    type: isMongo ? 'MongoDB' : 'Local Storage (JSON)',
    connected: true,
    isMongo: isMongo,
    uriConfigured: !!MONGODB_URI,
  };
}

export async function getAllStores() {
  const { isMongo } = await connectDB();
  if (isMongo) {
    try {
      const stores = await Store.find({}).sort({ updatedAt: -1 }).lean();
      return stores.map(s => ({
        ...s,
        _id: s._id.toString(),
        launchDate: s.launchDate ? new Date(s.launchDate).toISOString() : new Date().toISOString(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error('MongoDB find error, falling back to JSON:', e);
    }
  }
  return readJSONFile(STORES_FILE, DEFAULT_STORES);
}

export async function getStoreById(storeId, autoCreateData = null) {
  const cleanId = String(storeId || '').trim().toLowerCase();
  const { isMongo } = await connectDB();
  if (isMongo) {
    try {
      const store = await Store.findOne({ id: cleanId }).lean();
      if (store) {
        return {
          ...store,
          _id: store._id.toString(),
          launchDate: store.launchDate ? new Date(store.launchDate).toISOString() : new Date().toISOString(),
          updatedAt: store.updatedAt ? new Date(store.updatedAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error('MongoDB findOne error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const found = stores.find(s => s.id.toLowerCase() === cleanId);
  if (found) return found;

  // Auto-register new store if requested
  if (autoCreateData) {
    try {
      const newStore = await addStore({
        id: cleanId,
        name: autoCreateData.name || cleanId,
        brandName: autoCreateData.brandName || autoCreateData.name || cleanId,
        mode: autoCreateData.mode || 'LIVE',
      });
      return newStore;
    } catch (err) {
      console.error('Auto-registration error:', err);
    }
  }

  return null;
}

export async function bulkToggleStores(targetMode) {
  const mode = targetMode === 'LAUNCH_SOON' ? 'LAUNCH_SOON' : 'LIVE';
  const { isMongo } = await connectDB();

  if (isMongo) {
    try {
      await Store.updateMany({}, { mode, updatedAt: new Date() });
      return getAllStores();
    } catch (e) {
      console.error('MongoDB bulk toggle error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const updated = stores.map(s => ({
    ...s,
    mode,
    updatedAt: new Date().toISOString(),
  }));
  writeJSONFile(STORES_FILE, updated);
  return updated;
}

export async function toggleStoreMode(storeId, forcedMode = null) {
  const cleanId = String(storeId || '').trim().toLowerCase();
  const { isMongo } = await connectDB();

  if (isMongo) {
    try {
      const store = await Store.findOne({ id: cleanId });
      if (store) {
        store.mode = forcedMode || (store.mode === 'LIVE' ? 'LAUNCH_SOON' : 'LIVE');
        store.updatedAt = new Date();
        await store.save();
        const obj = store.toObject();
        return {
          ...obj,
          _id: obj._id ? obj._id.toString() : undefined,
          launchDate: obj.launchDate ? new Date(obj.launchDate).toISOString() : new Date().toISOString(),
          updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error('MongoDB toggle error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const idx = stores.findIndex(s => s.id.toLowerCase() === cleanId);
  if (idx !== -1) {
    stores[idx].mode = forcedMode || (stores[idx].mode === 'LIVE' ? 'LAUNCH_SOON' : 'LIVE');
    stores[idx].updatedAt = new Date().toISOString();
    writeJSONFile(STORES_FILE, stores);
    return stores[idx];
  }
  return null;
}

export async function updateStore(storeId, updateData) {
  const cleanId = String(storeId || '').trim().toLowerCase();
  const { isMongo } = await connectDB();

  if (isMongo) {
    try {
      const updated = await Store.findOneAndUpdate(
        { id: cleanId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      if (updated) {
        return {
          ...updated,
          _id: updated._id ? updated._id.toString() : undefined,
          launchDate: updated.launchDate ? new Date(updated.launchDate).toISOString() : new Date().toISOString(),
          updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error('MongoDB update error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const idx = stores.findIndex(s => s.id.toLowerCase() === cleanId);
  if (idx !== -1) {
    stores[idx] = {
      ...stores[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeJSONFile(STORES_FILE, stores);
    return stores[idx];
  }
  return null;
}

export async function addStore(newStoreData) {
  const cleanId = String(newStoreData.id || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!cleanId || !newStoreData.name) {
    throw new Error('Store ID and Name are required');
  }

  const { isMongo } = await connectDB();

  const storeObj = {
    id: cleanId,
    name: newStoreData.name.trim(),
    mode: newStoreData.mode || 'LIVE',
    brandName: newStoreData.brandName || newStoreData.name,
    logoUrl: newStoreData.logoUrl || '',
    headline: newStoreData.headline || 'Something Extraordinary\nIs On The Way',
    subtitle: newStoreData.subtitle || 'We are crafting an exclusive shopping experience.',
    launchDate: newStoreData.launchDate ? new Date(newStoreData.launchDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    passcode: newStoreData.passcode || 'vip2026',
    socials: newStoreData.socials || { fb: '', ig: '', tt: '', wa: '' },
    updatedAt: new Date().toISOString(),
  };

  if (isMongo) {
    try {
      const existing = await Store.findOne({ id: cleanId });
      if (existing) throw new Error('Store ID already exists in MongoDB');
      const created = await Store.create(storeObj);
      const obj = created.toObject();
      return {
        ...obj,
        _id: obj._id ? obj._id.toString() : undefined,
      };
    } catch (e) {
      if (e.message.includes('already exists')) throw e;
      console.error('MongoDB addStore error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  if (stores.some(s => s.id.toLowerCase() === cleanId)) {
    throw new Error('Store ID already exists');
  }

  stores.push(storeObj);
  writeJSONFile(STORES_FILE, stores);
  return storeObj;
}

export async function deleteStore(storeId) {
  const cleanId = String(storeId || '').trim().toLowerCase();
  const { isMongo } = await connectDB();

  if (isMongo) {
    try {
      await Store.deleteOne({ id: cleanId });
    } catch (e) {
      console.error('MongoDB deleteStore error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const filtered = stores.filter(s => s.id.toLowerCase() !== cleanId);
  writeJSONFile(STORES_FILE, filtered);
  return true;
}

export async function addSubscriber(email, storeId = 'singhclo') {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanStoreId = String(storeId || 'singhclo').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Valid email address is required');
  }

  const { isMongo } = await connectDB();
  const subData = {
    email: cleanEmail,
    storeId: cleanStoreId,
    createdAt: new Date().toISOString(),
  };

  if (isMongo) {
    try {
      const created = await Subscriber.create({
        email: cleanEmail,
        storeId: cleanStoreId,
        createdAt: new Date(),
      });
      return created.toObject();
    } catch (e) {
      console.error('MongoDB addSubscriber error:', e);
    }
  }

  const subs = readJSONFile(SUBSCRIBERS_FILE, []);
  const entry = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    ...subData,
  };
  subs.unshift(entry);
  writeJSONFile(SUBSCRIBERS_FILE, subs);
  return entry;
}

export async function getSubscribers(storeFilter = null) {
  const { isMongo } = await connectDB();
  if (isMongo) {
    try {
      const query = storeFilter && storeFilter !== 'all' ? { storeId: storeFilter.toLowerCase() } : {};
      const list = await Subscriber.find(query).sort({ createdAt: -1 }).lean();
      return list.map(s => ({
        id: s._id.toString(),
        email: s.email,
        storeId: s.storeId,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error('MongoDB getSubscribers error:', e);
    }
  }

  let subs = readJSONFile(SUBSCRIBERS_FILE, []);
  if (storeFilter && storeFilter !== 'all') {
    subs = subs.filter(s => s.storeId && s.storeId.toLowerCase() === storeFilter.toLowerCase());
  }
  return subs;
}

export async function deleteSubscriber(subId) {
  const { isMongo } = await connectDB();
  if (isMongo) {
    try {
      if (mongoose.Types.ObjectId.isValid(subId)) {
        await Subscriber.findByIdAndDelete(subId);
        return true;
      }
    } catch (e) {
      console.error('MongoDB deleteSubscriber error:', e);
    }
  }

  const subs = readJSONFile(SUBSCRIBERS_FILE, []);
  const filtered = subs.filter(s => s.id !== subId);
  writeJSONFile(SUBSCRIBERS_FILE, filtered);
  return true;
}
