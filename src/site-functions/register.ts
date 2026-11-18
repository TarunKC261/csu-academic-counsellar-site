/**
 * Site Functions Registration
 *
 * Registers all site functions on window.__siteFunctions so the voice agent
 * can invoke them via the callSiteFunction RPC.
 *
 * Convention:
 * - Each .ts file in src/site-functions/ (except register.ts, index.ts, types.ts)
 *   exports a default function
 * - The filename (camelCase) becomes the function name on window.__siteFunctions
 * - Functions receive (args: Record<string, any>) and return any
 *
 * Manifest:
 * - Each entry in `siteFunctionManifest` provides metadata alongside the function
 * - `description` is MANDATORY — used as the agent tool description
 * - `schema` is optional — JSON Schema for the function's parameters
 * - `defaults` is optional — default argument values when not provided by agent
 * - The discovery service extracts this manifest on deployment for validation
 */

import setTheme from './setTheme';
import setLocale from './setLocale';
import getCaseload from './getCaseload';
import getStudentRisk from './getStudentRisk';
import planOutreach from './planOutreach';
import contactStudent from './contactStudent';
import findMeetingSlots from './findMeetingSlots';
import addToCalendar from './addToCalendar';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SiteFunctionEntry = {
  /** The function implementation */
  fn: (args: any) => any;
  /** MANDATORY: Agent-facing description of what this function does */
  description: string;
  /** Optional: JSON Schema describing the function's input parameters */
  schema?: Record<string, any>;
  /** Optional: Default values for parameters when not provided by the agent */
  defaults?: Record<string, any>;
};

// ─── Manifest ───────────────────────────────────────────────────────────────

/**
 * Site function manifest — the single source of truth for all registered functions.
 *
 * Each key is the camelCase function name that the agent will use to call it.
 * The discovery service reads this manifest on deployment to extract metadata
 * and validate schemas.
 */
