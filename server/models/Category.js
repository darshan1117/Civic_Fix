import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    severityWeight: { type: Number, required: true, min: 1, max: 10, default: 5 },
    defaultSlaHours: { type: Number, required: true, default: 48 },
    icon: { type: String, default: 'AlertTriangle' },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
