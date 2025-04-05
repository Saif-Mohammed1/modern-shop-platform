import nodemailer from 'nodemailer';

import type {DeviceInfo} from '@/app/lib/types/session.types';
import type {UserAuthType} from '@/app/lib/types/users.types';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL, // Your Gmail email address
    pass: process.env.PASSWORD, // Your Gmail password or app password
  },
  // // host: "smtp.mail.yahoo.com",
  // // port: 465,
  // service: "yahoo",
  // auth: {
  //   user: process.env.EMAIL,
  //   pass: process.env.PASSWORD,
  // },
});

export const Email = async (user: UserAuthType, token: string) => {
  // const emailHTML = `
  //   <div style="font-family: Arial, sans-serif; color: #333;">
  //     <h2 style="color: #0056b3;">Password Reset Request</h2>
  //     <p>You have requested a password reset for your account.</p>
  //     <p><strong>Your temporary password is:</strong> <span style="font-size: 16px; color: #d63384;">${password}</span></p>
  //     <p>This temporary password is valid for <strong>10 minutes</strong>.</p>
  //     <p>Please use this password to login and reset your permanent password.</p>
  //     <p>If you did not request this change, please contact our support immediately.</p>
  //     <hr style="border: none; border-bottom: 1px solid #ccc; margin-top: 20px;">
  //     <footer style="text-align: center; margin-top: 20px;">
  //       <p style="color: #888;">This is an automated message, please do not reply.</p>
  //     </footer>
  //   </div>
  // `;
  // const emailHTML2 = `
  //   <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
  //     <h2 style="color: #0056b3;">Your Temporary Password</h2>
  //     <p style="color: #555;">You have requested a password reset for your account.</p>
  //     <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; display: inline-block;">
  //       <p><strong>Your temporary password is:</strong></p>
  //       <p style="background: #ebf4ff; border-left: 5px solid #0056b3; padding: 10px; font-size: 18px; color: #d63384; margin: 10px 0;">${password}</p>
  //       <p>Please use this password to log in promptly. This password is valid for <strong>10 minutes</strong>.</p>
  //       <p><strong>Important:</strong> Once logged in, please change your password immediately to ensure your account remains secure and you have access in the future.</p>
  //     </div>
  //     <p>If you did not request this change, please contact our support immediately.</p>
  //     <hr style="border: none; border-top: 1px solid #ccc; margin-top: 20px; width: 80%;">
  //     <footer style="text-align: center; margin-top: 20px; color: #888;">
  //       <p>This is an automated message, please do not reply.</p>
  //     </footer>
  //   </div>
  // `;

  // Define email HTML content
  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #555;">Hello,</p>
      <p style="color: #555;">
        We received a request to reset your password. Use the temporary reset token below to proceed with resetting your password:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <p style="background-color: #f8f9fa; color: #333; padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; display: inline-block; font-size: 18px; font-weight: bold;">
          ${token}
        </p>
      </div>
      <p style="color: #555;">
        If you did not request a password reset, please ignore this email or contact support if you have any concerns.
      </p>
      <p style="color: #555;">Thank you,</p>
      <p style="color: #555;">The Support Team</p>
    </div>
  `;

  // Define email options
  await transporter.sendMail({
    from: 'Support <no-reply@example.com>', // Sender address
    to: user.email, // List of receivers
    subject: 'Temporary Reset Token', // Subject line
    html: emailHTML, // HTML content
  });
};
export const ChangeEmail = async (user: UserAuthType, token: string) => {
  // Define email options
  await transporter.sendMail({
    from: 'Support <no-reply@example.com>',
    to: user.email,
    subject: 'Confirm Email Change Request',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">Confirm Your Email Change Request</h2>
      <p style="color: #555;">Hello,</p>
      <p style="color: #555;">
        We received a request to change the email address associated with your account. If you made this request, please confirm it by clicking the button below:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.NEXTAUTH_URL}/confirm-email-change?token=${token}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
      </div>
      <p style="color: #555;">
        If you did not request this change, you can safely ignore this email.
      </p>
      <p style="color: #555;">Thank you,</p>
      <p style="color: #555;">The Support Team</p>
    </div>
  `,
  });
};
export const sendVerificationCode = async (user: Partial<UserAuthType>, code: string) => {
  await transporter.sendMail({
    from: `${process.env.APP_NAME} <no-reply@example.com>`, // process.env.SENDER_EMAIL,
    to: user.email,
    subject: 'Email Verification Code',
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0056b3;">Email Verification Code</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #d63384;">${code}</p>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
      <p>Please use this code to verify your email address.</p>
      <hr style="border: none; border-bottom: 1px solid #ccc; margin-top: 20px;">
      <footer style="text-align: center; margin-top: 20px;">
        <p style="color: #888;">This is an automated message, please do not reply.</p>
      </footer>
    </div>
  `,
  });
};
export const sendEmailWithInvoice = async (user: UserAuthType, link: string) => {
  // Setup email data
  /*let mailOptions = {
      from: '"fashFlash" <no-reply@yourcompany.com>', // Sender address
      to: user.email, // Recipient email from user object
      subject: "Your Invoice for Recent Purchase - fashFlash",
      html: `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.5; font-size: 16px; color: #333;">
          <h2 style="color: #0046be;">Thank you for your purchase!</h2>
          <p>Dear ${user.name},</p>
          <p>We appreciate your business and are pleased to confirm your recent transaction with us. Attached below is the link to your invoice, detailing your purchase information:</p>
          <p><a href="${link}" style="background-color: #0046be; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Invoice</a></p>
          <p>If you have any questions or need further assistance, please do not hesitate to contact our customer service team.</p>
          <p>Thank you for choosing <strong>fashFlash</strong>!</p>
          <p>Warm regards,<br>Your Company Team</p>
        </div>
      `,
    };*/
  let mailOptions = {
    from: `${process.env.APP_NAME} <no-reply@example.com>`, // Sender address
    to: user.email, // Recipient email from user object
    subject: `Your Invoice from  ${process.env.APP_NAME}`,
    html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; max-width: 600px; margin: auto; border: 1px solid #eeeeee; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <header style="border-bottom: 1px solid #eeeeee; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="font-size: 24px; color: #0046be;">Invoice Available</h1>
          </header>
          <section style="font-size: 16px; line-height: 1.5;">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for your recent purchase. We are pleased to provide you with the invoice for your transaction.</p>
            <p>Please find your invoice at the link below:</p>
            <p><a href="${link}" style="display: inline-block; font-size: 16px; background-color: #0046be; color: white; text-decoration: none; padding: 10px 15px; border-radius: 5px; font-weight: bold;">View Invoice</a></p>
            <p>If you require any further assistance or have any questions, please do not hesitate to reach out directly by replying to this email.</p>
          </section>
          <footer style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 20px;">
            <p>Kind regards,</p>
            <p><strong>${process.env.APP_NAME}</strong><br>Customer Service Team</p>
          </footer>
        </div>
      `,
  };
  // Function call to send the email (This depends on the service/library you're using, e.g., nodemailer)
  await transporter.sendMail(mailOptions);
};

export const sendEmailOnDetectedUnusualActivity = async (
  user: UserAuthType,
  deviceInfo: string,
  ipAddress: string,
) => {
  await transporter.sendMail({
    from: `${process.env.APP_NAME} <no-reply@example.com>`,
    to: user.email,
    subject: 'Unusual Login Activity Detected',
    html: `
      <p>We noticed a new login to your account from a different device or location.</p>
      <p><strong>Device Information:</strong> ${deviceInfo}</p>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
      <p>If this was you, no further action is required. Otherwise, <a href="${process.env.NEXTAUTH_URL}/reset-password">change your password</a> immediately.</p>
    `,
  });
};
// Assuming 'lineItems' contains the products and their details
export const sendRefundStatusUpdateEmail = async (
  user: UserAuthType,
  status: string,
  reason: string,
) => {
  const subject = `Your Refund Request ${status === 'approved' ? 'Approved' : 'Rejected'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4CAF50;">Refund Request ${
          status === 'approved' ? 'Approved' : 'Refused'
        }</h2>
        <p>Dear ${user.name},</p>
        <p>Your refund request has been ${status === 'approved' ? 'approved' : 'refused'}.</p>
        ${status === 'refused' ? `<p><strong>Reason for refusal:</strong> ${reason}</p>` : ''}
        <p>If you have any questions, please feel free to contact our support team.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: 'support@example.com',
    to: user.email,
    subject,
    html,
  });
};
export const sendMessageForNewPassword = async (user: UserAuthType, newPassword: string) => {
  await transporter.sendMail({
    from: `Support <${process.env.APP_NAME}>`,
    to: user.email,
    subject: 'Password Reset Successful',
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0056b3; text-align: center;">Password Reset Successful</h2>
          <p>Dear ${user.name || 'User'},</p>
          <p>Your password has been successfully reset. Below is your new password:</p>
          <p style="text-align: center; font-size: 18px; font-weight: bold; color: #d63384; background: #f8f9fa; padding: 10px; border-radius: 5px;">${newPassword}</p>
          <p><strong>For security reasons, we recommend that you change your password after logging in.</strong></p>
          <p>Additionally, please download and store your <strong>2FA backup codes</strong> from your account settings.</p>
          <p>If you did not request this change, please <a href="${process.env.APP_URL}/login" style="color: #0056b3; text-decoration: none;">log in</a> and update your credentials immediately.</p>
          <p>If you need further assistance, feel free to contact our support team.</p>
          <hr style="border: none; border-bottom: 1px solid #ccc; margin-top: 20px;">
          <footer style="text-align: center; margin-top: 20px;">
            <p style="color: #888;">This is an automated message, please do not reply.</p>
          </footer>
        </div>
      `,
  });
};
// utils/email.utils.ts
export const sendSecurityEmail = async ({
  user,
  type,
  device,
}: {
  user: UserAuthType;
  type: 'new-login' | 'suspicious-activity';
  device: DeviceInfo;
}) => {
  const subject =
    type === 'new-login'
      ? '🔐 New Login Alert - Your Account Was Accessed'
      : '⚠️ Suspicious Login Attempt Detected';

  const message =
    type === 'new-login'
      ? 'A new login to your account was detected. If this was you, no action is required. If not, please secure your account immediately.'
      : "We've detected an unusual login attempt. If this wasn't you, we strongly recommend changing your password and reviewing your account security settings.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
      <h2 style="color: #d9534f;">Security Alert</h2>
      <p>${message}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td>${new Date().toLocaleString()}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Operating System:</td><td>${device.os}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Browser:</td><td>${device.browser}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Device Type:</td><td>${device.device}</td></tr>
        ${device.brand ? `<tr><td style="padding: 8px; font-weight: bold;">Brand:</td><td>${device.brand}</td></tr>` : ''}
        ${device.model ? `<tr><td style="padding: 8px; font-weight: bold;">Model:</td><td>${device.model}</td></tr>` : ''}
        <tr><td style="padding: 8px; font-weight: bold;">IP Address:</td><td>${device.ip}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td>${device.location}</td></tr>
      </table>
      <p style="margin-top: 20px;">For enhanced security, we recommend reviewing your account activity and enabling two-factor authentication (2FA).</p>
      <p style="margin-top: 10px;">If you need assistance, please contact our support team.</p>
    </div>
  `;
  await transporter.sendMail({
    from: `Support <${process.env.APP_NAME}>`,
    to: user.email,
    subject,
    html,
  });
};
