// Email utilities (stub implementation)
// Add your preferred email service here (Nodemailer, Resend, etc.)

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement with your preferred email service
  console.log('Email would be sent:', options);
  
  // For development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log(`
📧 Email Sent (Development Mode)
To: ${options.to}
Subject: ${options.subject}
HTML: ${options.html}
Text: ${options.text || 'No text version'}
    `);
    return { success: true };
  }
  
  // In production, you should implement actual email sending
  // Examples:
  
  // Using Nodemailer:
  // const transporter = nodemailer.createTransporter({ ... });
  // await transporter.sendMail({ ... });
  
  // Using Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ ... });
  
  return { success: false, error: 'Email service not configured' };
}

// Template for password reset email
export function createPasswordResetEmail(resetUrl: string, appName: string) {
  return {
    subject: `Password Reset - ${appName}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your ${appName} account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `,
    text: `
Password Reset Request

You requested a password reset for your ${appName} account.

Reset your password by visiting this URL:
${resetUrl}

This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
    `.trim(),
  };
}

// Template for welcome email
export function createWelcomeEmail(userNamename: string, appName: string, loginUrl: string) {
  return {
    subject: `Welcome to ${appName}!`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Welcome to ${appName}!</h2>
        <p>Hi ${userNamename || 'there'},</p>
        <p>Thanks for signing up! We're excited to have you on board.</p>
        <div style="margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
    `,
    text: `
Welcome to ${appName}!

Hi ${userNamename || 'there'},

Thanks for signing up! We're excited to have you on board.

Get started by visiting: ${loginUrl}

If you have any questions, feel free to reach out to our support team.
    `.trim(),
  };
}