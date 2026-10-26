/**
 * In-memory sliding window rate limiter for issue reporting.
 * Limits users to max 10 submissions per hour.
 */
interface RateRecord {
  timestamps: number[];
}

const userSubmissions = new Map<string, RateRecord>();

export function checkReportRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 60 * 1000
): { allowed: boolean; remaining: number; resetMinutes: number } {
  const now = Date.now();
  const record = userSubmissions.get(userId) || { timestamps: [] };

  // Filter timestamps within the window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = windowMs - (now - oldestTimestamp);
    const resetMinutes = Math.max(1, Math.ceil(resetMs / (60 * 1000)));
    return {
      allowed: false,
      remaining: 0,
      resetMinutes,
    };
  }

  // Record this submission
  record.timestamps.push(now);
  userSubmissions.set(userId, record);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMinutes: Math.ceil(windowMs / (60 * 1000)),
  };
}
