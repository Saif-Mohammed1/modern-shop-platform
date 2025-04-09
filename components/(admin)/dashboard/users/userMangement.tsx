import { DateTime } from "luxon";
import {
  AiOutlineCheckCircle, // ✅ BadgeCheck (Ant Design)
} from "react-icons/ai";
import {
  FaLockOpen,
  FaTableTennis,
  FaUserPlus,
  FaWallet, // 👛 Wallet (FontAwesome)
} from "react-icons/fa";
import {
  FiActivity,
  // 🌍 Globe (Feather)
  FiBellOff,
  FiClock,
  // 📧 Mail (Feather) - No "MailWarning"
  FiGlobe,
  // 🛡️ Shield (Feather) - No direct "ShieldAlert"
  FiLock,
  // 🔒 Lock (Feather) - No "LockKeyhole"
  FiMail,
  FiMonitor, // 🔕 BellOff (Feather)
  FiSettings,
  // ⏰ Clock (Feather)
  FiShield,
} from "react-icons/fi";
import {
  MdAlignHorizontalCenter, // 🌐 Languages (Material Icons)
  // 📱 MonitorSmartphone (Material Icons)
  MdLanguage,
  MdSmartphone,
} from "react-icons/md";

import type { UserStatus } from "@/app/lib/types/users.types";
import { cn } from "@/app/lib/utilities/cn";

interface LoginHistory {
  timestamp: string;
  browser: string;
  os: string;
  device: string;
  location?: string;
  success: boolean;
  ip: string;
}
interface Details {
  device: LoginHistory;
  newEmail: string;
}
interface AuditLog {
  timestamp: string;
  action: string;
  details: Details;
}

interface UserPreferencesProps {
  preferences: {
    // theme: string;
    // notifications: boolean;
    // language: string;
    language: string;
    currency: string;
    marketingOptIn: boolean;
  };
}
interface Security {
  twoFactorEnabled: boolean;
  rateLimits: {
    login: {
      locked: boolean;
      lastAttempt: string;
      attempts: number;
    };
    passwordReset: {
      attempts: number;
      lastAttempt: Date;
      lockUntil: Date;
    };
    verification: {
      attempts: number;
      lastAttempt: Date;
      lockUntil: Date;
    };
    "2fa": {
      attempts: number;
      lastAttempt: Date;
      lockUntil: Date;
    };
    backup_recovery: {
      attempts: number;
      lastAttempt: Date;
      lockUntil: Date;
    };
  };
  behavioralFlags: {
    suspiciousDeviceChange: boolean;
    impossibleTravel: boolean;
    requestVelocity: number;
  };
  auditLog: AuditLog[];
  loginHistory: LoginHistory[];
  lastLogin: string;
  passwordChangedAt: string;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  authMethods: string[];
  security: Security;
  preferences: UserPreferencesProps["preferences"];
  status: UserStatus;
}

// interface StatusBadgeProps {
//   status: "ACTIVE" | "SUSPENDED" | "PENDING";
// }

// Add these to your utils
const languageNames: Record<string, string> = {
  uk: "Ukrainian",
  en: "English",
};

const currencySymbols: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
};

const actionTitles: Record<string, string> = {
  REGISTRATION: "Account Created",
  PASSWORD_RESET_REQUEST: "Password Reset Requested",
  PASSWORD_RESET: "Password Changed",
  EMAIL_CHANGE_REQUEST: "Email Change Requested",
  VERIFICATION_EMAIL_REQUEST: "Verification Email Sent",
  VERIFICATION_EMAIL_FAILURE: "Verification Failed",
};
const statusColors: Record<UserStatus, string> = {
  active: "bg-green-500", // Green for active users
  suspended: "bg-red-500", // Red for suspended users
  // pending: "bg-yellow-500", // Yellow for pending users
  inactive: "bg-gray-400", // Gray for inactive users
  deleted: "bg-gray-500", // Darker gray for deleted users
};
export default function UserAdminPage({ user }: { user: User }) {
  if (!user) {
    return <p className="text-red-500">User not found</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {user.name}
            <StatusBadge status={user.status} />
          </h1>
          <span className="text-muted-foreground">#{user._id.slice(-6)}</span>
        </div>
        <AccountHealthIndicator security={user.security} />
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <UserProfileCard user={user} />
        <SecurityStatusCard security={user.security} />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <ActivityFeed logs={user.security.auditLog} />
        <SessionHistory sessions={user.security.loginHistory} />
      </section>

      <UserPreferencesPanel preferences={user.preferences} />
    </div>
  );
}

