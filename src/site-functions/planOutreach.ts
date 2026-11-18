/**
 * planOutreach: draw the draft message, send nothing (ported from Venkat's build).
 *
 * The channel is decided here from consent, never by the agent or Jordan:
 * canText false means email, and a text is never drawn or offered. The card
 * says "Draft · not sent" and the result tells Natalie to ask Jordan for a yes.
 * Only after that yes, said out loud or tapped, does contactStudent queue it.
 *
 * The draft is the record's template from the counselor knowledge base, filled
 * with the student's facts. Natalie may pass her own wording (`draft`), e.g.
 * after Jordan asks for changes; the channel still comes from the record.
 */
import renderScene from './renderScene';
import { findStudent, NOT_ON_CASELOAD } from '@/data/advisors';
import { saveDraft } from '@/data/outreachLedger';
import { badge } from './advisorBadges';

interface PlanOutreachArgs {
    studentId?: string;
    name?: string;
    /** Natalie's own wording, in the student's language. Optional. */
    draft?: string;
    /** Email subject. Ignored for a text. */
    subject?: string;
}

/** Strip markdown and placeholders a model sometimes leaves in a draft. */
function clean(s: string): string {
    return s.replace(/\*\*?|__|`/g, '').replace(/\r\n/g, '\n').trim();
}

export default function planOutreach(args?: PlanOutreachArgs): Record<string, unknown> {
    const e = findStudent(args?.studentId, args?.name);
    if (!e) {
        return {
            ...NOT_ON_CASELOAD,
            sent: false,
            nothingHasBeenSent: true,
            note: "Say plainly that this student is not on Jordan's caseload. Do not draft anything.",
        };
    }

    const channel: 'text' | 'email' = e.canText ? 'text' : 'email';
    const own = clean(String(args?.draft ?? ''));
    if (/\[[^\]]+\]/.test(own)) {
        return {
            ok: false,
            sent: false,
            nothingHasBeenSent: true,
            error: 'The draft still has [placeholders]. Fill them from the record, or leave draft empty to use the template.',
        };
    }
    const body = own || e.draft.body;
    const subject = channel === 'email' ? clean(String(args?.subject ?? '')) || e.draft.subject : '';

    saveDraft(e.id, { channel, subject, body });

    const result = renderScene({
        template: 'outreach-plan',
        badge: badge('draft'),
        layout: '1',
        fields: {
            name: e.name,
            firstName: e.firstName,
            channel,
            canText: e.canText,
            languageNote: e.languageNote,
            subject,
            body,
            status: 'draft',
        },
    });
    if (!result.ok) return { ok: false, sent: false, nothingHasBeenSent: true, error: result.error };

    const how = channel === 'email' ? 'an email' : 'a text';
    return {
        ok: true,
        sent: false,
        nothingHasBeenSent: true,
        id: e.id,
        name: e.name,
        channel,
        canText: e.canText,
        subject: subject || null,
        draft: body,
        note:
            `The draft is on screen; do not read it out. Nothing has been sent. Say in one line that it is ${how} for ` +
            `${e.firstName}${channel === 'email' && !e.canText ? ` (${e.firstName} has not agreed to texts)` : ''}, then ` +
            'ask Jordan whether to queue it, and wait for a yes. Call contactStudent only after that yes. Never say sent, ' +
            'texted or emailed.',
    };
}
