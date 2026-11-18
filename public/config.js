/* Academic Counselor (CSU demo) runtime config. Served as /config.js, read at startup, NOT bundled,
   so it can be changed without a rebuild. Public identifiers only, no secrets.
   '' = fall back to the value baked at build (or the code default). */
window.__DX_CONFIG__ = {
  // Mobeus (AWS). Blank = the host and publishable site key the Mobeus deploy
  // service injects at build (NEXT_PUBLIC_WIDGET_HOST / NEXT_PUBLIC_WIDGET_API_KEY).
  WIDGET_HOST: '',
  WIDGET_API_KEY: '',

  // Session backend: the Mobeus AWS path (publishable key). Do not change.
  AUTH_DEFAULT_MODE: 'aws-us',
  AUTH_ENABLED_MODES: 'aws-us',

  // Sign-in: Unisys Entra ID, single-page-application registration.
  // Redirect URI to register (type "Single-page application"): <site URL>/auth/callback
  ENTRA_TENANT_ID: '8d894c2b-238f-490b-8dd1-d93898c5bf83',
  ENTRA_CLIENT_ID: '4b05fce2-8236-4bbb-9625-1cb88b89be03',
  // Only accounts on this domain (and its subdomains) may sign in. '' = any.
  ALLOWED_EMAIL_DOMAIN: 'unisys.com',

  // Username + password sign-in for people without Unisys SSO. Only a salted
  // PBKDF2-SHA256 hash is stored here (this file is public); the password is kept
  // outside the repo. Format: pbkdf2-sha256$iterations$salt_b64$hash_b64.
  PASSWORD_LOGIN_ENABLED: 'true',
  ADMIN_USERNAME: 'csu-advisor-admin',
  ADMIN_PASSWORD_HASH: 'pbkdf2-sha256$210000$w00oclcd+H4oybGWpKNHcg==$v6I6aS99JN6SVL/atbUA2PSOtgJxZ10SPN3KKYOC7uk=',

  // Spoken greeting addresses the demo advisor (matches the Natalie prompt).
  // '' = greet the signed-in user by first name instead.
  GREETING_NAME: 'Jordan',

  // Logo, top left. The red CSU block from the logo on calstate.edu (owner
  // 2026-11-18). Swap for the file from CSU Marketing Communications if one is
  // supplied. '' = plain text label.
  BRAND_LOGO_URL: '/brand/csu-mark.png',
};
