import mongoose from 'mongoose';

const issuePhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  kind: { type: String, enum: ['report', 'proof'], default: 'report' },
  createdAt: { type: Date, default: Date.now },
});

const issueEventSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, default: null },
  eventType: {
    type: String,
    enum: ['created', 'status_change', 'escalation', 'reopened', 'upvote', 'comment'],
    required: true,
  },
  fromStatus: { type: String, default: null },
  toStatus: { type: String, default: null },
  note: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const issueSchema = new mongoose.Schema(
  {
    public_id: { type: String, required: true, unique: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address_text: { type: String, required: true },
    status: {
      type: String,
      enum: ['Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed', 'Rejected', 'Reopened'],
      default: 'Submitted',
    },
    priority_score: { type: Number, default: 0 },
    sla_deadline: { type: Date, required: true },
    escalation_level: { type: Number, enum: [0, 1, 2], default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvote_count: { type: Number, default: 0 },
    photos: [issuePhotoSchema],
    events: [issueEventSchema],
    resolved_at: { type: Date, default: null },
    closed_at: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index for status and category lookups
issueSchema.index({ status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ department: 1 });
issueSchema.index({ sla_deadline: 1 });
issueSchema.index({ lat: 1, lng: 1 });

export const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);
