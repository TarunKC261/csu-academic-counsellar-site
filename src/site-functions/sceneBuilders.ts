/**
 * sceneBuilders — pure functions that turn structured field objects into
 * pipe-delimited DSL rows for parseDSL.
 *
 * Used by renderScene site-function so the agent never has to write raw DSL
 * (and therefore never leaks `===CARDS===` / `badge:` tokens into the TTS
 * stream). The agent calls renderScene({ template, fields, badge? }) with
 * plain JSON; we build the DSL here and hand it to parseDSL.
 */

const EMPTY = '—';

/** Convert a value to a DSL field token. undefined/null/empty → "—". */
function f(v: unknown): string {
    if (v === undefined || v === null) return EMPTY;
    const s = String(v).trim();
    if (s === '') return EMPTY;
    // Pipes and newlines would break the row. Replace defensively.
    return s.replace(/\|/g, '/').replace(/\r?\n/g, ' ');
}

/** Join an array of chip/option strings with semicolons (DSL chip separator). */
function chips(arr: unknown): string {
    if (Array.isArray(arr)) return arr.map((c) => String(c).trim()).filter(Boolean).join(';');
    if (typeof arr === 'string') return arr;
    return '';
}

// ── Per-template builders ───────────────────────────────────────────────────

export interface QuestionCardFields {
    question: string;
    options: string[] | string;
    hint?: string;
    field?: string;
}
export function buildQuestionCard(fields: QuestionCardFields): string {
    // The hint is LLM-authored (contextual examples per problem) since
    // 2026-08-05, so clamp it: a runaway generation must degrade to a
    // truncated hint, never to a broken card. 90 chars fits the mandated
    // "Just say it — for example '…' or '…'." shape with headroom.
    const hint =
        typeof fields.hint === 'string' && fields.hint.length > 90
            ? `${fields.hint.slice(0, 89).trimEnd()}…`
            : fields.hint;
    return `question-card|${f(fields.question)}|${f(chips(fields.options))}|${f(hint)}|${f(fields.field)}`;
}

export interface IncidentDraftFields {
    severity?: 'info' | 'warning' | 'high' | 'critical';
    title: string;
    summary?: string;
    impact?: string;
    resolution?: string;
    number?: string;
    state?: string;
    priority?: string;
    assignedTo?: string;
    assignmentGroup?: string;
    category?: string;
    kb?: boolean;
}
export function buildIncidentDraft(fields: IncidentDraftFields): string {
    const kb = fields.kb ? '1' : EMPTY;
    return `incident-draft|${f(fields.severity ?? 'info')}|${f(fields.title)}|${f(fields.summary)}|${f(fields.impact)}|${f(fields.resolution)}|${f(fields.number ?? 'Draft')}|${f(fields.state ?? 'Draft')}|${f(fields.priority)}|${f(fields.assignedTo)}|${f(fields.assignmentGroup)}|${f(fields.category)}|${kb}`;
}

export interface IncidentCardFields {
    severity?: 'info' | 'warning' | 'high' | 'critical';
    title: string;
    summary?: string;
    impact?: string;
    resolution?: string;
    number?: string;
    state?: string;
    priority?: string;
    assignedTo?: string;
    assignmentGroup?: string;
    category?: string;
    /** ServiceNow `sys_created_on` copied verbatim from the tool result — the
     *  Created column's only source: tool-activity events carry no results, so
     *  a date the DSL drops is a date the client never sees. */
    openedAt?: string;
    /** ServiceNow `sys_updated_on`. Feeds the list table's "Updated" column —
     *  before this was carried, that column was permanently blank because the
     *  11-field row grammar dropped it between renderScene and IncidentTable. */
    updatedAt?: string;
    /** ServiceNow `sys_id`. Lets a row click resolve straight to Update/Get
     *  without a second number→sys_id lookup. */
    sysId?: string;
}
export function buildIncidentCard(fields: IncidentCardFields): string {
    return `incident-card|${f(fields.severity ?? 'info')}|${f(fields.title)}|${f(fields.summary)}|${f(fields.impact)}|${f(fields.resolution)}|${f(fields.number)}|${f(fields.state)}|${f(fields.priority)}|${f(fields.assignedTo)}|${f(fields.assignmentGroup)}|${f(fields.category)}|${f(fields.openedAt)}|${f(fields.updatedAt)}|${f(fields.sysId)}`;
}

export interface InfoCardFields {
    icon?: string;
    title: string;
    body: string;
    cta?: string;
    ctaPhrase?: string;
}
export function buildInfoCard(fields: InfoCardFields): string {
    return `info-card|${f(fields.icon)}|${f(fields.title)}|${f(fields.body)}|${f(fields.cta)}|${f(fields.ctaPhrase)}`;
}