function AccountHealthIndicator({ security }: { security: Security }) {
  const warnings = [
    security.behavioralFlags.impossibleTravel && "Suspicious location activity",
    security.behavioralFlags.suspiciousDeviceChange && "Device change detected",
    security.rateLimits.login.attempts > 3 && "Multiple failed logins",
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm">
      {warnings.length > 0 ? (
        <>
          <FiShield className="text-yellow-600" size={18} />
          <span className="text-yellow-600">
            {warnings.length} active security{" "}
            {warnings.length === 1 ? "warning" : "warnings"}
          </span>
        </>
      ) : (
        <>
          <FiShield className="text-green-600" size={18} />
          <span className="text-green-600">All security systems normal</span>
        </>
      )}
    </div>
  );
}

function UserProfileCard({ user }: { user: User }) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <MdSmartphone size={20} />
        Profile Overview
      </h2>

      <dl className="grid grid-cols-2 gap-4">
        <DetailItem
          label="Registered"
          value={new Date(user.createdAt).toLocaleDateString()}
        />
        <DetailItem
          label="Last Active"
          value={<RelativeTime date={user.security?.lastLogin} />}
        />
        <DetailItem
          label="Authentication"
          value={
            <div className="flex items-center gap-1.5">
              {user.authMethods.map((method) => (
                <span key={method} className="capitalize badge badge-outline">
                  {method.toLowerCase()}
                </span>
              ))}
              {user.security.twoFactorEnabled ? (
                <span className="badge badge-success">
                  <FiLock size={14} className="mr-1" />
                  2FA Enabled
                </span>
              ) : null}
            </div>
          }
        />
        <DetailItem
          label="Contact"
          value={
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {user.email}
                {user.verification.emailVerified ? (
                  <AiOutlineCheckCircle className="text-green-600" size={16} />
                ) : (
                  <FiMail className="text-yellow-600 " size={16} />
                )}
              </div>
              {user.phone ? (
                <div className="flex items-center gap-1.5">
                  {user.phone}
                  {user.verification.phoneVerified ? (
                    <AiOutlineCheckCircle
                      className="text-green-600"
                      size={16}
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Unverified
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          }
        />
      </dl>
    </div>
  );
}

function SecurityStatusCard({ security }: { security: Security }) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FiLock size={20} />
        Security Status
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <SecurityMetric
          label="Recent Failed Logins"
          value={security.rateLimits.login.attempts}
          status={security.rateLimits.login.attempts > 3 ? "warning" : "normal"}
        />
        <SecurityMetric
          label="Password Resets"
          value={security.rateLimits.passwordReset.attempts}
          status={
            security.rateLimits.passwordReset.attempts > 2
              ? "warning"
              : "normal"
          }
        />
        <SecurityMetric
          label="2FA Attempts"
          value={security.rateLimits["2fa"].attempts}
          status={
            security.rateLimits["2fa"].attempts > 1 ? "warning" : "normal"
          }
        />
        <SecurityMetric
          label="Request Velocity"
          value={`${security.behavioralFlags.requestVelocity}/hr`}
          status={
            security.behavioralFlags.requestVelocity > 100
              ? "warning"
              : "normal"
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Password Change</span>
          <RelativeTime date={security.passwordChangedAt} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Recent Security Events</span>
          <span
            className={cn(
              security.auditLog.length > 5
                ? "text-yellow-600"
                : "text-muted-foreground"
            )}
          >
            {security.auditLog.length} in last 30 days
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed({ logs }: { logs: AuditLog[] }) {
  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <FiClock size={20} />
        Recent Activity
      </h2>

      <div className="space-y-4">
        {Object.entries(groupedLogs).map(([date, dailyLogs]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {date}
            </h3>
            {dailyLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  <ActivityIcon action={log.action} />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {actionTitles[log.action] || log.action}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <RelativeTime date={log.timestamp} />
                    {log.details?.device?.location ? (
                      <span className="ml-2">
                        <FiGlobe size={12} className="inline mr-1" />
                        {log.details.device.location}
                      </span>
                    ) : null}
                  </div>
                  {log.details?.newEmail ? (
                    <div className="text-xs text-blue-600">
                      New email: {log.details?.newEmail}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionHistory({ sessions }: { sessions: LoginHistory[] }) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <FiGlobe size={20} />
        Login Sessions
      </h2>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg"
          >
            <div className="flex-shrink-0">
              <DeviceIcon device={session.device} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {session.browser} on {session.os}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    session.success ? "text-green-600" : "text-red-600"
                  )}
                >
                  {session.success ? "Successful" : "Failed"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <RelativeTime date={session.timestamp} />
                {session.location ? (
                  <span className="ml-2">
                    <FiGlobe size={12} className="inline mr-1" />
                    {session.location}
                  </span>
                ) : null}
              </div>
              <div className="text-xs font-mono text-muted-foreground truncate">
                {truncateHash(session.ip)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserPreferencesPanel({ preferences }: UserPreferencesProps) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <FiSettings size={20} />
        Preferences & Settings
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <MdLanguage size={18} className="text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Language</div>
            <div className="font-medium">
              {languageNames[preferences.language] || preferences.language}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaWallet size={18} className="text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Currency</div>
            <div className="font-medium">
              {currencySymbols[preferences.currency] || preferences.currency}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FiBellOff size={18} className="text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">
              Marketing Emails
            </div>
            <div className="font-medium">
              {preferences.marketingOptIn ? "Subscribed" : "Not Subscribed"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components and utilities
function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function SecurityMetric({
  label,
  value,
  status,
}: {
  label: string;
  value: string | number;
  status: "normal" | "warning";
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-semibold",
          status === "warning" ? "text-yellow-600" : "text-foreground"
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function RelativeTime({ date }: { date: string }) {
  const relativeTime = DateTime.fromISO(date).toRelative();
  return (
    <time dateTime={date} className="text-muted-foreground">
      {relativeTime}
    </time>
  );
}

function ActivityIcon({ action }: { action: string }) {
  const iconProps = { size: 16 };
  switch (action) {
    case "REGISTRATION":
      return <FaUserPlus {...iconProps} className="text-blue-600" />;
    case "PASSWORD_RESET_REQUEST":
      return <FiLock {...iconProps} className="text-red-600" />;
    case "PASSWORD_RESET":
      return <FaLockOpen {...iconProps} className="text-green-600" />;
    case "EMAIL_CHANGE_REQUEST":
      return (
        <MdAlignHorizontalCenter {...iconProps} className="text-purple-600" />
      );
    default:
      return <FiActivity {...iconProps} className="text-muted-foreground" />;
  }
}

function DeviceIcon({ device }: { device: string }) {
  const iconProps = { size: 20 };
  if (device.includes("Mobile")) {
    return <MdSmartphone {...iconProps} />;
  }
  if (device.includes("Tablet")) {
    return <FaTableTennis {...iconProps} />;
  }
  return <FiMonitor {...iconProps} />;
}

function truncateHash(hash: string, length = 8) {
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

function groupLogsByDate(logs: AuditLog[]) {
  return logs.reduce(
    (acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    },
    {} as Record<string, AuditLog[]>
  );
}
function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`px-2 py-1 text-xs font-bold text-white rounded-lg ${statusColors[status]}`}
    >
      {status}
    </span>
  );
}
