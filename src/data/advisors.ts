/**
 * advisors: Jordan Rivera's caseload, the only students Natalie may name.
 *
 * Ported from Venkat's build (src/data/advisors.ts) but rewritten to the CSU
 * demo world: every value below comes from csu-teles/shared/demo-world.md and
 * the "Jordan's caseload this week" section of counsellor/speak-system-prompt.md.
 * Change those first, then this file, so the cards and Natalie never disagree.
 *
 * Everything here is invented. No record belongs to a real person, and nothing
 * in this app calls a CSU system. There is no `?ac=` code: the site is always
 * Jordan's.
 *
 * Contact details: the demo world defines none for these students, so the
 * cards show the channel only ("Email on file", "Text on file") and never an
 * invented number or address.
 */
import type { Locale } from '@/lib/locales';

export interface Advisor {
    firstName: string;
    lastName: string;
    title: string;
    office: string;
    campus: string;
    caseloadSize: number;
    flagged: number;
    onTrack: number;
    meetingPlace: string;
}

export const ADVISOR: Advisor = {
    firstName: 'Jordan',
    lastName: 'Rivera',
    title: 'Academic Advisor',
    office: 'Humanities and Social Sciences Advising Center',
    campus: 'Cal State Fullerton',
    caseloadSize: 40,
    flagged: 5,
    onTrack: 35,
    meetingPlace: 'In person (Humanities 211) or Zoom',
};

/** Risk band as the caseload table names it. */
export type RiskBand = 'High' | 'Elevated' | 'Watch';

/** What kind of signal. `personal` is said once, neutrally, and never built on. */
export type SignalKind = 'aid' | 'orientation' | 'registration' | 'attendance' | 'grades' | 'transfer' | 'context' | 'personal';

export interface Signal {
    kind: SignalKind;
    text: string;
}

export interface OutreachTemplate {
    /** Email subject, or '' for a text message. */
    subject: string;
    /** The message, already filled from the record (counsellor KB templates). */
    body: string;
}

export interface CaseloadEntry {
    id: string;
    name: string;
    firstName: string;
    rank: number;
    year: string;
    major: string;
    campus: string;
    riskScore: number;
    band: RiskBand;
    /** The "Main signal" column of the caseload table. */
    headline: string;
    /** The signals, exactly as listed in the prompt. Speak only these. */
    signals: Signal[];
    nextStep: string;
    /** Consent. False means email only: a text is never offered. */
    canText: boolean;
    /** Language a message to this student is written in. */
    language: Locale;
    /** How the record states the language preference, or '' when nothing is said. */
    languageNote: string;
    /** Length of an advising meeting, used only for the calendar hold. */
    meetingMinutes: number;
    draft: OutreachTemplate;
}

const SLOT_OFFER = 'Thursday, June 24 at 1:00 pm or Friday, June 25 at 11:00 am';

