// // src/lib/services/email.service.ts
// import nodemailer from "nodemailer";
// import { UserAuthType } from "../types/users.types";
// import { DeviceInfo } from "../types/refresh.types";

// interface EmailConfig {
//   service: string;
//   auth: {
//     user: string;
//     pass: string;
//   };
// }

// interface EmailTemplate {
//   subject: string;
//   html: string;
// }

// export abstract class BaseEmailService {
//   protected transporter: nodemailer.Transporter;

//   constructor(protected config: EmailConfig) {
//     this.transporter = nodemailer.createTransport(config);
//   }

//   protected async sendEmail(
//     to: string,
//     template: EmailTemplate
//   ): Promise<void> {
//     try {
//       await this.transporter.sendMail({
//         from: `${process.env.APP_NAME} <${this.config.auth.user}>`,
//         to,
//         ...template,
//       });
//     } catch (error) {
//       throw new Error(
//         `Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   }

//   protected baseTemplate(content: string): string {
//     return `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//         ${content}
//         <footer style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px; text-align: center; color: #666;">
//           © ${new Date().getFullYear()} ${process.env.APP_NAME}
//         </footer>
//       </div>
//     `;
//   }
// }

// export class PasswordResetEmail extends BaseEmailService {
//   async sendPasswordReset(email: string, token: string): Promise<void> {
//     const content = `
//       <h2 style="color: #333;">Password Reset Request</h2>
//       <p>Use this temporary reset token:</p>
//       <div style="text-align: center; margin: 20px 0;">
//         <code style="font-size: 1.2rem; padding: 10px; background: #f5f5f5; border-radius: 4px;">
//           ${token}
//         </code>
//       </div>
//       <p>Valid for 10 minutes</p>
//     `;

//     return this.sendEmail(email, {
//       subject: "Password Reset Request",
//       html: this.baseTemplate(content),
//     });
//   }
// }

// export class EmailChangeEmail extends BaseEmailService {
//   async sendEmailChangeConfirmation(
//     email: string,
//     token: string
//   ): Promise<void> {
//     const content = `
//       <h2 style="color: #333;">Confirm Email Change</h2>
//       <p>Click below to confirm your email change:</p>
//       <div style="text-align: center; margin: 20px 0;">
//         <a href="${process.env.NEXTAUTH_URL}/confirm-email-change?token=${token}"
//            style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
//           Confirm Email
//         </a>
//       </div>
//     `;

//     return this.sendEmail(email, {
//       subject: "Confirm Email Change",
//       html: this.baseTemplate(content),
//     });
//   }
// }

// export class SecurityAlertEmail extends BaseEmailService {
//   private deviceTable(device: DeviceInfo): string {
//     return `
//       <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
//         ${Object.entries(device)
//           .map(
//             ([key, value]) => `
//           <tr>
//             <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${key}:</td>
//             <td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td>
//           </tr>
//         `
//           )
//           .join("")}
//       </table>
//     `;
//   }

//   async sendSecurityAlert(
//     email: string,
//     device: DeviceInfo,
//     type: "new-login" | "suspicious-activity"
//   ): Promise<void> {
//     const subject =
//       type === "new-login"
//         ? "🔐 New Login Alert"
//         : "⚠️ Suspicious Activity Detected";

//     const content = `
//       <h2 style="color: ${type === "new-login" ? "#4CAF50" : "#d32f2f"};">Security Alert</h2>
//       <p>We detected ${type === "new-login" ? "a new login" : "suspicious activity"} on your account:</p>
//       ${this.deviceTable(device)}
//       <p>If this wasn't you, please secure your account immediately.</p>
//     `;

//     return this.sendEmail(email, {
//       subject,
//       html: this.baseTemplate(content),
//     });
//   }
// }

// export class InvoiceEmail extends BaseEmailService {
//   async sendInvoice(email: string, link: string): Promise<void> {
//     const content = `
//       <h2 style="color: #333;">Your Invoice</h2>
//       <p>View your invoice:</p>
//       <div style="text-align: center; margin: 20px 0;">
//         <a href="${link}"
//            style="background: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
//           View Invoice
//         </a>
//       </div>
//     `;

//     return this.sendEmail(email, {
//       subject: `Your ${process.env.APP_NAME} Invoice`,
//       html: this.baseTemplate(content),
//     });
//   }
// }

// export class Verification extends BaseEmailService {
//   async sendVerificationToken(email: string, token: string): Promise<void> {
//     const content = `
//    <h2 style="color: #0056b3;">Email Verification Code</h2>
//       <p>Your verification code is:</p>
//       <p style="font-size: 24px; font-weight: bold; color: #d63384;">${
//         token
//       }</p>
//       <p>This code is valid for <strong>10 minutes</strong>.</p>
//       <p>Please use this code to verify your email address.</p>
//       <hr style="border: none; border-bottom: 1px solid #ccc; margin-top: 20px;">

//         `;

//     return this.sendEmail(email, {
//       subject: "Email Verification",
//       html: this.baseTemplate(content),
//     });
//   }
// }
// // Configuration and instantiation
// const emailConfig: EmailConfig = {
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL!,
//     pass: process.env.PASSWORD!,
//   },
// };

// export const EmailService = {
//   passwordReset: new PasswordResetEmail(emailConfig),
//   emailChange: new EmailChangeEmail(emailConfig),

//   verification: new Verification(emailConfig),
//   securityAlert: new SecurityAlertEmail(emailConfig),
//   invoice: new InvoiceEmail(emailConfig),
// };
// src/lib/services/email.service.ts
import nodemailer from "nodemailer";
import { UserAuthType } from "../types/users.types";
import { DeviceInfo } from "../types/refresh.types";

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
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly appName: string;
  private readonly appUrl: string;
  private readonly senderEmail: string;

  constructor(private config: EmailConfig) {
    this.validateEnvironment();
    this.transporter = nodemailer.createTransport(config);
    this.appName = process.env.APP_NAME || "Our Service";
    this.appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    this.senderEmail = `${this.appName} <${config.auth.user}>`;
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
    const confirmUrl = `${this.appUrl}/reset-password?token=${token}&email=${email}`;
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
}

// Configuration and instantiation
const emailConfig: EmailConfig = {
  service: "gmail",
  auth: {
    user: process.env.GMAIL!,
    pass: process.env.PASSWORD!,
  },
};

export const emailService = new EmailService(emailConfig);
