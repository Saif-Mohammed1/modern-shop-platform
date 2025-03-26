// src/lib/services/email.service.ts
import nodemailer from "nodemailer";
import type { DeviceInfo } from "../../lib/types/session.types";
import { UserRepository } from "@/app/server/repositories/user.repository";
interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  priority?: "high" | "normal" | "low";
  attachments?: nodemailer.SendMailOptions["attachments"]; // Add attachments property
}
export enum SecurityAlertType {
  SUSPICIOUS_LOGIN = "SUSPICIOUS_LOGIN",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  NEW_DEVICE = "NEW_DEVICE",
  IMPOSSIBLE_TRAVEL = "IMPOSSIBLE_TRAVEL",
  SECURITY_SETTINGS_CHANGED = "SECURITY_SETTINGS_CHANGED",
  BACKUP_CODES_GENERATED = "BACKUP_CODES_GENERATED",
  BACKUP_CODES_CONSUMED = "BACKUP_CODES_CONSUMED",
  MFA_ENABLED = "MFA_ENABLED",
  MFA_DISABLED = "MFA_DISABLED",
  BOT_DETECTED = "BOT_DETECTED",
  DATA_EXPORT_REQUESTED = "DATA_EXPORT_REQUESTED",
  ACCOUNT_RECOVERY_INITIATED = "ACCOUNT_RECOVERY_INITIATED",
  UNUSUAL_ACTIVITY = "UNUSUAL_ACTIVITY",
  CRITICAL_ALERT = "CRITICAL_ALERT",
  LOW_BACKUP_CODES = "LOW_BACKUP_CODES",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
}
// interface SecurityAlertEmailParams {
//   type: SecurityAlertType;
//   attempts?: number;
//   locations?: GeoLocation[];
//   device?: string;
//   timestamp?: Date;
//   ipAddress?: string;
// }
interface SecurityAlertEmailParams {
  type: SecurityAlertType;
  timestamp?: Date;
  ipAddress?: string;
  location?: string;
  device?: {
    os?: string;
    browser?: string;
    model?: string;
  };
  additionalInfo?: {
    changedSetting?: string;
    recoveryMethods?: string[];
    locations?: string[];
    affectedService?: string;
    detectedLocation?: string;
    sourceLocation?: string;
    remainingCodes?: number; // Add this
    attempts?: number; // Add this
    codesGenerated?: number;
    codesRemaining?: number;
  };
}
// Add type definition
export interface AdminInventoryNotification {
  type: "INVENTORY_RESERVATION_PARTIAL" | "INVENTORY_RESERVATION_FAILED";
  userId: string;
  failedProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  timestamp: Date;
}
// Configuration and instantiation
const emailConfig: EmailConfig = {
  service: "gmail",
  auth: {
    user: process.env.GMAIL!,
    pass: process.env.PASSWORD!,
  },
};
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly appName: string;
  private readonly appUrl: string;
  private readonly senderEmail: string;
  private config: EmailConfig = emailConfig;
  constructor(private readonly userRepo: UserRepository) {
    this.validateEnvironment();
    this.transporter = nodemailer.createTransport(this.config);
    this.appName = process.env.APP_NAME || "Our Service";
    this.appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    this.senderEmail = `${this.appName} <${this.config.auth.user}>`;
  }

  private validateEnvironment() {
    if (!process.env.APP_NAME) {
      throw new Error("APP_NAME environment variable is required");
    }
    if (!process.env.NEXTAUTH_URL) {
      console.warn("NEXTAUTH_URL environment variable not set, using default");
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.senderEmail,
        to,
        ...template,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error(
        `Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private baseTemplate(content: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif; 
                   max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <header style="border-bottom: 1px solid #e8e8e8; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2d3748; margin: 0; font-size: 24px;">
            ${this.appName}
          </h1>
        </header>
        
        <main style="color: #4a5568;">
          ${content}
        </main>
        
        <footer style="border-top: 1px solid #e8e8e8; margin-top: 40px; padding-top: 20px; 
                      text-align: center; color: #718096; font-size: 14px;">
          <p>© ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
          <p style="margin: 8px 0;">
            Need help? <a href="mailto:${this.config.auth.user}" 
                        style="color: #4299e1; text-decoration: none;">Contact our support team</a>
          </p>
        </footer>
      </div>
    `;
  }

  private createButton(href: string, text: string): string {
    return `
      <a href="${href}" 
         style="display: inline-block; background: #4299e1; color: white; 
                padding: 12px 24px; border-radius: 6px; text-decoration: none; 
                font-weight: 500; margin: 20px 0;">
        ${text}
      </a>
    `;
  }

  private createCodeBlock(code: string): string {
    return `
      <div style="background: #f7fafc; padding: 16px; border-radius: 6px; 
                  border: 1px solid #e2e8f0; text-align: center; 
                  margin: 20px 0; font-family: monospace; font-size: 18px; 
                  color: #2d3748;">
        ${code}
      </div>
    `;
  }

  private deviceTable(device: DeviceInfo): string {
    return `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${Object.entries(device)
          .map(
            ([key, value]) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; 
                      font-weight: 500; color: #4a5568;">${key}</td>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; 
                      color: #718096;">${value}</td>
          </tr>
        `
          )
          .join("")}
      </table>
    `;
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const confirmUrl = `${this.appUrl}/auth/reset-password?token=${token}&email=${email}`;
    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Password Reset Request</h2>
      <p>Use the following verification code to reset your password:</p>
      ${this.createButton(confirmUrl, "Reset Password")}
      <p style="color: #718096; font-size: 14px;">
        This code will expire in 10 minutes. If you didn't request this reset, 
        please contact our support team immediately.
      </p>
    `;

    await this.sendEmail(email, {
      subject: `Password Reset Request - ${this.appName}`,
      html: this.baseTemplate(content),
    });
  }
  async forcePasswordReset(email: string, password: string): Promise<void> {
    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Password Reset Request</h2>
      <p>Your password has been reset by an administrator. Please use the following password to login:</p>
      ${this.createCodeBlock(password)}
      <p style="color: #718096; font-size: 14px;">
        we recommend changing your password after logging in.
      </p>
    `;
    await this.sendEmail(email, {
      subject: `Password Reset Request - ${this.appName}`,
      html: this.baseTemplate(content),
    });
  }
  // async sendPasswordReset(email: string, token: string): Promise<void> {
  //   const content = `
  //     <h2 style="color: #2d3748; margin-top: 0;">Password Reset Request</h2>
  //     <p>Use the following verification code to reset your password:</p>
  //     ${this.createCodeBlock(token)}
  //     <p style="color: #718096; font-size: 14px;">
  //       This code will expire in 10 minutes. If you didn't request this reset,
  //       please contact our support team immediately.
  //     </p>
  //   `;

  //   await this.sendEmail(email, {
  //     subject: `Password Reset Request - ${this.appName}`,
  //     html: this.baseTemplate(content),
  //   });
  // }

  async sendEmailChangeConfirmation(
    email: string,
    token: string
  ): Promise<void> {
    const confirmUrl = `${this.appUrl}/confirm-email-change?token=${token}`;
    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Confirm Email Change</h2>
      <p>Please click the button below to confirm your new email address:</p>
      ${this.createButton(confirmUrl, "Confirm Email Change")}
      <p style="color: #718096; font-size: 14px; margin-top: 25px;">
        If you didn't request this change, please secure your account immediately.
      </p>
    `;

    await this.sendEmail(email, {
      subject: `Confirm Email Change - ${this.appName}`,
      html: this.baseTemplate(content),
    });
  }
  // async sendPasswordChangeConfirmation(
  //   email: string,
  //   token: string
  // ): Promise<void> {
  //   const confirmUrl = `${this.appUrl}/confirm-password-change?token=${token}`;
  //   const content = `
  //     <h2 style="color: #2d3748; margin-top: 0;">Confirm Password Change</h2>
  //     <p>Please click the button below to confirm your new password:</p>
  //     ${this.createButton(confirmUrl, "Confirm Password Change")}
  //     <p style="color: #718096; font-size: 14px; margin-top: 25px;">
  //       If you didn't request this change, please secure your account immediately.
  //     </p>
  //   `;

  //   await this.sendEmail(email, {
  //     subject: `Confirm Password Change - ${this.appName}`,
  //     html: this.baseTemplate(content),
  //   });
  // }
  //  notify user that he change his password
  async sendPasswordChangeConfirmation(email: string): Promise<void> {
    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Password Change Confirmation</h2>
      <p>Your password has been successfully changed.</p>
      <p style="color: #718096; font-size: 14px; margin-top: 25px;">
        If you didn't request this change, please secure your account immediately.
      </p>
    `;

    await this.sendEmail(email, {
      subject: `Password Change Confirmation - ${this.appName}`,
      html: this.baseTemplate(content),
    });
  }

  // async sendSecurityAlertEmail(
  //   userEmail: string,
  //   alertParams: SecurityAlertEmailParams
  // ) {
  //   const { type, attempts, locations, device, ipAddress } = alertParams;

  //   // Get user-friendly alert details
  //   const alertDetails = this.getAlertDetails(
  //     type,
  //     attempts,
  //     locations,
  //     device,
  //     ipAddress
  //   );

  //   // Build email template
  //   const content = `
  //   <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
  //     <h2 style="color: #dc3545;">Security Alert: ${alertDetails.title}</h2>

  //     <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
  //       <p>${alertDetails.message}</p>

  //       ${
  //         locations?.length
  //           ? `
  //         <h4 style="color: #6c757d;">Recent Activity Locations:</h4>
  //         <ul>
  //           ${locations.map((l) => `<li>${l}</li>`).join("")}
  //         </ul>
  //       `
  //           : ""
  //       }

  //       ${device ? `<p><strong>Device:</strong> ${device}</p>` : ""}
  //       ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ""}

  //       <p style="margin-top: 20px;">
  //         <a href="${process.env.APP_URL}/security"
  //            style="background: #dc3545; color: white; padding: 10px 20px;
  //                   text-decoration: none; border-radius: 5px;">
  //           Review Account Security
  //         </a>
  //       </p>
  //     </div>

  //     <footer style="margin-top: 30px; font-size: 0.9em; color: #6c757d;">
  //       <p>This is an automated security alert. If you didn't initiate this action,
  //          <a href="${process.env.APP_URL}/support">contact support immediately</a>.</p>
  //     </footer>
  //   </div>
  // `;

  //   try {
  //     await this.sendEmail(userEmail, {
  //       subject: `🔒 Security Alert: ${alertDetails.title}`,

  //       html: this.baseTemplate(content),
  //       priority: "high",
  //     });
  //     // Log the alert in the user's audit trail
  //     await UserModel.findOneAndUpdate(
  //       { email: userEmail },
  //       {
  //         $push: {
  //           "security.auditLog": {
  //             timestamp: new Date(),
  //             action: "SECURITY_ALERT_SENT",
  //             details: alertDetails.auditMessage,
  //           },
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Failed to send security email:", error);
  //     // Implement fallback notification here
  //   }
  // }

  // Refactored Email Service Method
  async sendSecurityAlertEmail(
    userEmail: string,
    alertParams: SecurityAlertEmailParams
  ): Promise<void> {
    const {
      type,
      timestamp = new Date(),
      ipAddress,
      location,
      device,
      additionalInfo,
    } = alertParams;

    const { subject, priority, template } = this.getAlertTemplate(
      type,
      timestamp,
      ipAddress,
      location,
      device,
      additionalInfo
    );

    try {
      await this.sendEmail(userEmail, {
        subject,
        html: this.baseTemplate(template),
        priority,
        attachments: this.generateAlertAttachments(type),
      });

      await this.userRepo.logSecurityAlert(userEmail, type, {
        success: true,

        ipAddress,
        location,
        ...device,
      });
    } catch (error) {
      console.error(`Failed to send ${type} alert:`, error);
      // await this.queueRetryNotification(userEmail, type);
    }
  }

  private getAlertTemplate(
    type: SecurityAlertType,
    timestamp: Date,
    ipAddress?: string,
    location?: string,
    device?: { os?: string; browser?: string; model?: string },
    additionalInfo?: any
  ) {
    const formattedTime = timestamp.toLocaleString();
    const deviceDetails = device
      ? `
    <p><strong>Device:</strong> ${device.model || "Unknown"} 
    (${device.os || "Unknown OS"} / ${device.browser || "Unknown Browser"})</p>
  `
      : "";

    const baseContent = `
    <div style="padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #2d3748; margin-top: 0;">${this.getAlertTitle(type)}</h2>
      <div style="color: #4a5568;">
        <p><strong>Time:</strong> ${formattedTime}</p>
        ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ""}
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
        ${deviceDetails}
        ${this.getAlertSpecificContent(type, additionalInfo)}
      </div>
      ${this.getActionButtons(type)}
      ${this.getSecurityRecommendations(type)}
    </div>
  `;

    return {
      subject: `${this.getAlertEmoji(type)} ${this.getAlertTitle(type)} - ${this.appName}`,
      priority: this.getAlertPriority(type),
      template: baseContent,
    };
  }

  private getAlertSpecificContent(
    type: SecurityAlertType,
    additionalInfo?: any
  ): string {
    switch (type) {
      case SecurityAlertType.IMPOSSIBLE_TRAVEL:
        return `
        <p>We detected login attempts from:</p>
        <ul>
          <li>${additionalInfo?.detectedLocation || "Unknown location"}</li>
          <li>${additionalInfo?.sourceLocation || "Previous location"}</li>
        </ul>
      `;

      case SecurityAlertType.SECURITY_SETTINGS_CHANGED:
        return `
        <p>Changed setting: ${additionalInfo?.changedSetting || "Unknown"}</p>
        ${
          additionalInfo?.recoveryMethods
            ? `
          <p>Updated recovery methods: 
            ${additionalInfo.recoveryMethods.join(", ")}
          </p>
        `
            : ""
        }
      `;

      case SecurityAlertType.ACCOUNT_RECOVERY_INITIATED:
        return `
        <p>Recovery process started for: 
          ${additionalInfo?.affectedService || "Account"}
        </p>
      `;

      default:
        return "";
    }
  }

  private getActionButtons(type: SecurityAlertType): string {
    const buttons = [];

    if (this.requiresImmediateAction(type)) {
      buttons.push(
        this.createButton(`${this.appUrl}/security`, "Review Security Settings")
      );
    }

    if (type === SecurityAlertType.ACCOUNT_LOCKED) {
      buttons.push(
        this.createButton(
          `${this.appUrl}/support/emergency`,
          "Contact Emergency Support"
        )
      );
    }

    return buttons.length > 0
      ? `
    <div style="margin: 25px 0; text-align: center;">
      ${buttons.join("")}
    </div>
  `
      : "";
  }

  private getSecurityRecommendations(type: SecurityAlertType): string {
    let recommendations: string[] = [];

    switch (type) {
      case SecurityAlertType.NEW_DEVICE:
        recommendations = [
          "If you don't recognize this device, change your password immediately",
          "Review your active sessions",
          "Enable two-factor authentication",
        ];
        break;

      case SecurityAlertType.ACCOUNT_LOCKED:
        recommendations = [
          "Wait for the lockout period to expire (typically 1 hour)",
          "Use account recovery options after lockout expires",
          "Contact support if you believe this is an error",
        ];
        break;

      case SecurityAlertType.IMPOSSIBLE_TRAVEL:
        recommendations = [
          "Change your password immediately",
          "Check your account activity history",
          "Consider enabling login notifications",
        ];
        break;

      default:
        recommendations = [
          "Regularly update your password",
          "Enable two-factor authentication",
          "Review account activity periodically",
        ];
    }

    return `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px;">
      <h4 style="color: #4a5568; margin-top: 0;">Recommended Actions:</h4>
      <ul style="margin: 10px 0 0 20px; color: #718096;">
        ${recommendations.map((r) => `<li>${r}</li>`).join("")}
      </ul>
    </div>
  `;
  }

  async sendSecurityAlert(
    email: string,
    device: DeviceInfo,
    type: "new-login" | "suspicious-activity"
  ): Promise<void> {
    const subject = `${type === "new-login" ? "🔐 New Login" : "⚠️ Suspicious Activity"} - ${this.appName}`;

    const content = `
      <h2 style="color: ${type === "new-login" ? "#38a169" : "#e53e3e"}; margin-top: 0;">
        Security Alert
      </h2>
      <p>We detected ${type === "new-login" ? "a new login" : "suspicious activity"} 
      on your account from the following device:</p>
      ${this.deviceTable(device)}
      <div style="background: #fff5f5; padding: 16px; border-radius: 6px; margin-top: 25px;">
        <p style="margin: 0; color: #e53e3e; font-size: 14px;">
          If this wasn't you, please change your password immediately and contact support.
        </p>
      </div>
    `;

    await this.sendEmail(email, {
      subject,
      html: this.baseTemplate(content),
    });
  }

  async sendInvoice(email: string, link: string): Promise<void> {
    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Your Invoice</h2>
      <p>Your invoice is now available. Click the button below to view and download it:</p>
      ${this.createButton(link, "View Invoice")}
      <p style="color: #718096; font-size: 14px; margin-top: 25px;">
        This link will expire in 7 days. For any questions about your invoice, 
        please reply to this email.
      </p>
    `;

    await this.sendEmail(email, {
      subject: `Your Invoice - ${this.appName}`,
      html: this.baseTemplate(content),
    });
  }

  async sendVerification(email: string, token: string): Promise<void> {
    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Verify Your Email Address</h2>
      <p>Welcome to ${this.appName}! Use this verification code to confirm your email:</p>
      ${this.createCodeBlock(token)}
      <p style="color: #718096; font-size: 14px;">
        This code will expire in 10 minutes. If you didn't create an account, 
        please ignore this email.
      </p>
    `;

    await this.sendEmail(email, {
      subject: `Verify Your Email - ${this.appName}`,
      html: this.baseTemplate(content),
    });
  }
  // private getAlertDetails(
  //   type: SecurityAlertType,
  //   attempts?: number,
  //   locations?: GeoLocation[],
  //   device?: string,
  //   ip?: string
  // ) {
  //   const baseDetails = {
  //     title: "",
  //     message: "",
  //     auditMessage: "",
  //   };

  //   switch (type) {
  //     case SecurityAlertType.SUSPICIOUS_LOGIN:
  //       return {
  //         ...baseDetails,
  //         title: "Suspicious Activity Detected",
  //         message: `We detected ${attempts} failed login attempts to your account
  //                from ${locations?.length || "multiple"} locations.`,
  //         auditMessage: `Security alert sent: ${attempts} failed login attempts`,
  //       };

  //     case "ACCOUNT_LOCKED":
  //       return {
  //         ...baseDetails,
  //         title: "Account Temporarily Locked",
  //         message:
  //           "Your account has been locked due to multiple failed login attempts.",
  //         auditMessage: "Account locked alert sent",
  //       };

  //     case "NEW_DEVICE":
  //       return {
  //         ...baseDetails,
  //         title: "New Device Detected",
  //         message: `A login was detected from a new device (${device}) at ${ip}.`,
  //         auditMessage: `New device alert: ${device} (${ip})`,
  //       };

  //     // Add other alert types as needed

  //     default:
  //       return {
  //         ...baseDetails,
  //         title: "Security Notice",
  //         message: "Important security notice regarding your account.",
  //         auditMessage: "Generic security alert sent",
  //       };
  //   }
  // }
  async sendEmailWithInvoice(
    email: string,
    link: string,
    invoiceNumber: string,
    dueDate?: string
  ): Promise<void> {
    const content = `
    <h2 style="color: #2d3748; margin-top: 0;">Invoice Ready: #${invoiceNumber}</h2>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 15px 0; color: #4a5568;">
        Your invoice is now available for download. Please click the button below 
        to access your secure PDF invoice:
      </p>
      
      ${this.createButton(link, "Download Invoice PDF")}
      
      ${
        dueDate
          ? `
        <div style="margin-top: 20px; color: #718096; font-size: 14px;">
          <strong>Payment Due Date:</strong> ${dueDate}
        </div>
      `
          : ""
      }
    </div>

    <div style="color: #718096; font-size: 14px; margin-top: 25px;">
      <p style="margin: 0;">
        <strong>Important:</strong> 
        This secure link will expire in 7 days. For your records, we recommend:
      </p>
      <ul style="margin: 10px 0 0 20px;">
        <li>Saving the PDF to your device</li>
        <li>Printing a copy for your files</li>
        <li>Adding accounting@${this.appName.toLowerCase().replace(/\s/g, "")}.com to your contacts</li>
      </ul>
    </div>

    <div style="border-top: 1px solid #e8e8e8; margin-top: 30px; padding-top: 20px;">
      <p style="color: #718096; margin: 0;">
        Need help with your invoice? 
        <a href="mailto:accounting@${this.appName.toLowerCase().replace(/\s/g, "")}.com" 
           style="color: #4299e1; text-decoration: none;">
          Contact our accounting team
        </a>
      </p>
    </div>
  `;

    await this.sendEmail(email, {
      subject: `Invoice #${invoiceNumber} Available - ${this.appName}`,
      html: this.baseTemplate(content),
      priority: "high",
    });
  }
  // Helper Methods
  private getAlertEmoji(type: SecurityAlertType): string {
    const emojiMap: Record<SecurityAlertType, string> = {
      [SecurityAlertType.SUSPICIOUS_LOGIN]: "⚠️",
      [SecurityAlertType.ACCOUNT_LOCKED]: "🔒",
      [SecurityAlertType.PASSWORD_CHANGED]: "🔑",
      [SecurityAlertType.NEW_DEVICE]: "📱",
      [SecurityAlertType.IMPOSSIBLE_TRAVEL]: "✈️",
      [SecurityAlertType.SECURITY_SETTINGS_CHANGED]: "⚙️",
      [SecurityAlertType.BACKUP_CODES_GENERATED]: "📝",
      [SecurityAlertType.BACKUP_CODES_CONSUMED]: "📋",
      [SecurityAlertType.MFA_ENABLED]: "🔐",
      [SecurityAlertType.MFA_DISABLED]: "⚠️",
      [SecurityAlertType.BOT_DETECTED]: "🤖",
      [SecurityAlertType.DATA_EXPORT_REQUESTED]: "💾",
      [SecurityAlertType.ACCOUNT_RECOVERY_INITIATED]: "🆘",
      [SecurityAlertType.UNUSUAL_ACTIVITY]: "🚨",
      [SecurityAlertType.CRITICAL_ALERT]: "🚨",

      [SecurityAlertType.LOW_BACKUP_CODES]: "⚠️",

      [SecurityAlertType.SUSPICIOUS_ACTIVITY]: "⚠️",
    };

    return emojiMap[type] || "⚠️";
  }

  private getAlertTitle(type: SecurityAlertType): string {
    const titles: Record<SecurityAlertType, string> = {
      [SecurityAlertType.SUSPICIOUS_LOGIN]: "Suspicious Login Attempt",
      [SecurityAlertType.ACCOUNT_LOCKED]: "Account Temporarily Locked",
      [SecurityAlertType.PASSWORD_CHANGED]: "Password Changed Successfully",
      [SecurityAlertType.NEW_DEVICE]: "New Device Detected",
      [SecurityAlertType.IMPOSSIBLE_TRAVEL]: "Impossible Travel Detected",
      [SecurityAlertType.SECURITY_SETTINGS_CHANGED]:
        "Security Settings Updated",
      [SecurityAlertType.BACKUP_CODES_GENERATED]: "Backup Codes Generated",
      [SecurityAlertType.BACKUP_CODES_CONSUMED]: "Backup Code Used",
      [SecurityAlertType.MFA_ENABLED]: "Two-Factor Authentication Enabled",
      [SecurityAlertType.MFA_DISABLED]: "Two-Factor Authentication Disabled",
      [SecurityAlertType.BOT_DETECTED]: "Bot Activity Detected",
      [SecurityAlertType.DATA_EXPORT_REQUESTED]: "Data Export Requested",
      [SecurityAlertType.ACCOUNT_RECOVERY_INITIATED]:
        "Account Recovery Started",
      [SecurityAlertType.UNUSUAL_ACTIVITY]: "Unusual Activity Detected",
      [SecurityAlertType.CRITICAL_ALERT]: "Critical Security Alert",

      [SecurityAlertType.LOW_BACKUP_CODES]: "Low Backup Codes Remaining",

      [SecurityAlertType.SUSPICIOUS_ACTIVITY]: "Suspicious Activity Detected",
    };

    return titles[type];
  }

  private getAlertPriority(type: SecurityAlertType): "high" | "normal" {
    const highPriorityAlerts = [
      SecurityAlertType.ACCOUNT_LOCKED,
      SecurityAlertType.IMPOSSIBLE_TRAVEL,
      SecurityAlertType.CRITICAL_ALERT,
      SecurityAlertType.ACCOUNT_RECOVERY_INITIATED,
      SecurityAlertType.BOT_DETECTED,
    ];

    return highPriorityAlerts.includes(type) ? "high" : "normal";
  }

  private requiresImmediateAction(type: SecurityAlertType): boolean {
    return [
      SecurityAlertType.SUSPICIOUS_LOGIN,
      SecurityAlertType.NEW_DEVICE,
      SecurityAlertType.IMPOSSIBLE_TRAVEL,
      SecurityAlertType.ACCOUNT_RECOVERY_INITIATED,
    ].includes(type);
  }

  private generateAlertAttachments(
    type: SecurityAlertType
  ): nodemailer.SendMailOptions["attachments"] {
    if (type === SecurityAlertType.DATA_EXPORT_REQUESTED) {
      return [
        {
          filename: "data-export-instructions.pdf",
          path: "/assets/security-instructions.pdf",
          contentType: "application/pdf",
        },
      ];
    }
    return [];
  } // Add to your EmailService class
  async sendAdminNotification(
    admins: Array<{ email: string }>,
    notification: AdminInventoryNotification
  ): Promise<void> {
    if (admins.length === 0) {
      console.warn("No admins found for notification");
      return;
    }

    const adminEmails = admins.map((admin) => admin.email).join(", ");
    const productList = notification.failedProducts
      .map((p) => `• ${p.quantity}x ${p.productName} (ID: ${p.productId})`)
      .join("<br>");

    const content = `
    <h2 style="color: #2d3748; margin-top: 0;">Inventory Reservation Issue</h2>
    <p><strong>User ID:</strong> ${notification.userId}</p>
    <p><strong>Timestamp:</strong> ${notification.timestamp.toLocaleString()}</p>
    
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #4a5568; margin-top: 0;">Failed Reservations:</h3>
      ${productList}
    </div>

    ${this.createButton(
      `${this.appUrl}/admin/orders?userId=${notification.userId}`,
      "View User Details"
    )}

    <div style="margin-top: 25px; color: #718096; font-size: 14px;">
      <p>This is an automated notification. Please review inventory levels and user account:</p>
      <ul>
        <li><a href="${this.appUrl}/admin/inventory">Inventory Management</a></li>
        <li><a href="${this.appUrl}/admin/users/${notification.userId}">User Profile</a></li>
      </ul>
    </div>
  `;

    await this.sendEmail(adminEmails, {
      subject: `🚨 Partial Inventory Reservation - ${this.appName}`,
      html: this.baseTemplate(content),
      priority: "high",
    });
  }
}