export const CASELOAD: CaseloadEntry[] = [
    {
        id: 'maria-chen',
        name: 'Maria Chen',
        firstName: 'Maria',
        rank: 1,
        year: 'Incoming freshman',
        major: 'Psychology',
        campus: 'Cal State Fullerton',
        riskScore: 86,
        band: 'High',
        headline: 'Aid verification hold 18 days, no orientation, 9 units',
        signals: [
            {
                kind: 'aid',
                text:
                    "Financial aid verification on hold for 18 days (selected June 3). Missing: Verification Worksheet and parent's " +
                    '2025 IRS tax return transcript. Due July 15, 2027. Aid (Pell $7,395 + Cal Grant A $6,834) cannot pay until done.',
            },
            { kind: 'orientation', text: 'New Student Orientation not booked (Psychology sessions June 29, July 13, July 27).' },
            { kind: 'registration', text: 'Registered for 9 units (PSYC 101, ENGL 101, COMM 102); target 15.' },
            {
                kind: 'context',
                text: "First-generation student; commutes from Santa Ana. Opened the platform's text today: no reply yet.",
            },
        ],
        nextStep: 'A short text offering a 15-minute call to sort out verification and pick an orientation date.',
        canText: true,
        language: 'en',
        languageNote: 'Prefers English (family speaks Mandarin)',
        meetingMinutes: 15,
        draft: {
            subject: '',
            body:
                "Hi Maria, it's Jordan Rivera, your advisor at Cal State Fullerton. Your financial aid is paused for a routine " +
                "check: we need your Verification Worksheet and your parent's 2025 IRS tax transcript by July 15. Want a " +
                '15-minute call to sort it out and pick an orientation date? Reply with a time or YES.',
        },
    },
    {
        id: 'daniel-okafor',
        name: 'Daniel Okafor',
        firstName: 'Daniel',
        rank: 2,
        year: 'Sophomore',
        major: 'Sociology',
        campus: 'Cal State Fullerton',
        riskScore: 78,
        band: 'High',
        headline: 'Missed 4 of last 6 MATH 120 (statistics) classes; midterm D; Canvas logins down 70% in 3 weeks',
        signals: [
            { kind: 'attendance', text: 'Missed 4 of the last 6 MATH 120 Introduction to Statistics classes (summer session).' },
            { kind: 'grades', text: 'Midterm grade D (62%) in MATH 120. Canvas logins down 70% over the last 3 weeks.' },
            {
                kind: 'grades',
                text: 'Cumulative GPA 2.41; a D in MATH 120 would not satisfy GE Area B4 for his major (C- or better needed).',
            },
            { kind: 'personal', text: 'Told his instructor he started a night job in May.' },
        ],
        nextStep:
            'Email inviting him to a 20-minute advising appointment; mention free tutoring at the Math Learning Center. ' +
            'Last day to withdraw from summer session with a W: June 30, 2027.',
        canText: false,
        language: 'en',
        languageNote: '',
        meetingMinutes: 20,
        draft: {
            subject: 'Checking in about MATH 120',
            body:
                'Hi Daniel,\n\n' +
                "I'm Jordan Rivera, your academic advisor. I noticed MATH 120 has been a tough stretch, and I'd like to help " +
                `you finish it strong. Could we meet for 20 minutes? I have ${SLOT_OFFER}, in person in Humanities 211 or on Zoom.\n\n` +
                'The Math Learning Center also offers free drop-in tutoring for MATH 120. If you are weighing your options, the ' +
                'last day to withdraw from summer session with a W is June 30, and we can talk that through together.\n\n' +
                'Best,\nJordan Rivera',
        },
    },
    {
        id: 'sofia-ramirez',
        name: 'Sofia Ramirez',
        firstName: 'Sofia',
        rank: 3,
        year: 'Junior',
        major: 'Communications (Public Relations)',
        campus: 'Cal State Fullerton',
        riskScore: 71,
        band: 'Elevated',
        headline: '$412 balance hold blocks Fall 2027 registration; not registered; works 30 hrs/week',
        signals: [
            {
                kind: 'registration',
                text:
                    'Registration hold: unpaid balance of $412 (spring parking and a library fine). Not yet registered for ' +
                    'Fall 2027; her registration window opened June 7.',
            },
            { kind: 'grades', text: 'GPA 3.18, on track academically.' },
            { kind: 'personal', text: 'Works 30 hours a week.' },
        ],
        nextStep:
            'Text in Spanish explaining the hold amount and the Titan Emergency Grant / payment options, with a link to ' +
            'Student Business Services from the knowledge base.',
        canText: true,
        language: 'es',
        languageNote: 'Prefers Spanish',
        meetingMinutes: 10,
        draft: {
            subject: '',
            body:
                'Hola Sofia, soy Jordan Rivera, de asesoría académica en Cal State Fullerton. Tienes un saldo de $412 que ' +
                'bloquea tu inscripción para el otoño. Student Business Services puede ayudarte con un plan de pagos, y ' +
                'también existe la Titan Emergency Grant. ¿Quieres que hablemos 10 minutos esta semana?',
        },
    },
    {
        id: 'ethan-nguyen',
        name: 'Ethan Nguyen',
        firstName: 'Ethan',
        rank: 4,
        year: 'Sophomore',
        major: 'Psychology',
        campus: 'Cal State Fullerton',
        riskScore: 62,
        band: 'Elevated',
        headline:
            'Registered for MATH 110 Basic Algebra (Fall 2027) but passed MATH 100 Simple Algebra in Fall 2026: same course, ' +
            'renamed, no new units; 12 units',
        signals: [
            {
                kind: 'registration',
                text:
                    'Registered for MATH 110 Basic Algebra for Fall 2027, but already passed MATH 100 Simple Algebra in Fall 2026 ' +
                    '(grade B). CSUF renamed MATH 100 to MATH 110 for the 2027-28 catalog: same course, no new units.',
            },
            {
                kind: 'registration',
                text:
                    'Fall 2027 schedule is 12 units, so dropping MATH 110 would leave 9; he needs a replacement course (for ' +
                    'example MATH 120 Introduction to Statistics, GE B4, which his major needs next).',
            },
        ],
        nextStep: 'Text explaining the duplicate and offering to swap MATH 110 for MATH 120 before Sept 10.',
        canText: true,
        language: 'en',
        languageNote: '',
        meetingMinutes: 30,
        draft: {
            subject: '',
            body:
                'Hi Ethan, Jordan Rivera here. Heads up: MATH 110 Basic Algebra is the same course as MATH 100 Simple Algebra ' +
                "you already passed, so it won't add units. Want to swap it for MATH 120 Introduction to Statistics before " +
                'Sept 10? I can help you do it.',
        },
    },
    {
        id: 'aaliyah-johnson',
        name: 'Aaliyah Johnson',
        firstName: 'Aaliyah',
        rank: 5,
        year: 'Transfer junior (from CSU Long Beach)',
        major: 'Child and Adolescent Studies',
        campus: 'Cal State Fullerton',
        riskScore: 57,
        band: 'Watch',
        headline: '2 courses from CSU Long Beach not yet articulated; GE Area B4 missing; caregiver responsibilities',
        signals: [
            {
                kind: 'transfer',
                text:
                    'Two CSU Long Beach courses not yet articulated: BIOL 207 Human Biology and ANTH 120 Cultural Anthropology ' +
                    '(under review). GE Area B4 (quantitative reasoning) still missing.',
            },
            { kind: 'grades', text: 'GPA 3.45.' },
            { kind: 'personal', text: 'Caregiver for a younger sibling; prefers online or evening classes.' },
        ],
        nextStep:
            'Email confirming that you requested the course evaluation, and suggesting an online section of MATH 120 for GE B4.',
        canText: false,
        language: 'en',
        languageNote: '',
        meetingMinutes: 30,
        draft: {
            subject: 'Your transfer courses and General Education',
            body:
                'Hi Aaliyah,\n\n' +
                "I've asked our articulation team to evaluate BIOL 207 and ANTH 120 from CSU Long Beach; I'll let you know as " +
                'soon as I hear back. For GE Area B4 you still need one quantitative reasoning course. MATH 120 Introduction to ' +
                'Statistics has an online section this fall, which may fit around your schedule.\n\n' +
                `Happy to meet if it helps: I have ${SLOT_OFFER}.\n\n` +
                'Best,\nJordan Rivera',
        },
    },
];

