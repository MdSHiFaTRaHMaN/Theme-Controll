import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  storeId: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    default: 'singhclo',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