export const siteFunctionManifest: Record<string, SiteFunctionEntry> = {
  setTheme: {
    fn: setTheme,
    description:
      'Switch the website theme between light, dark, or system preference',
    schema: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'system'],
          description: 'The theme to apply',
        },
      },
      required: ['theme'],
    },
    defaults: { theme: 'system' },
  },

  // ── Counselor tools (ported from Venkat's build) ───────────────────────────
  // The user is Jordan Rivera, the counselor. Descriptions say WHEN to call and
  // stay under 500 characters: one longer entry fails the whole session request.
  getCaseload: {
    fn: getCaseload,
    description:
      "Show Jordan's caseload card: the 5 flagged students of 40, worst first, with anything queued or proposed this " +
      'session. Call it for "who needs attention?", "back to the list", "who is next?", "start over" and after Jordan ' +
      'says yes to the greeting. Do not read the card; say how many are flagged and the one to start with. Only these ' +
      'students may be named.',
    schema: { type: 'object', properties: {} },
  },
  getStudentRisk: {
    fn: getStudentRisk,
    description:
      "Show one student's card: risk score, the signals exactly as recorded, the next step and the allowed channel. " +
      'Call it when Jordan names a student or asks why someone is flagged. Speak only the returned signals: no inferred ' +
      'cause, nothing added or softened. A name not on the caseload returns "not on this caseload": say so, never guess.',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Id from getCaseload, e.g. "maria-chen".' },
        name: { type: 'string', description: 'Full or first name, if that is all Jordan said.' },
      },
    },
  },
  planOutreach: {
    fn: planOutreach,
    description:
      'Draw a draft message to a student when Jordan decides to make contact. It sends nothing. The channel comes from ' +
      "consent: canText false means email, so never offer a text. Leave draft empty to use the record's template, or " +
      "pass your own wording in the student's language with no placeholders. Then ask Jordan whether to queue it and wait " +
      'for a yes.',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Id from getCaseload, e.g. "daniel-okafor".' },
        name: { type: 'string', description: 'Student name, if you have no id.' },
        draft: { type: 'string', description: 'Optional wording. Plain text, no markdown, no [brackets].' },
        subject: { type: 'string', description: 'Optional email subject.' },
      },
    },
  },
  contactStudent: {
    fn: contactStudent,
    description:
      'Queue the drafted message ONLY after Jordan says yes out loud or taps "Yes, queue it". It returns queued:true, ' +
      'sent:false and a reference. Say "Queued for <first name>" and read the reference once. Never say sent, texted or ' +
      'emailed. Uses the draft on screen unless you pass body.',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Id from getCaseload.' },
        name: { type: 'string', description: 'Student name, if you have no id.' },
        body: { type: 'string', description: 'Optional: the approved text, exactly as on the card.' },
        subject: { type: 'string', description: 'Optional email subject.' },
      },
    },
  },
  findMeetingSlots: {
    fn: findMeetingSlots,
    description:
      "Show Jordan's open advising slots this week (Tue June 22 to Fri June 25; Humanities 211 or Zoom) when Jordan wants " +
      'to meet a student or asks when they are free. Books nothing. Once Jordan picks a slot to propose, call ' +
      'addToCalendar with its id. Never say booked.',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Id of the student the meeting is for, if any.' },
        name: { type: 'string', description: 'Student name, if you have no id.' },
      },
    },
  },
  addToCalendar: {
    fn: addToCalendar,
    description:
      'Once Jordan has picked an open slot to propose to a student, show calendar links for a "Proposed: advising with ' +
      `<student>" hold on Jordan's own calendar, pending the student's yes. Jordan taps and saves it. It books nothing ` +
      'and does not invite the student. Never say booked or added.',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', description: 'Id from getCaseload.' },
        name: { type: 'string', description: 'Student name, if you have no id.' },
        slot: { type: 'string', description: 'Slot id from findMeetingSlots, e.g. "2027-06-24T13:00".' },
      },
      required: ['slot'],
    },
  },
  setLocale: {
    fn: setLocale,
    description:
      'Call silently whenever the conversation switches language, with the language code (es, zh, tl, vi, de, en, or ' +
      'any other code). It switches the page text; then re-send the scene on screen translated. Never announce it.',
    schema: {
      type: 'object',
      properties: { locale: { type: 'string', description: 'Language code, e.g. "es", "tl", "zh".' } },
      required: ['locale'],
    },
  },
};

/** Tools sent to the platform at session start (setTheme is page plumbing, not a Natalie tool). */
const WIRE_EXCLUDE = new Set(['setTheme']);

/**
 * The manifest as the session request carries it: [{name, description, schema}].
 * The platform turns each entry into a tool Natalie can call (embed manifest wins
 * over any DB-discovered list). Descriptions are clipped at 500 characters as
 * a last guard, because one over-long entry fails the whole request.
 */
export function siteFunctionManifestForWire(): Array<{
  name: string;
  description: string;
  schema?: Record<string, any>;
  defaults?: Record<string, any>;
}> {
  return Object.entries(siteFunctionManifest)
    .filter(([name]) => !WIRE_EXCLUDE.has(name))
    .map(([name, e]) => ({
      name,
      description: e.description.slice(0, 500),
      ...(e.schema ? { schema: e.schema } : {}),
      ...(e.defaults ? { defaults: e.defaults } : {}),
    }));
}

// ─── Window registration ────────────────────────────────────────────────────

// Extend window type
declare global {
  interface Window {
    __siteFunctions: Record<string, (args: any) => any>;
  }
}

/**
 * Register all site functions on window.__siteFunctions.
 * Call this once on app initialization (e.g., in VoiceSessionProvider or layout).
 *
 * Only the `fn` from each manifest entry is registered on the window —
 * metadata (description, schema, defaults) is used by the discovery service,
 * not at runtime.
 */
export function registerSiteFunctions() {
  if (typeof window === 'undefined') return;

  window.__siteFunctions = {};
  for (const [name, entry] of Object.entries(siteFunctionManifest)) {
    window.__siteFunctions[name] = entry.fn;
  }
}