/** Worst first, which is how the table is ranked. */
export function caseload(): CaseloadEntry[] {
    return [...CASELOAD].sort((a, b) => a.rank - b.rank);
}

function norm(s: string): string {
    return s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/**
 * Find one student by id, full name or first name. Strict on purpose: saying
 * one person's grades under another person's name is the failure this guards.
 * Returns null for anyone not on the caseload, or an ambiguous match.
 */
export function findStudent(idOrName: unknown, name?: unknown): CaseloadEntry | null {
    for (const raw of [idOrName, name]) {
        if (typeof raw !== 'string' || !raw.trim()) continue;
        const q = norm(raw);
        const byId = CASELOAD.find((e) => norm(e.id) === q);
        if (byId) return byId;
        const byName = CASELOAD.find((e) => norm(e.name) === q);
        if (byName) return byName;
        const byFirst = CASELOAD.filter((e) => norm(e.firstName) === q);
        if (byFirst.length === 1) return byFirst[0];
    }
    return null;
}

export const NOT_ON_CASELOAD = { ok: false as const, error: 'not on this caseload' };

/* ── Jordan's open advising slots this week ──────────────────────────────────
   Fixed to the demo clock (today is Monday, June 21, 2027), never computed from
   the real date. */

export interface AdvisorSlot {
    /** Local date and time, `YYYY-MM-DDTHH:MM`, Pacific. Also the slot id. */
    id: string;
    /** English label for the agent, e.g. "Tuesday, June 22 at 10:00 am". */
    label: string;
}

const SLOT_IDS = [
    '2027-06-22T10:00',
    '2027-06-22T14:30',
    '2027-06-23T09:00',
    '2027-06-24T13:00',
    '2027-06-24T15:30',
    '2027-06-25T11:00',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function slotLabel(id: string): string {
    const [date, time] = id.split('T');
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()];
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${wd}, ${MONTHS[m - 1]} ${d} at ${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`;
}

/** "2027-06-24T13:00" in the page language, e.g. "Thursday, June 24 at 1:00 PM". */
export function formatSlot(id: string | undefined, locale: Locale): { day: string; time: string; full: string } {
    const m = String(id ?? '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return { day: String(id ?? ''), time: '', full: String(id ?? '') };
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    try {
        const day = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(d);
        const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(d);
        return { day, time, full: `${day}, ${time}` };
    } catch {
        return { day: id!, time: '', full: id! };
    }
}

export function openSlots(): AdvisorSlot[] {
    return SLOT_IDS.map((id) => ({ id, label: slotLabel(id) }));
}

/**
 * Match what the agent passes ("2027-06-24T13:00", "Thursday at 1", "Thu 1:00 pm",
 * "June 24 1pm") to one open slot. Null when it is not one of Jordan's slots or
 * is ambiguous.
 */
export function findSlot(raw: unknown): AdvisorSlot | null {
    if (typeof raw !== 'string' || !raw.trim()) return null;
    const s = raw.trim().toLowerCase();
    const all = openSlots();
    const exact = all.find((x) => s.startsWith(x.id.toLowerCase()));
    if (exact) return exact;

    // A day Jordan has no slots on (Monday is today; no weekend hours).
    if (/\b(mon|sat|sun)/.test(s)) return null;

    let pool = all;
    const dayHit = ['tue', 'wed', 'thu', 'fri'].find((d) => s.includes(d));
    const dateHit = s.match(/(?:june|jun|06[-/])\s*(\d{1,2})/) ?? s.match(/2027-06-(\d{2})/);
    if (dateHit) {
        const day = Number(dateHit[1]);
        pool = pool.filter((x) => Number(x.id.slice(8, 10)) === day);
    } else if (dayHit) {
        const index = { tue: 2, wed: 3, thu: 4, fri: 5 }[dayHit]!;
        pool = pool.filter((x) => new Date(`${x.id.slice(0, 10)}T12:00:00Z`).getUTCDay() === index);
    }

    // The time, read from what is left once the date is taken out.
    const rest = dateHit ? s.replace(dateHit[0], ' ') : s;
    const tm = rest.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/);
    if (tm) {
        let h = Number(tm[1]);
        const min = Number(tm[2] ?? 0);
        const ap = tm[3]?.replace(/\./g, '');
        if (ap === 'pm' && h < 12) h += 12;
        if (ap === 'am' && h === 12) h = 0;
        // No am/pm: advising hours are 9 to 5, so 1 to 5 means afternoon.
        if (!ap && h >= 1 && h <= 5) h += 12;
        pool = pool.filter((x) => Number(x.id.slice(11, 13)) === h && Number(x.id.slice(14, 16)) === min);
    }
    return pool.length === 1 && pool !== all ? pool[0] : null;
}
