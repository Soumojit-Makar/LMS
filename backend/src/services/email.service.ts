/**
 * Email Service — stub using Resend.
 * Install: pnpm --filter backend add resend
 * Then replace the console.log calls with actual Resend calls.
 *
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 */

interface EmailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Email] To: ${to} | Subject: ${subject}`);
    return;
  }
  // Production: wire in Resend / SendGrid / SES here
  // const { data, error } = await resend.emails.send({ from: 'noreply@digitalindian.in', to, subject, html });
  // if (error) throw new Error(error.message);
  console.log(`[Email stub] Would send to ${to}: ${subject}`);
}

export function welcomeEmail(name: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a50ff">Welcome to Digitalindian Skill Academy!</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created successfully. Start exploring our courses today.</p>
      <a href="${process.env.APP_URL}" style="display:inline-block;background:#1a50ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
        Go to Dashboard
      </a>
    </div>
  `;
}

export function enrollmentConfirmEmail(courseName: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a50ff">Enrollment Confirmed!</h2>
      <p>You have been successfully enrolled in <strong>${courseName}</strong>.</p>
      <p>Click below to start learning:</p>
      <a href="${process.env.APP_URL}/dashboard" style="display:inline-block;background:#1a50ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
        Start Learning
      </a>
    </div>
  `;
}

export function trainerApprovalEmail(name: string, approved: boolean): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:${approved ? '#16a34a' : '#dc2626'}">
        Trainer Application ${approved ? 'Approved' : 'Rejected'}
      </h2>
      <p>Hi ${name},</p>
      <p>Your trainer application has been <strong>${approved ? 'approved' : 'rejected'}</strong>.</p>
      ${approved ? `<a href="${process.env.APP_URL}/trainer" style="display:inline-block;background:#1a50ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Go to Trainer Dashboard</a>` : '<p>Please contact support if you have questions.</p>'}
    </div>
  `;
}
