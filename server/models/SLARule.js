import mongoose from 'mongoose';

const slaRuleSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
    slaHours: { type: Number, required: true, min: 1, default: 48 },
  },
  { timestamps: true }
);

export const SLARule = mongoose.models.SLARule || mongoose.model('SLARule', slaRuleSchema);
