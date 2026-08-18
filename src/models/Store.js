import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mode: {
    type: String,
    enum: ['LIVE', 'LAUNCH_SOON'],
    default: 'LIVE',
  },
  showHomepage: {
    type: Boolean,
    default: true,
  },
  domain: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
  },
  themeId: {
    type: String,
    trim: true,
    default: '',
  },
  targetScope: {
    type: String,
    enum: ['homepage_only', 'all_pages'],
    default: 'homepage_only',
  },
  brandName: {
    type: String,
    default: '',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  headline: {
    type: String,
    default: 'Something Extraordinary\nIs On The Way',
  },
  subtitle: {
    type: String,
    default: 'We are crafting an exclusive shopping experience curated just for you. Sign up for early VIP access and secret drops.',
  },
  launchDate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  passcode: {
    type: String,
    default: 'vip2026',
  },
  socials: {
    fb: { type: String, default: '' },
    ig: { type: String, default: '' },
    tt: { type: String, default: '' },
    wa: { type: String, default: '' },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Store || mongoose.model('Store', StoreSchema);