export interface KbSuggestionFields {
    topTitle?: string;
    topSummary?: string;
    topUrl?: string;
    /** Step strings; joined with semicolons. */
    steps?: string[] | string;
    /** Each extra: { title, url }; joined as "title^url" pairs separated by semicolons. */
    extras?: Array<{ title: string; url: string }> | string;
}
export function buildKbSuggestion(fields: KbSuggestionFields): string {
    // A step is normally a string. Some kb_search results (owner-observed 2026-11-10:
    // "External Hard Drive Not Recognized", KB0361530) return OBJECTS here instead,
    // e.g. { title, url } related-article rows when the top article has no resolution
    // steps. String(obj) would print "[object Object]" per the card, so pull a readable
    // text field from an object step (title/text/step/label/name/description) and drop
    // anything that still has no text.
    const stepText = (s: unknown): string => {
        if (s == null) return '';
        if (typeof s === 'string') return s.trim();
        if (typeof s === 'object') {
            const o = s as Record<string, unknown>;
            const v = o.text ?? o.step ?? o.title ?? o.label ?? o.name ?? o.description;
            return typeof v === 'string' ? v.trim() : '';
        }
        return String(s).trim();
    };
    const stepsStr = Array.isArray(fields.steps)
        ? fields.steps.map(stepText).filter(Boolean).join(';')
        : (fields.steps ?? '');
    // Inner delimiter is `^` (not `|`) for the same reason buildResolvePage uses
    // it: f() rewrites every `|` inside a field to `/` to protect the top-level
    // row grammar. Pairs joined with `|` were silently flattened to
    // "Title/https://…" before they ever reached the client, so parseExtras
    // found no delimiter, produced no url, and dropped every entry — the
    // "More articles" list rendered empty 100% of the time.
    const extrasStr = Array.isArray(fields.extras)
        ? fields.extras.map((e) => `${String(e.title).trim()}^${String(e.url).trim()}`).join(';')
        : (fields.extras ?? '');
    return `kb-suggestion|${f(fields.topTitle)}|${f(fields.topSummary)}|${f(fields.topUrl)}|${f(stepsStr)}|${f(extrasStr)}`;
}

export interface ResolvePageResult {
    source: string;
    badge?: string;
    matchPercent?: number | string;
    title: string;
    snippet?: string;
    url?: string;
}
export interface ResolvePageFields {
    problemTitle?: string;
    detectedCategory?: string;
    detectedDevice?: string;
    helperText?: string;
    /** Source labels shown in the "SOURCES SEARCHED" strip. Array or `;`-joined string. */
    sources?: string[] | string;
    /** Results list. Array of {source,badge,matchPercent,title,snippet,url} or a `;`-joined string of pipe rows. */
    results?: ResolvePageResult[] | string;
}
export function buildResolvePage(fields: ResolvePageFields): string {
    const sourcesStr = Array.isArray(fields.sources)
        ? fields.sources.map((s) => String(s).trim()).filter(Boolean).join(';')
        : (fields.sources ?? '');
    // Inner delimiter is `^` (not `|`) because `f()` sanitizes `|` inside a
    // field to `/` to protect the top-level row grammar — using `|` here would
    // destroy every result row before it reached the client.
    const resultsStr = Array.isArray(fields.results)
        ? fields.results
            .map((r) => [
                String(r.source ?? '').trim().toLowerCase(),
                String(r.badge ?? '').trim(),
                r.matchPercent != null ? String(r.matchPercent).trim() : '',
                String(r.title ?? '').trim(),
                String(r.snippet ?? '').trim(),
                String(r.url ?? '').trim(),
            ].join('^'))
            .join(';')
        : (fields.results ?? '');
    return `resolve-page|${f(fields.problemTitle)}|${f(fields.detectedCategory)}|${f(fields.detectedDevice)}|${f(fields.helperText)}|${f(sourcesStr)}|${f(resultsStr)}`;
}

// ── Counselor cards (ported from Venkat's build) ───────────────────────────
// Drawn only by the counselor site functions (getCaseload, getStudentRisk,
// planOutreach, findMeetingSlots, contactStudent). Each is ONE flat row; lists
// inside a field use `^` between columns and `;` between rows. `inner()` keeps
// a value from breaking that grammar: `;` and `^` are encoded as %3B / %5E (the
// card decodes them, so a signal keeps its exact punctuation) and `|` becomes `/`.
function inner(v: unknown): string {
    return String(v ?? '')
        .replace(/%/g, '%25')
        .replace(/;/g, '%3B')
        .replace(/\^/g, '%5E')
        .replace(/\|/g, '/')
        .replace(/\r?\n/g, ' ')
        .trim();
}

