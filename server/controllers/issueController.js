import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';
import { Category } from '../models/Category.js';
import { Department } from '../models/Department.js';
import { SLARule } from '../models/SLARule.js';
import { Notification } from '../models/Notification.js';
import { calculateHaversineDistance } from '../utils/haversine.js';
import { validateStatusTransition } from '../utils/stateMachine.js';
import { calculatePriorityScore } from '../utils/priority.js';
import { calculateSLADeadline } from '../utils/sla.js';

// Escape regex special characters to prevent ReDoS and regex syntax errors
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// In-memory rate limiter: max 50 submissions per user per hour
const submissionTimes = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const history = submissionTimes.get(String(userId)) || [];
  const validTimes = history.filter((t) => now - t < windowMs);

  if (validTimes.length >= 50) {
    const oldest = validTimes[0];
    const resetMinutes = Math.ceil((windowMs - (now - oldest)) / 60000);
    return { allowed: false, resetMinutes };
  }

  return { allowed: true };
}

function recordSubmission(userId) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const history = submissionTimes.get(String(userId)) || [];
  const validTimes = history.filter((t) => now - t < windowMs);
  validTimes.push(now);
  submissionTimes.set(String(userId), validTimes);
}

export async function getIssues(req, res) {
  try {
    const { status, category, department, overdueOnly, reporter, search, sortBy = 'priority', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all' && mongoose.Types.ObjectId.isValid(category)) filter.category = category;
    if (department && department !== 'all' && mongoose.Types.ObjectId.isValid(department)) filter.department = department;
    if (reporter && mongoose.Types.ObjectId.isValid(reporter)) filter.reporter = reporter;

    if (overdueOnly === 'true') {
      filter.status = { $nin: ['Resolved', 'Closed', 'Rejected'] };
      filter.sla_deadline = { $lt: new Date() };
    }

    if (search && search.trim()) {
      const q = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { public_id: { $regex: q, $options: 'i' } },
        { address_text: { $regex: q, $options: 'i' } },
      ];
    }

    let query = Issue.find(filter)
      .populate('category')
      .populate('department')
      .populate('reporter', 'name email role');

    if (sortBy === 'priority') query = query.sort({ priority_score: sortOrder === 'desc' ? -1 : 1 });
    else if (sortBy === 'sla_deadline') query = query.sort({ sla_deadline: sortOrder === 'desc' ? -1 : 1 });
    else if (sortBy === 'upvotes') query = query.sort({ upvote_count: sortOrder === 'desc' ? -1 : 1 });
    else query = query.sort({ createdAt: sortOrder === 'desc' ? -1 : 1 });

    const issues = await query.exec();

    // Annotate whether current user has upvoted
    const userId = req.user?._id || req.user?.id;
    const formatted = issues.map((issue) => {
      const obj = issue.toObject();
      obj.has_upvoted = userId ? obj.upvotes?.some((uid) => String(uid) === String(userId)) : false;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getIssueById(req, res) {
  try {
    const { id } = req.params;
    let issue = null;

    if (id.startsWith('CF-')) {
      issue = await Issue.findOne({ public_id: id })
        .populate('category')
        .populate('department')
        .populate('reporter', 'name email role');
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      issue = await Issue.findById(id)
        .populate('category')
        .populate('department')
        .populate('reporter', 'name email role');
    } else {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const userId = req.user?._id || req.user?.id;
    const obj = issue.toObject();
    obj.has_upvoted = userId ? obj.upvotes?.some((uid) => String(uid) === String(userId)) : false;

    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 50m Duplicate Detection
export async function checkDuplicates(req, res) {
  try {
    const { category_id, lat, lng, latitude, longitude, radius, radius_meters } = req.body;
    const finalLat = lat !== undefined ? lat : latitude;
    const finalLng = lng !== undefined ? lng : longitude;
    const finalRadius = radius_meters !== undefined ? radius_meters : (radius !== undefined ? radius : 50);

    if (finalLat === undefined || finalLng === undefined) {
      return res.status(400).json({ error: 'Coordinates (lat, lng) are required.' });
    }

    const parsedLat = parseFloat(finalLat);
    const parsedLng = parseFloat(finalLng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Coordinates must be valid numbers.' });
    }

    // Build query filter
    const query = {
      status: { $nin: ['Closed', 'Rejected'] },
    };
    if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
      query.category = category_id;
    }

    // Find non-closed, non-rejected issues
    const issues = await Issue.find(query).populate('category');

    const duplicates = [];
    for (const item of issues) {
      const dist = calculateHaversineDistance(parsedLat, parsedLng, item.lat, item.lng);
      if (dist <= finalRadius) {
        duplicates.push({
          id: item._id,
          public_id: item.public_id,
          title: item.title,
          description: item.description,
          status: item.status,
          lat: item.lat,
          lng: item.lng,
          address_text: item.address_text,
          distance_meters: Math.round(dist * 10) / 10,
          upvote_count: item.upvote_count || 0,
          created_at: item.createdAt,
          first_photo_url: item.photos?.[0]?.url || null,
        });
      }
    }

    duplicates.sort((a, b) => a.distance_meters - b.distance_meters);

    res.json({
      hasDuplicates: duplicates.length > 0,
      count: duplicates.length,
      radiusMeters: finalRadius,
      matches: duplicates,
      duplicates: duplicates,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createIssue(req, res) {
  try {
    const userId = req.user._id || req.user.id;

    // Rate-limit check (max 50 per hour)
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Rate limit exceeded. You can submit up to 50 reports per hour. Please wait ${rateCheck.resetMinutes} minutes.`,
      });
    }

    const { title, description, category_id, category: categoryFromBody, lat, lng, latitude, longitude, address_text, photos } = req.body;
    const finalCatId = category_id !== undefined ? category_id : categoryFromBody;
    const finalLat = lat !== undefined ? lat : latitude;
    const finalLng = lng !== undefined ? lng : longitude;

    if (!title || !description || !finalCatId || finalLat === undefined || finalLng === undefined) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const parsedLat = parseFloat(finalLat);
    const parsedLng = parseFloat(finalLng);
    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ error: 'Valid geographic latitude (-90 to 90) and longitude (-180 to 180) are required.' });
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'At least 1 photo is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(finalCatId)) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const category = await Category.findById(finalCatId);
    if (!category) return res.status(404).json({ error: 'Category not found.' });

    const department = await Department.findById(category.department);
    if (!department) return res.status(404).json({ error: 'Department not found.' });

    // Look up category SLA hours
    const slaRule = await SLARule.findOne({ category: category._id });
    const slaHours = slaRule ? slaRule.slaHours : category.defaultSlaHours;

    const now = new Date();
    const slaDeadline = calculateSLADeadline(now, slaHours);

    // Generate public ID (CF-YYYY-XXXXX)
    const count = await Issue.countDocuments();
    const publicId = `CF-${now.getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const priorityScore = calculatePriorityScore({
      upvoteCount: 0,
      createdAt: now,
      categorySeverity: category.severityWeight,
      currentTime: now,
    });

    const photoDocs = photos.map((url) => ({
      url,
      kind: 'report',
      createdAt: now,
    }));

    const firstEvent = {
      actor: userId,
      actorName: req.user.name || 'Citizen Reporter',
      actorRole: req.user.role || 'citizen',
      eventType: 'created',
      fromStatus: null,
      toStatus: 'Submitted',
      note: `Issue officially reported and auto-assigned to ${department.name}.`,
      createdAt: now,
    };

    const newIssue = await Issue.create({
      public_id: publicId,
      reporter: userId,
      category: category._id,
      department: department._id,
      title,
      description,
      lat: parsedLat,
      lng: parsedLng,
      address_text: address_text || `${parsedLat.toFixed(5)}, ${parsedLng.toFixed(5)}`,
      status: 'Submitted',
      priority_score: priorityScore,
      sla_deadline: slaDeadline,
      escalation_level: 0,
      upvotes: [],
      upvote_count: 0,
      photos: photoDocs,
      events: [firstEvent],
    });

    // Notify citizen
    await Notification.create({
      user: userId,
      issue: newIssue._id,
      issuePublicId: publicId,
      message: `Your issue ${publicId} has been successfully submitted to ${department.name}.`,
    });

    const populated = await Issue.findById(newIssue._id)
      .populate('category')
      .populate('department')
      .populate('reporter', 'name email role');

    recordSubmission(userId);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note, proofPhotoUrl } = req.body;
    const actor = req.user;

    let issue = null;
    if (id.startsWith('CF-')) {
      issue = await Issue.findOne({ public_id: id }).populate('category');
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      issue = await Issue.findById(id).populate('category');
    }

    if (!issue) return res.status(404).json({ error: 'Issue not found.' });

    const isReporter = String(issue.reporter) === String(actor._id || actor.id);

    // Validate transition using pure state machine
    const validation = validateStatusTransition({
      from: issue.status,
      to: status,
      role: actor.role,
      isReporter,
      note,
      proofPhotoUrl,
      resolvedAt: issue.resolved_at,
      currentDate: new Date(),
    });

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const now = new Date();
    const fromStatus = issue.status;
    issue.status = status;

    if (status === 'Resolved') {
      issue.resolved_at = now;
      if (proofPhotoUrl) {
        issue.photos.push({
          url: proofPhotoUrl,
          kind: 'proof',
          createdAt: now,
        });
      }
    } else if (status === 'Closed') {
      issue.closed_at = now;
    }

    issue.events.push({
      actor: actor._id || actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: status === 'Reopened' ? 'reopened' : 'status_change',
      fromStatus,
      toStatus: status,
      note: note || `Status transitioned to ${status}`,
      createdAt: now,
    });

    await issue.save();

    // Create notification for reporter
    await Notification.create({
      user: issue.reporter,
      issue: issue._id,
      issuePublicId: issue.public_id,
      message: `Issue ${issue.public_id} updated: changed from ${fromStatus} to ${status}.`,
    });

    const updated = await Issue.findById(issue._id)
      .populate('category')
      .populate('department')
      .populate('reporter', 'name email role');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function toggleUpvote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    let issue = null;
    if (id.startsWith('CF-')) {
      issue = await Issue.findOne({ public_id: id }).populate('category');
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      issue = await Issue.findById(id).populate('category');
    }

    if (!issue) return res.status(404).json({ error: 'Issue not found.' });

    const hasUpvoted = issue.upvotes.some((uid) => String(uid) === String(userId));

    if (hasUpvoted) {
      issue.upvotes = issue.upvotes.filter((uid) => String(uid) !== String(userId));
    } else {
      issue.upvotes.push(userId);
    }

    issue.upvote_count = issue.upvotes.length;

    // Recalculate priority
    const sev = issue.category ? issue.category.severityWeight : 5;
    issue.priority_score = calculatePriorityScore({
      upvoteCount: issue.upvote_count,
      createdAt: issue.createdAt,
      categorySeverity: sev,
    });

    await issue.save();

    res.json({
      success: true,
      hasUpvoted: !hasUpvoted,
      upvoteCount: issue.upvote_count,
      priorityScore: issue.priority_score,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
