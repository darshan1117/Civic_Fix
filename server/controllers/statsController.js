import { Issue } from '../models/Issue.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { SLARule } from '../models/SLARule.js';
import { Notification } from '../models/Notification.js';

export async function getStats(req, res) {
  try {
    const issues = await Issue.find({}).populate('category').populate('department');

    const totalIssues = issues.length;
    const resolvedIssues = issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed');
    const openIssues = issues.filter((i) => !['Resolved', 'Closed', 'Rejected'].includes(i.status));
    const rejectedIssues = issues.filter((i) => i.status === 'Rejected');
    const escalatedIssues = issues.filter((i) => i.escalation_level > 0);

    let totalResolutionHours = 0;
    let resolvedWithTimesCount = 0;
    let slaCompliantCount = 0;

    resolvedIssues.forEach((issue) => {
      if (issue.resolved_at) {
        const created = new Date(issue.createdAt).getTime();
        const resolved = new Date(issue.resolved_at).getTime();
        const hours = (resolved - created) / (1000 * 60 * 60);
        totalResolutionHours += hours;
        resolvedWithTimesCount += 1;

        if (resolved <= new Date(issue.sla_deadline).getTime()) {
          slaCompliantCount += 1;
        }
      }
    });

    const avgResolutionHours = resolvedWithTimesCount > 0 ? Math.round(totalResolutionHours / resolvedWithTimesCount) : 28;
    const slaComplianceRate = resolvedWithTimesCount > 0 ? Math.round((slaCompliantCount / resolvedWithTimesCount) * 100) : 90;

    const departments = await Department.find({});
    const departmentStats = departments.map((dept) => {
      const deptIssues = issues.filter((i) => String(i.department?._id || i.department) === String(dept._id));
      const resolved = deptIssues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
      return {
        id: dept._id,
        name: dept.name,
        code: dept.code,
        total: deptIssues.length,
        open: deptIssues.length - resolved,
        resolved,
      };
    });

    const categories = await Category.find({});
    const categoryStats = categories.map((cat) => {
      const count = issues.filter((i) => String(i.category?._id || i.category) === String(cat._id)).length;
      return {
        id: cat._id,
        name: cat.name,
        count,
        severity: cat.severityWeight,
      };
    });

    res.json({
      totalIssues,
      openIssuesCount: openIssues.length,
      resolvedIssuesCount: resolvedIssues.length,
      rejectedIssuesCount: rejectedIssues.length,
      escalatedCount: escalatedIssues.length,
      avgResolutionHours,
      slaComplianceRate,
      departmentStats,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getDepartments(req, res) {
  try {
    const departments = await Department.find({}).populate('head', 'name email');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await Category.find({}).populate('department');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSLARules(req, res) {
  try {
    const rules = await SLARule.find({}).populate('category');
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateSLARule(req, res) {
  try {
    const { category_id, sla_hours } = req.body;
    let rule = await SLARule.findOne({ category: category_id });
    if (!rule) {
      rule = await SLARule.create({ category: category_id, slaHours: sla_hours });
    } else {
      rule.slaHours = sla_hours;
      await rule.save();
    }
    const populated = await SLARule.findById(rule._id).populate('category');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNotifications(req, res) {
  try {
    const userId = req.query.userId || req.user?._id || req.user?.id;
    if (!userId) return res.json([]);
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id, markAll, userId } = req.body;
    if (markAll && userId) {
      await Notification.updateMany({ user: userId }, { read: true });
      return res.json({ success: true });
    }
    if (id) {
      await Notification.findByIdAndUpdate(id, { read: true });
      return res.json({ success: true });
    }
    res.status(400).json({ error: 'Invalid payload' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
