// src/lib/types/security.types.ts
export type SecurityDashboardData = {
  summary: {
    totalUsers: number;
    activeSessions: number;
    lockedAccounts: number;
    recentThreats: number;
    twoFactorAdoption: number;
  };
  activity: {
    loginsLast24h: number;
    failedAttempts: number;
    passwordResets: number;
    accountVerifications: number;
  };
  threatDetection: {
    impossibleTravelCases: number;
    suspiciousDevices: number;
    highVelocityRequests: number;
    botAttempts: number;
  };
  rateLimits: {
    loginLockouts: number;
    passwordResetLockouts: number;
    verificationLockouts: number;
  };
  trends: {
    loginAttempts: Array<{date: string; attempts: number}>;
    securityEvents: Array<{date: string; count: number}>;
  };
  recentEvents: Array<{
    timestamp: Date;
    type: string;
    user: string;
    location?: string;
    details: string;
  }>;
};
