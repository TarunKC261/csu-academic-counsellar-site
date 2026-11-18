# Academic Counselor (CSU demo): advisor site (Natalie)

The front end of the Academic Counselor Tele ("Natalie", for academic advisors) on the Mobeus platform; the twin of the student site `csu-navigator-site` (Val). It has the same look and layout as the Henkel
DX Tele (Unisys build v0.8.2): sign-in page, data privacy notice, welcome page with quick actions, avatar column on
the right with the connection timer and AI disclaimer, and cards on the left. The colours are CSU's.

## What happens when someone opens the site

1. **Sign-in page.** Two ways in:
   - **Sign in with Enterprise ID**: Microsoft Entra ID, Unisys tenant. Only `@unisys.com` accounts by default.
   - **Username and password**: the demo admin account, for people without Unisys SSO.
2. **Data privacy notice.** Two ticks (microphone, notice) and a "join muted / mic on" choice. If the microphone is
   blocked or missing, **Continue with chat only** lets the visitor in, muted, with the chat panel open.
3. **Welcome page.** Four quick actions (caseload, why Maria is flagged, draft outreach, today's actions) send phrases Natalie's prompt understands.
4. **Greeting.** Once the avatar is ready, the site makes Natalie say the greeting to Jordan, the demo advisor, then tells the agent it has already
   greeted. **Leave the Greeting field in the Mobeus dashboard empty**, or she greets twice.
5. **Status.** The avatar column shows "Connecting… Xs", then "Agent engaged in Xs", plus the AI disclaimer.

## Settings without a rebuild: `public/config.js`

| Key | What it does |
|---|---|
| `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID` | Unisys Entra app registration used for SSO (public identifiers). |
| `ALLOWED_EMAIL_DOMAIN` | Accounts allowed through SSO (`unisys.com` and its subdomains). `''` = any account the registration admits. |
| `PASSWORD_LOGIN_ENABLED` | `'true'` shows the username/password form. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | The demo admin account (its own password, not the student site's). **Only a salted PBKDF2-SHA256 hash is stored** (this repo is public); the password is kept outside the repo. |
| `GREETING_NAME` | Name in the spoken greeting. `'Jordan'` matches the demo advisor in Natalie's prompt; `''` greets the signed-in user by first name. |
| `BRAND_LOGO_URL` | Official CSU logo file, e.g. `'/brand/csu-wordmark.svg'` in `public/brand/`. `''` shows a text label. CSU asks that its wordmark is never recreated or generated, so request the file from CSU Marketing Communications. |
| `WIDGET_HOST`, `WIDGET_API_KEY` | Leave blank: the Mobeus deploy injects the site's host and publishable key at build time. |

### SSO redirect URI

In the Unisys app registration, add `https://<this site's URL>/auth/callback` as a **Single-page application**
redirect URI (not "Web").

### Changing the admin password

Generate a new strong password, compute `pbkdf2-sha256$210000$<salt base64>$<hash base64>` (PBKDF2-HMAC-SHA256,
16-byte random salt, 32-byte hash) and replace `ADMIN_PASSWORD_HASH`. Never commit the password itself.

## Security, honestly

Mobeus hosts this as a static site and nothing on the Mobeus side checks the Microsoft token or the password, so
both sign-in paths are a **front door for a demo, not a security boundary**. The voice session is created with the
site's publishable key, exactly as the stock Mobeus starter does. Use sample data only.

## Things deliberately left as they are

- **`platform.yaml`**: voice, avatar, model, greeting and brain-mode settings are commented out, because they are
  managed in the dashboard and active values would overwrite it on deploy.
- **`public/prompts/*.md` are empty** for the same reason (an empty file is ignored on deploy). Natalie's prompt lives in
  the dashboard; its source is `csu-teles/counsellor/` in the Unisys workspace.
- **Site functions**: only `setTheme` is registered, as before, so the agent's tool list does not change.
- **Henkel ServiceNow helpers** (incident watchdogs, call capture, auto-rendered incident cards) are in the code but
  switched off (`SERVICENOW_FEATURES = false` in `src/lib/stores/voice-session-store.ts`).
- The Mobeus Studio theming and AirVision features of the stock starter are not in this build.

## Counselor tools merged from Venkat's build (2026-11-19)

- **Tools** (`src/site-functions/register.ts`), sent with the session request so Natalie can call them by name:
  `getCaseload`, `getStudentRisk`, `planOutreach`, `contactStudent`, `findMeetingSlots`, `addToCalendar`, `setLocale`.
  If the platform refuses the list, the site retries without it. **Needs Natalie prompt v1.3.**
- **Data** is in `src/data/advisors.ts` and mirrors `csu-teles/shared/demo-world.md` and the caseload section of
  Natalie's prompt: Jordan Rivera, 40 advisees, 5 flagged (Maria Chen, Daniel Okafor, Sofia Ramirez, Ethan Nguyen,
  Aaliyah Johnson), and Jordan's open slots for June 22 to 25, 2027. Change demo-world first, then this file.
  Any other name returns "not on this caseload".
- **Cards** (`src/components/cards/AdvisorCards.tsx`, added next to the existing ones): `caseload-list`,
  `student-brief`, `outreach-plan`, `slot-picker`. Drawn only by the tools, never written by the model. Taps send
  their sentence to Natalie. Card text is in en, es, zh, tl, vi, de; student data stays in English.
- **Messages are queued, not sent.** `planOutreach` draws a draft on the channel the student agreed to (email
  only when texting is not allowed) and sends nothing. After Jordan says yes, `contactStudent` puts it in this
  browser tab's outbox with a reference (`CSUAC-XXXXXX`) and the card shows "Queued". This static site has no
  server, so nothing reaches a student.
- **Calendar:** once Jordan picks a slot to propose, `addToCalendar` offers an `.ics` download and a Google Calendar
  link for a "Proposed: advising with <student>" hold on Jordan's own calendar, pending the student's yes.
  Nothing is booked and the student is not invited.
- Not merged: Venkat's `?ac=` advisor code, server outbound and calendar routes, the "SIM" send path, his
  `csumock.edu` contact details, his verification-code door (staff are already signed in), his plaintext demo
  login, his drawn CSU mark, and his page that dropped the chat-only option.

## Look and name (2026-11-19, same as the student site)

- The product is called **Academic Counselor**, shown with a **CSU demo** tag. "Student Engagement Platform" is no
  longer used on this site.
- **Logo:** `public/brand/csu-mark.png`, the red CSU block from the logo on calstate.edu (config.js
  `BRAND_LOGO_URL`). CSU brand rules say not to alter their logo, so ask before showing this crop to CSU people.
- **Colours:** header bar CSU red `#CF102D`; light grey page `--csu-page`; grey card panels `--csu-card` with white
  boxes inside.
- **Wording:** short, plain sentences, page text in six languages (`src/lib/locales.ts`, `dict()`); no "simulated"
  or "(demo)" on any card.
- **Taps interrupt Natalie** like speech (sent on LiveKit's `lk.chat`), info-card buttons send their sentence, the
  avatar column follows the screen height, and the home content is centred vertically.

## Build

```bash
npm ci
npm run build
```

Static export to `out/`. For a local layout check without Microsoft sign-in, run `next dev` with
`NEXT_PUBLIC_DEV_FAKE_SIGNIN=1` (development mode only; ignored in production builds).
