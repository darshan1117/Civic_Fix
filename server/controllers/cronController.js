import { Issue } from '../models/Issue.js';
import { Department } from '../models/Department.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export async function escalateOverdueIssues(req, res) {
  try {
    const configuredSecret = process.env.CRON_SECRET || 'civicfix-cron-secret-demo-key';
    const authHeader = req.headers.authorization;
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const xCronSecret = req.headers['x-cron-secret'];
    const provided = bearer || xCronSecret;

    const isAdmin = req.user && req.user.role === 'admin';
    const isSecretValid = provided === configuredSecret;

    if (!isSecretValid && !isAdmin) {
      return res.status(401).json({
        error: 'Unauthorized: Valid CRON_SECRET or Admin session required.',
      });
    }

    const now = new Date();
    const isDemoMinutes = process.env.SLA_TIME_UNIT === 'minutes';
    const level2ThresholdMs = isDemoMinutes ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // Find active non-completed issues that have breached their SLA
    const overdueIssues = await Issue.find({
      status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      sla_deadline: { $lt: now },
      escalation_level: { $in: [0, 1] }, // only 0 or 1 can be escalated further
    }).populate('department');

    const adminUser = await User.findOne({ role: 'admin' });
    const escalated = [];

    for (const issue of overdueIssues) {
      const overdueMs = now.getTime() - new Date(issue.sla_deadline).getTime();
      let newLevel = null;
      let targetUser = null;
      let targetRole = '';

      if (issue.escalation_level === 0) {
        newLevel = 1;
        targetUser = issue.department?.head || adminUser?._id;
        targetRole = 'Department Head';
      } else if (issue.escalation_level === 1 && overdueMs >= level2ThresholdMs) {
        newLevel = 2;
        targetUser = adminUser?._id;
        targetRole = 'City Commissioner';
      }

      if (newLevel !== null) {
        issue.escalation_level = newLevel;
        issue.events.push({
          actor: null,
          actorName: 'System Auto-Escalation Engine',
          actorRole: 'system',
          eventType: 'escalation',
          fromStatus: issue.status,
          toStatus: issue.status,
          note: `Statutory SLA breached. Escalated to Level ${newLevel} (${targetRole} notified).`,
          createdAt: now,
        });

        await issue.save();

        if (targetUser) {
          await Notification.create({
            user: targetUser,
            issue: issue._id,
            issuePublicId: issue.public_id,
            message: `CRITICAL ALERT: Issue ${issue.public_id} (${issue.title}) is overdue and escalated to Level ${newLevel}.`,
          });
        }

        escalated.push({
          id: issue._id,
          public_id: issue.public_id,
          newLevel,
        });
      }
    }

    res.json({
      success: true,
      timestamp: now.toISOString(),
      mode: isDemoMinutes ? 'demo (minutes)' : 'production (hours)',
      escalatedCount: escalated.length,
      details: escalated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
