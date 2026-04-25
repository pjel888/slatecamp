/**
 * Oath-taking email templates for Filipino architects.
 * Templates are generated for the day before and day after the Panunumpa ng Propesyonal.
 */

type EmailTemplate = {
  subject: string
  body: string
  html: string
}

/**
 * Generate the pre-oath email (day before ceremony).
 * Encourages the user to share their story after taking the oath.
 */
export const generatePreOathEmail = (userName: string): EmailTemplate => {
  const firstName = userName.split(' ')[0] || 'Architect'

  return {
    subject: 'Tomorrow: your oath.',
    body: `Tomorrow you take the Panunumpa ng Propesyonal.

You will swear to uphold professional standards, serve the public interest,
and practice architecture with integrity. Your family will be there.

Someone tonight is at 38% wondering if they'll make it.
Your story is their map.

When you get back: open your Professional Reference hub.
Keep the code references and study trail that got you here close at hand.
Your experience will still guide the people who come after you.

Congratulations, Architect ${firstName}.
Your SlateCamp account is now your professional reference library.`,
    html: generatePreOathHtml(firstName),
  }
}

/**
 * Generate the post-oath email (day after ceremony).
 * Invites the user to share their oath-taking experience in Campfire.
 */
export const generatePostOathEmail = (userName: string): EmailTemplate => {
  const firstName = userName.split(' ')[0] || 'Architect'

  return {
    subject: `You are now Architect ${firstName}, RLA.`,
    body: `Your Professional Reference hub is ready.`,
    html: generatePostOathHtml(firstName),
  }
}

// ── HTML Generators ─────────────────────────────────────────────────────────

const generatePreOathHtml = (firstName: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tomorrow: your oath.</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      background-color: #f8f7f5;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #1a2332;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px 30px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #1a2332;
    }
    p {
      font-size: 16px;
      margin: 16px 0;
      color: #4a5568;
    }
    .highlight {
      color: #1a2332;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background-color: #1B3FC4;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin-top: 24px;
      transition: background-color 150ms ease-out;
    }
    .cta-button:hover {
      background-color: #1535A8;
    }
    .footer {
      font-size: 12px;
      color: #8896a7;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d4dae3;
      text-align: center;
    }
    @media (max-width: 600px) {
      .email-wrapper {
        padding: 30px 20px;
      }
      h1 {
        font-size: 24px;
      }
      p {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <h1>Tomorrow: your oath.</h1>

      <p>Tomorrow you take the <span class="highlight">Panunumpa ng Propesyonal</span>.</p>

      <p>You will swear to uphold professional standards, serve the public interest,
      and practice architecture with integrity. Your family will be there.</p>

      <p>Someone tonight is at 38% wondering if they'll make it.<br>
      <span class="highlight">Your story is their map.</span></p>

      <p>When you get back: open your Professional Reference hub.<br>
      Keep the code references and study trail that got you here close at hand.<br>
      Your experience will still guide the people who come after you.</p>

      <p style="margin-top: 32px; font-size: 15px;">
        Congratulations, Architect ${firstName}.<br>
        Your SlateCamp account is now your professional reference library.
      </p>

      <a href="https://www.slatecamp.com/dashboard/professional" class="cta-button">Open My Professional Hub →</a>

      <div class="footer">
        <p>SlateCamp — Professional Study Engine</p>
      </div>
    </div>
  </div>
</body>
</html>
`.trim()

const generatePostOathHtml = (firstName: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You are now Architect ${firstName}, RLA.</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      background-color: #f8f7f5;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #1a2332;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px 30px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #1a2332;
    }
    p {
      font-size: 16px;
      margin: 16px 0;
      color: #4a5568;
    }
    .message {
      font-size: 18px;
      font-weight: 500;
      color: #1a2332;
      margin: 32px 0;
      line-height: 1.8;
    }
    .cta-button {
      display: inline-block;
      background-color: #1B3FC4;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin-top: 24px;
      transition: background-color 150ms ease-out;
    }
    .cta-button:hover {
      background-color: #1535A8;
    }
    .footer {
      font-size: 12px;
      color: #8896a7;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d4dae3;
      text-align: center;
    }
    @media (max-width: 600px) {
      .email-wrapper {
        padding: 30px 20px;
      }
      h1 {
        font-size: 24px;
      }
      p {
        font-size: 14px;
      }
      .message {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <h1>You are now Architect ${firstName}, RLA.</h1>

      <div class="message">
        Your Professional Reference hub is ready.
      </div>

      <p>You've taken the oath. Now keep the same references and study trail within reach as you move into practice.</p>

      <a href="https://www.slatecamp.com/dashboard/professional" class="cta-button">Open SlateCamp →</a>

      <div class="footer">
        <p>SlateCamp — Professional Study Engine</p>
      </div>
    </div>
  </div>
</body>
</html>
`.trim()
