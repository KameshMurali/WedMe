type WelcomeEmailInput = {
  brandName: string;
  partnerOneName: string;
  partnerTwoName: string;
  slug: string;
  weddingDate: Date;
  verificationUrl: string;
  appUrl: string;
};

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatWeddingDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildWelcomeEmail(input: WelcomeEmailInput) {
  const couple = `${input.partnerOneName} & ${input.partnerTwoName}`;
  const dateLabel = formatWeddingDate(input.weddingDate);
  const dashboardUrl = `${input.appUrl}/dashboard`;
  const publicSiteUrl = `${input.appUrl}/${input.slug}`;

  const subject = `Welcome to ToNewBeginning, ${couple} ✨`;

  const text = [
    `Hi ${input.partnerOneName} and ${input.partnerTwoName},`,
    "",
    `Your wedding workspace for "${input.brandName}" is ready.`,
    `Wedding date: ${dateLabel}.`,
    "",
    `Verify your email to unlock everything: ${input.verificationUrl}`,
    "",
    `Your dashboard: ${dashboardUrl}`,
    `Your public wedding site (goes live when you publish): ${publicSiteUrl}`,
    "",
    "Next steps you can take from the dashboard:",
    "  • Pick a template and customize colors",
    "  • Add story milestones, events, and a schedule",
    "  • Open RSVPs when you're ready to share with guests",
    "",
    "Congratulations again — we're glad you're here.",
    "— The ToNewBeginning team",
  ].join("\n");

  const html = `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#fbf7f2;font-family:'Helvetica Neue',Arial,sans-serif;color:#2b1a18;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fbf7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(43,26,24,0.06);">
            <tr>
              <td style="padding:36px 36px 24px;">
                <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#9a7a6a;">Workspace ready</p>
                <h1 style="margin:14px 0 0;font-size:30px;font-weight:600;line-height:1.15;color:#2b1a18;">Welcome, ${escape(couple)}.</h1>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.6;color:#6b554f;">
                  Your wedding workspace for <strong>${escape(input.brandName)}</strong> is ready on
                  ToNewBeginning. We're so glad you're celebrating <strong>${escape(dateLabel)}</strong> with us.
                </p>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.6;color:#6b554f;">
                  Verify your email so we can keep things secure and start saving drafts.
                </p>
                <p style="margin:24px 0 0;">
                  <a href="${escape(input.verificationUrl)}" style="display:inline-block;background:#7a4b3a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:999px;">Verify your email</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 12px;">
                <hr style="border:none;border-top:1px solid rgba(0,0,0,.06);margin:8px 0 24px;" />
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#9a7a6a;">Your spaces</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:10px 0;font-size:15px;color:#6b554f;">
                      <strong style="color:#2b1a18;">Dashboard</strong><br />
                      <a href="${escape(dashboardUrl)}" style="color:#7a4b3a;text-decoration:none;">${escape(dashboardUrl)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:15px;color:#6b554f;">
                      <strong style="color:#2b1a18;">Your public site</strong> <span style="color:#9a7a6a;font-size:13px;">(goes live when you publish)</span><br />
                      <a href="${escape(publicSiteUrl)}" style="color:#7a4b3a;text-decoration:none;">${escape(publicSiteUrl)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 36px 36px;">
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#9a7a6a;">Get started</p>
                <ul style="margin:0;padding-left:18px;font-size:15px;line-height:1.7;color:#6b554f;">
                  <li>Pick a template and tune the palette to your vibe</li>
                  <li>Add story milestones, events, and the day-by-day schedule</li>
                  <li>Open RSVPs when you're ready to share with guests</li>
                </ul>
                <p style="margin:28px 0 0;font-size:14px;color:#9a7a6a;">
                  With love,<br />The ToNewBeginning team
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:12px;color:#a89489;">
            You're receiving this because someone created a ToNewBeginning workspace using ${escape(input.appUrl)}.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

  return { subject, text, html };
}
