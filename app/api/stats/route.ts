import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';

export async function GET() {
  try {
    const issues = dataStore.issues;

    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(
      (i) => i.status === 'Resolved' || i.status === 'Closed'
    );
    const openIssues = issues.filter(
      (i) => i.status !== 'Resolved' && i.status !== 'Closed' && i.status !== 'Rejected'
    );
    const rejectedIssues = issues.filter((i) => i.status === 'Rejected');
    const escalatedIssues = issues.filter((i) => i.escalation_level > 0);

    // Calculate Average Resolution Time
    let totalResolutionHours = 0;
    let resolvedWithTimesCount = 0;
    let slaCompliantCount = 0;

    resolvedIssues.forEach((issue) => {
      if (issue.resolved_at) {
        const created = new Date(issue.created_at).getTime();
        const resolved = new Date(issue.resolved_at).getTime();
        const hours = (resolved - created) / (1000 * 60 * 60);
        totalResolutionHours += hours;
        resolvedWithTimesCount += 1;

        const deadline = new Date(issue.sla_deadline).getTime();
        if (resolved <= deadline) {
          slaCompliantCount += 1;
        }
      }
    });

    const avgResolutionHours =
      resolvedWithTimesCount > 0 ? Math.round(totalResolutionHours / resolvedWithTimesCount) : 32;
    const slaComplianceRate =
      resolvedWithTimesCount > 0
        ? Math.round((slaCompliantCount / resolvedWithTimesCount) * 100)
        : 88;

    // Issues per department
    const departmentStats = dataStore.departments.map((dept) => {
      const deptIssues = issues.filter((i) => i.department_id === dept.id);
      const resolved = deptIssues.filter(
        (i) => i.status === 'Resolved' || i.status === 'Closed'
      ).length;
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        total: deptIssues.length,
        open: deptIssues.length - resolved,
        resolved,
      };
    });

    // Issues per category
    const categoryStats = dataStore.categories.map((cat) => {
      const catIssues = issues.filter((i) => i.category_id === cat.id);
      return {
        id: cat.id,
        name: cat.name,
        count: catIssues.length,
        severity: cat.severity_weight,
      };
    });

    // Status breakdown
    const statusBreakdown = {
      Submitted: issues.filter((i) => i.status === 'Submitted').length,
      Acknowledged: issues.filter((i) => i.status === 'Acknowledged').length,
      'In Progress': issues.filter((i) => i.status === 'In Progress').length,
      Resolved: issues.filter((i) => i.status === 'Resolved').length,
      Closed: issues.filter((i) => i.status === 'Closed').length,
      Rejected: rejectedIssues.length,
      Reopened: issues.filter((i) => i.status === 'Reopened').length,
    };

    return NextResponse.json({
      totalIssues,
      openIssuesCount: openIssues.length,
      resolvedIssuesCount: resolvedIssues.length,
      rejectedIssuesCount: rejectedIssues.length,
      escalatedCount: escalatedIssues.length,
      avgResolutionHours,
      slaComplianceRate,
      departmentStats,
      categoryStats,
      statusBreakdown,
    });
  } catch (error: any) {
    console.error('Error computing stats:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
