import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Store from '../models/Store';
import Subscriber from '../models/Subscriber';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DATA_DIR = path.join(process.cwd(), 'data');
const STORES_FILE = path.join(DATA_DIR, 'stores.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

const DEFAULT_STORES = [];

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
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
        return parsed;
      }
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
        showHomepage: s.showHomepage !== undefined ? s.showHomepage : s.mode === 'LIVE',
        domain: s.domain || '',
        themeId: s.themeId || '',
        targetScope: s.targetScope || 'homepage_only',
        launchDate: s.launchDate ? new Date(s.launchDate).toISOString() : new Date().toISOString(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (e) {
      console.error('MongoDB find error, falling back to JSON:', e);
    }
  }
  const localStores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  return localStores.map(s => ({
    ...s,
    showHomepage: s.showHomepage !== undefined ? s.showHomepage : s.mode === 'LIVE',
    domain: s.domain || '',
    themeId: s.themeId || '',
    targetScope: s.targetScope || 'homepage_only',
  }));
}

export async function findStoreByDomainOrTheme(domain = '', customDomain = '', themeId = '', storeId = '', autoCreateData = null) {
  let actualDomain = domain;
  let actualCustomDomain = customDomain;
  let actualThemeId = themeId;
  let actualStoreId = storeId;
  
  // Handle legacy 3/4-argument call signature
  if (typeof customDomain === 'string' && (customDomain.match(/^\d+$/) || !customDomain.includes('.'))) {
    actualCustomDomain = '';
    actualThemeId = customDomain;
    actualStoreId = themeId;
    if (storeId && typeof storeId === 'object') {
      autoCreateData = storeId;
    }
  }

  const normalizeDomain = (d) => String(d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
  const cleanDomain = normalizeDomain(actualDomain);
  const cleanCustomDomain = normalizeDomain(actualCustomDomain);
  const cleanThemeId = String(actualThemeId || '').trim();
  const cleanId = String(actualStoreId || '').trim().toLowerCase();

  const domainPrefix = cleanDomain ? cleanDomain.replace(/\.myshopify\.com$/, '') : '';
  const customDomainPrefix = cleanCustomDomain ? cleanCustomDomain.replace(/\.myshopify\.com$/, '') : '';

  const { isMongo } = await connectDB();
  if (isMongo) {
    try {
      const orConditions = [];
      if (cleanId) orConditions.push({ id: cleanId });
      if (cleanDomain) {
        orConditions.push({ domain: cleanDomain });
        orConditions.push({ domain: `https://${cleanDomain}` });
        if (domainPrefix) orConditions.push({ id: domainPrefix });
      }
      if (cleanCustomDomain) {
        orConditions.push({ domain: cleanCustomDomain });
        orConditions.push({ domain: `https://${cleanCustomDomain}` });
        if (customDomainPrefix) orConditions.push({ id: customDomainPrefix });
      }
      if (cleanThemeId) orConditions.push({ themeId: cleanThemeId });

      if (orConditions.length > 0) {
        const store = await Store.findOne({ $or: orConditions }).lean();
        if (store) {
          return {
            ...store,
            _id: store._id.toString(),
            showHomepage: store.showHomepage !== undefined ? store.showHomepage : store.mode === 'LIVE',
            domain: store.domain || '',
            themeId: store.themeId || '',
            targetScope: store.targetScope || 'homepage_only',
            launchDate: store.launchDate ? new Date(store.launchDate).toISOString() : new Date().toISOString(),
            updatedAt: store.updatedAt ? new Date(store.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.error('MongoDB findStoreByDomainOrTheme error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const found = stores.find(s => {
    const sId = (s.id || '').toLowerCase();
    const sDomain = normalizeDomain(s.domain || '');
    
    if (cleanId && sId === cleanId) return true;
    if (cleanThemeId && s.themeId && String(s.themeId) === cleanThemeId) return true;
    
    if (cleanDomain) {
      if (sDomain && (sDomain === cleanDomain || sDomain === domainPrefix)) return true;
      if (sId === cleanDomain || sId === domainPrefix) return true;
    }
    if (cleanCustomDomain) {
      if (sDomain && (sDomain === cleanCustomDomain || sDomain === customDomainPrefix)) return true;
      if (sId === cleanCustomDomain || sId === customDomainPrefix) return true;
    }
    return false;
  });

  if (found) {
    return {
      ...found,
      showHomepage: found.showHomepage !== undefined ? found.showHomepage : found.mode === 'LIVE',
      domain: found.domain || '',
      themeId: found.themeId || '',
      targetScope: found.targetScope || 'homepage_only',
    };
  }

  // Fallback: If exactly 1 store exists in database, return that store so single store setup works smoothly
  if (stores.length === 1) {
    return {
      ...stores[0],
      showHomepage: stores[0].showHomepage !== undefined ? stores[0].showHomepage : stores[0].mode === 'LIVE',
      domain: stores[0].domain || '',
      themeId: stores[0].themeId || '',
      targetScope: stores[0].targetScope || 'homepage_only',
    };
  }

  // Auto-register new store if requested
  if (autoCreateData) {
    try {
      const generatedId = cleanId || domainPrefix || customDomainPrefix || ('store_' + Date.now().toString(36));
      const newStore = await addStore({
        id: generatedId,
        name: autoCreateData.name || cleanDomain || generatedId,
        brandName: autoCreateData.brandName || autoCreateData.name || generatedId,
        domain: cleanDomain || cleanCustomDomain,
        themeId: cleanThemeId,
        mode: autoCreateData.mode || 'LAUNCH_SOON',
        showHomepage: autoCreateData.showHomepage !== undefined ? autoCreateData.showHomepage : false,
        targetScope: 'homepage_only',
      });
      return newStore;
    } catch (err) {
      console.error('Auto-registration error:', err);
    }
  }

  return null;
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
          showHomepage: store.showHomepage !== undefined ? store.showHomepage : store.mode === 'LIVE',
          domain: store.domain || '',
          themeId: store.themeId || '',
          targetScope: store.targetScope || 'homepage_only',
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
  if (found) {
    return {
      ...found,
      showHomepage: found.showHomepage !== undefined ? found.showHomepage : found.mode === 'LIVE',
      domain: found.domain || '',
      themeId: found.themeId || '',
      targetScope: found.targetScope || 'homepage_only',
    };
  }

  // Auto-register new store if requested
  if (autoCreateData) {
    try {
      const newStore = await addStore({
        id: cleanId,
        name: autoCreateData.name || cleanId,
        brandName: autoCreateData.brandName || autoCreateData.name || cleanId,
        domain: autoCreateData.domain || '',
        themeId: autoCreateData.themeId || '',
        mode: autoCreateData.mode || 'LIVE',
        showHomepage: autoCreateData.showHomepage !== undefined ? autoCreateData.showHomepage : true,
        targetScope: autoCreateData.targetScope || 'homepage_only',
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
  const showHomepage = mode === 'LIVE';
  const { isMongo } = await connectDB();

  if (isMongo) {
    try {
      await Store.updateMany({}, { mode, showHomepage, updatedAt: new Date() });
      return getAllStores();
    } catch (e) {
      console.error('MongoDB bulk toggle error:', e);
    }
  }

  const stores = readJSONFile(STORES_FILE, DEFAULT_STORES);
  const updated = stores.map(s => ({
    ...s,
    mode,
    showHomepage,
    updatedAt: new Date().toISOString(),
  }));
  writeJSONFile(STORES_FILE, updated);
  return updated;
}

export async function toggleStoreMode(storeId, forcedMode = null, forcedShowHomepage = null) {
  const cleanId = String(storeId || '').trim().toLowerCase();
  const { isMongo } = await connectDB();

  let targetMode = forcedMode;
  let targetShowHomepage = forcedShowHomepage;

  if (targetShowHomepage !== null && targetShowHomepage !== undefined) {
    const isYes = targetShowHomepage === true || targetShowHomepage === 'yes' || targetShowHomepage === 'true' || targetShowHomepage === 1;
    targetShowHomepage = isYes;
    targetMode = isYes ? 'LIVE' : 'LAUNCH_SOON';
  } else if (targetMode) {
    targetShowHomepage = targetMode === 'LIVE';
  }

  if (isMongo) {
    try {
      const store = await Store.findOne({ id: cleanId });
      if (store) {
        if (targetMode) {
          store.mode = targetMode;
          store.showHomepage = targetShowHomepage;
        } else {
          store.mode = store.mode === 'LIVE' ? 'LAUNCH_SOON' : 'LIVE';
          store.showHomepage = store.mode === 'LIVE';
        }
        store.updatedAt = new Date();
        await store.save();
        const obj = store.toObject();
        return {
          ...obj,
          _id: obj._id ? obj._id.toString() : undefined,
          showHomepage: obj.showHomepage !== undefined ? obj.showHomepage : obj.mode === 'LIVE',
          domain: obj.domain || '',
          themeId: obj.themeId || '',
          targetScope: obj.targetScope || 'homepage_only',
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
    if (targetMode) {
      stores[idx].mode = targetMode;
      stores[idx].showHomepage = targetShowHomepage;
    } else {
      const currentLive = stores[idx].showHomepage !== undefined ? stores[idx].showHomepage : stores[idx].mode === 'LIVE';
      stores[idx].showHomepage = !currentLive;
      stores[idx].mode = stores[idx].showHomepage ? 'LIVE' : 'LAUNCH_SOON';
    }
    stores[idx].updatedAt = new Date().toISOString();
    writeJSONFile(STORES_FILE, stores);
    return stores[idx];
  }
  return null;
}

export async function updateStore(storeId, updateData) {
  const cleanId = String(storeId || '').trim().toLowerCase();
  const { isMongo } = await connectDB();

  // Sync mode and showHomepage if either is provided
  const sanitized = { ...updateData };
  if (sanitized.showHomepage !== undefined && sanitized.mode === undefined) {
    sanitized.mode = (sanitized.showHomepage === true || sanitized.showHomepage === 'yes') ? 'LIVE' : 'LAUNCH_SOON';
  } else if (sanitized.mode !== undefined && sanitized.showHomepage === undefined) {
    sanitized.showHomepage = sanitized.mode === 'LIVE';
  }

  if (isMongo) {
    try {
      const updated = await Store.findOneAndUpdate(
        { id: cleanId },
        { ...sanitized, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      if (updated) {
        return {
          ...updated,
          _id: updated._id ? updated._id.toString() : undefined,
          showHomepage: updated.showHomepage !== undefined ? updated.showHomepage : updated.mode === 'LIVE',
          domain: updated.domain || '',
          themeId: updated.themeId || '',
          targetScope: updated.targetScope || 'homepage_only',
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
      ...sanitized,
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

  const isShowHome = newStoreData.showHomepage !== undefined
    ? (newStoreData.showHomepage === true || newStoreData.showHomepage === 'yes')
    : (newStoreData.mode === 'LIVE' || !newStoreData.mode);

  const storeObj = {
    id: cleanId,
    name: newStoreData.name.trim(),
    mode: isShowHome ? 'LIVE' : (newStoreData.mode || 'LAUNCH_SOON'),
    showHomepage: isShowHome,
    domain: String(newStoreData.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''),
    themeId: String(newStoreData.themeId || '').trim(),
    targetScope: newStoreData.targetScope || 'homepage_only',
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