/** A written message with paragraphs: newlines travel as the two characters `\n`. */
function multi(v: unknown): string {
    const s = String(v ?? '').trim();
    if (!s) return EMPTY;
    return s.replace(/\|/g, '/').replace(/\r?\n/g, '\\n');
}

export interface CaseloadRowFields {
    id: string;
    name: string;
    year: string;
    score: number;
    band: string;
    headline: string;
    canText: boolean;
    /** '', 'queued', 'proposed' or 'queued,proposed' */
    status?: string;
}
export interface CaseloadListFields {
    flagged: number;
    total: number;
    onTrack: number;
    rows: CaseloadRowFields[];
}
export function buildCaseloadList(fields: CaseloadListFields): string {
    const rows = (fields.rows ?? [])
        .map((r) =>
            [inner(r.id), inner(r.name), inner(r.year), inner(r.score), inner(r.band), inner(r.headline), r.canText ? '1' : '0', inner(r.status)].join('^'),
        )
        .join(';');
    return `caseload-list|${f(fields.flagged)}|${f(fields.total)}|${f(fields.onTrack)}|${f(rows)}`;
}

export interface StudentBriefFields {
    name: string;
    firstName: string;
    year: string;
    major: string;
    campus: string;
    score: number;
    band: string;
    signals: Array<{ kind: string; text: string }>;
    nextStep: string;
    canText: boolean;
    languageNote?: string;
    queuedRef?: string;
    proposedSlot?: string;
}
export function buildStudentBrief(fields: StudentBriefFields): string {
    const signals = (fields.signals ?? []).map((s) => `${inner(s.kind)}^${inner(s.text)}`).join(';');
    return `student-brief|${f(fields.name)}|${f(fields.firstName)}|${f(fields.year)}|${f(fields.major)}|${f(fields.campus)}|${f(fields.score)}|${f(fields.band)}|${f(signals)}|${f(fields.nextStep)}|${fields.canText ? '1' : '0'}|${f(fields.languageNote)}|${f(fields.queuedRef)}|${f(fields.proposedSlot)}`;
}

export interface OutreachPlanFields {
    name: string;
    firstName: string;
    /** 'text' | 'email' */
    channel: string;
    canText: boolean;
    languageNote?: string;
    subject?: string;
    body: string;
    /** 'draft' | 'queued' */
    status: string;
    reference?: string;
}
export function buildOutreachPlan(fields: OutreachPlanFields): string {
    return `outreach-plan|${f(fields.name)}|${f(fields.firstName)}|${f(fields.channel)}|${fields.canText ? '1' : '0'}|${f(fields.languageNote)}|${f(fields.subject)}|${multi(fields.body)}|${f(fields.status)}|${f(fields.reference)}`;
}

export interface SlotPickerFields {
    name?: string;
    firstName?: string;
    /** Slot ids, `YYYY-MM-DDTHH:MM`. */
    slots: string[];
    proposedSlot?: string;
}
export function buildSlotPicker(fields: SlotPickerFields): string {
    const slots = (fields.slots ?? []).map(inner).filter(Boolean).join(';');
    return `slot-picker|${f(fields.name)}|${f(fields.firstName)}|${f(slots)}|${f(fields.proposedSlot)}`;
}

// ── Template registry ───────────────────────────────────────────────────────

export type TemplateName =
    | 'question-card'
    | 'incident-draft'
    | 'incident-card'
    | 'info-card'
    | 'kb-suggestion'
    | 'resolve-page'
    | 'caseload-list'
    | 'student-brief'
    | 'outreach-plan'
    | 'slot-picker';

export const TEMPLATE_BUILDERS: Record<TemplateName, (fields: any) => string> = {
    'question-card': buildQuestionCard,
    'incident-draft': buildIncidentDraft,
    'incident-card': buildIncidentCard,
    'info-card': buildInfoCard,
    'kb-suggestion': buildKbSuggestion,
    'resolve-page': buildResolvePage,
    'caseload-list': buildCaseloadList,
    'student-brief': buildStudentBrief,
    'outreach-plan': buildOutreachPlan,
    'slot-picker': buildSlotPicker,
};

/** Wrap one or more rows + optional badge/layout into a parseable DSL block. */
export function wrapBlock(rows: string[], badge?: string, layout?: string): string {
    const lines: string[] = ['===CARDS==='];
    if (layout) lines.push(`layout: ${layout}`);
    if (badge) lines.push(`badge: ${badge}`);
    lines.push(...rows);
    lines.push('===END===');
    return lines.join('\n');
}
