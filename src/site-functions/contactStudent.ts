/**
 * contactStudent: queue the approved draft after Jordan says yes (ported from
 * Venkat's build, made browser-only).
 *
 * This static site has no server and no messaging provider, so NOTHING reaches
 * a student from here. The draft is put in this tab's outbox with a reference
 * (CSUAC-XXXXXX) and the card changes to "Queued". The result never says
 * sent: it is always {queued:true, sent:false, deliveredToStudent:false}.
 * The channel comes from the record's consent, never from the agent.
 */
import renderScene from './renderScene';
import { findStudent, NOT_ON_CASELOAD } from '@/data/advisors';
import { ledgerFor, queueDraft, saveDraft } from '@/data/outreachLedger';
import { logEvent } from '@/lib/sessionLog';
import { badge } from './advisorBadges';

interface ContactStudentArgs {
    studentId?: string;
    name?: string;
    /** The approved text as shown on the card. Optional: defaults to the drawn draft. */
    body?: string;
    subject?: string;
}

export default function contactStudent(args?: ContactStudentArgs): Record<string, unknown> {
    const e = findStudent(args?.studentId, args?.name);
    if (!e) {
        return {
            ...NOT_ON_CASELOAD,
            queued: false,
            sent: false,
            deliveredToStudent: false,
            note: "Nothing was queued. Say plainly that this student is not on Jordan's caseload.",
        };
    }

    const channel: 'text' | 'email' = e.canText ? 'text' : 'email';
    const prev = ledgerFor(e.id).draft;
    const body = String(args?.body ?? '').trim() || prev?.body || '';
    if (!body) {
        return {
            ok: false,
            queued: false,
            sent: false,
            deliveredToStudent: false,
            error: `There is no draft for ${e.firstName} yet. Call planOutreach first and get Jordan's yes.`,
        };
    }
    const subject = channel === 'email' ? String(args?.subject ?? '').trim() || prev?.subject || e.draft.subject : '';
    saveDraft(e.id, { channel, subject, body });
    const reference = queueDraft(e.id, e.name);

    const result = renderScene({
        template: 'outreach-plan',
        badge: badge('queued'),
        layout: '1',
        fields: {
            name: e.name,
            firstName: e.firstName,
            channel,
            canText: e.canText,
            languageNote: e.languageNote,
            subject,
            body,
            status: 'queued',
            reference,
        },
    });
    logEvent('lifecycle', 'outreach queued in the browser, nothing delivered', { student: e.name, channel, reference });
    if (!result.ok) return { ok: false, queued: true, sent: false, deliveredToStudent: false, reference, error: result.error };

    return {
        ok: true,
        queued: true,
        sent: false,
        deliveredToStudent: false,
        reference,
        id: e.id,
        name: e.name,
        channel,
        note:
            `Say "Queued for ${e.firstName}." and read the reference ${reference} once. It has not reached ` +
            `${e.firstName}: never say sent, texted or emailed, and never call it a demo, a test or a simulation. ` +
            'Then offer the next step in a few words (propose a time, or the next student).',
    };
}
